"use client";

export default function AboutPage() {
  return (
    <div className="px-4 py-12 max-w-5xl mx-auto space-y-12">

      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          About RentFlow
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          A simple, smart way to manage tenants, rents, and reminders.
        </p>
      </div>

      {/* What is RentFlow */}
      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          What is RentFlow?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          RentFlow is a modern rent management system designed for landlords
          and property owners to track tenants, monthly rent payments, overdue
          amounts, and agreement timelines — all in one place.
        </p>
      </section>

      {/* Features */}
      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Key Features
        </h2>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
          {[
            "Tenant & agreement management",
            "Monthly rent tracking",
            "Pending & overdue rent detection",
            "Grace period handling",
            "Rent increase automation",
            "WhatsApp rent reminders",
            "Dashboard analytics & charts",
            "Dark mode friendly UI",
          ].map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2"
            >
              <span className="text-indigo-500 font-bold">•</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Why RentFlow */}
      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Why RentFlow?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          Managing rents manually can be time-consuming and error-prone.
          RentFlow helps you stay organized, reduces follow-up stress,
          and gives you clear visibility into your rental income.
        </p>
      </section>

   {/* DEVELOPER SECTION */}
<div className="mt-12">
  <div className="max-w-xl mx-auto text-center rounded-2xl border bg-white dark:bg-gray-900 p-6 shadow-sm">
    <p className="text-xs uppercase tracking-wider text-gray-500">
      Designed & Developed By
    </p>

    <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
      Asif Ansari
    </h3>

    <a
      href="mailto:asifnasimansari10@gmail.com"
      className="mt-1 inline-block text-sm text-indigo-600 hover:underline"
    >
      asifnasimansari10@gmail.com
    </a>

    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
      Full Stack Developer · React · Next.js · Node · MongoDB
    </p>
  </div>
</div>

    </div>
  );
}
