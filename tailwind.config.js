/* eslint-disable @typescript-eslint/no-var-requires */
const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "bg-indigo-400/10",
    "text-indigo-400",
    "bg-blue-400/10",
    "text-blue-400",
    "bg-emerald-400/10",
    "text-emerald-400",
    "border-rose-500",
    "border-emerald-500",
    "border-l-8",
  ],
  theme: {
    extend: {
      animation: {
        "accordion-open": `accordion-open 150ms cubic-bezier(0.87, 0, 0.13, 1)`,
        "accordion-closed": `accordion-closed 150ms cubic-bezier(0.87, 0, 0.13, 1)`,
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": `conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))`,
        "site-bg": "url('/site-bg.svg')",
        "site-bg-2": "url('/site-bg-2.svg')",
        squiggle: "url('/squiggle.svg')",
      },
      fontFamily: {
        sans: ["Jost", "sans-serif"],
      },
      keyframes: {
        "accordion-open": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-closed": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        ".HistoryListTrigger[data-state='open'] > .HistoryListTriggerText::before":
          {
            content: "'Hide Details'",
          },
        ".HistoryListTrigger[data-state='closed'] > .HistoryListTriggerText::before":
          {
            content: "'Show Details'",
          },
      });
    }),
  ],
};
