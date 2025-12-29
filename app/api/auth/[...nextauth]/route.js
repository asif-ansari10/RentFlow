import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {},
      async authorize(credentials) {
        await connectDB();

        const { email, password } = credentials;
        if (!email || !password) return null;

        const user = await User.findOne({ email });
        if (!user) return null;

        if (!user.password) {
          throw new Error(
            "Please login using Google first. Then set password inside profile."
          );
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return {
          id: user._id.toString(), // ✅ Mongo ID
          email: user.email,
          name: user.name,
          provider: "credentials",
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account }) {
      await connectDB();

      // 🔐 Google login handling
      if (account.provider === "google") {
        let dbUser = await User.findOne({ email: user.email });

        if (!dbUser) {
          dbUser = await User.create({
            name: user.name,
            email: user.email,
            password: null,
            googleUser: true,
          });
        }

        // ✅ IMPORTANT: attach MongoDB _id
        user.id = dbUser._id.toString();
        user.provider = "google";
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      // Initial login
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.provider = user.provider;
      }

      // 🔥 THIS IS WHAT FIXES NAME UPDATE WITHOUT LOGOUT
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.provider = token.provider;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
