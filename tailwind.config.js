/* eslint-disable @typescript-eslint/no-var-requires */

const defaultTheme = require("tailwindcss/defaultTheme");
const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        "accordion-open": `accordion-open 150ms cubic-bezier(0.87, 0, 0.13, 1)`,
        "accordion-closed": `accordion-closed 150ms cubic-bezier(0.87, 0, 0.13, 1)`,
        "collapsible-open": `collapsible-open 150ms cubic-bezier(0.87, 0, 0.13, 1)`,
        "collapsible-closed": `collapsible-closed 150ms cubic-bezier(0.87, 0, 0.13, 1)`,
        "slide-up-and-fade": `slide-up-and-fade 400ms cubic-bezier(0.16, 1, 0.3, 1)`,
        "slide-right-and-fade": `slide-right-and-fade 400ms cubic-bezier(0.16, 1, 0.3, 1)`,
        "slide-down-and-fade": `slide-down-and-fade 400ms cubic-bezier(0.16, 1, 0.3, 1)`,
        "slide-left-and-fade": `slide-left-and-fade 400ms cubic-bezier(0.16, 1, 0.3, 1)`,
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": `conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))`,
        "site-bg": "url('/site-bg.svg')",
        "site-bg-2": "url('/site-bg-2.svg')",
        squiggle: "url('/squiggle.svg')",
      },
      fontFamily: {
        sans: ["Jost", ...defaultTheme.fontFamily.sans],
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
        "collapsible-open": {
          from: { height: 0 },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "collapsible-closed": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: 0 },
        },
        "slide-up-and-fade": {
          from: { opacity: 0, transform: "translateY(2px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "slide-right-and-fade": {
          from: { opacity: 0, transform: "translateX(-2px)" },
          to: { opacity: 1, transform: "translateX(0)" },
        },
        "slide-down-and-fade": {
          from: { opacity: 0, transform: "translateY(-2px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "slide-left-and-fade": {
          from: { opacity: 0, transform: "translateX(2px)" },
          to: { opacity: 1, transform: "translateX(0)" },
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
