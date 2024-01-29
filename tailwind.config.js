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
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      animation: {
        "accordion-open": `accordion-open 150ms cubic-bezier(0.87, 0, 0.13, 1)`,
        "accordion-closed": `accordion-closed 150ms cubic-bezier(0.87, 0, 0.13, 1)`,
        "banner-rotate": `banner-rotate 20s linear infinite`,
        "collapsible-open": `collapsible-open 150ms cubic-bezier(0.87, 0, 0.13, 1)`,
        "collapsible-closed": `collapsible-closed 150ms cubic-bezier(0.87, 0, 0.13, 1)`,
        "fade-zoom-in": `fade-zoom-in 300ms cubic-bezier(0.16, 1, 0.3, 1)`,
        "slide-up-and-fade": `slide-up-and-fade 300ms cubic-bezier(0.16, 1, 0.3, 1)`,
        "slide-right-and-fade": `slide-right-and-fade 300ms cubic-bezier(0.16, 1, 0.3, 1)`,
        "slide-down-and-fade": `slide-down-and-fade 300ms cubic-bezier(0.16, 1, 0.3, 1)`,
        "slide-left-and-fade": `slide-left-and-fade 300ms cubic-bezier(0.16, 1, 0.3, 1)`,
        "spin-swap": `spin 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.27)`,
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
        "banner-rotate": {
          from: { transform: "translateX(-975px)" },
          to: { transform: "translateX(-142px)" },
        },
        "collapsible-open": {
          from: { height: 0 },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "collapsible-closed": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: 0 },
        },
        "fade-zoom-in": {
          from: { opacity: 0, transform: "scale(0.9)" },
          to: { opacity: 1, transform: "scale(1)" },
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
    require("tailwindcss-animate"),
    require("@tailwindcss/forms")({
      strategy: "class",
    }),
    plugin(({ addUtilities }) => {
      addUtilities({
        ".HistoryListTrigger[data-state='open'] > .HistoryListTriggerText::before": {
          content: "'Hide Details'",
        },
        ".HistoryListTrigger[data-state='closed'] > .HistoryListTriggerText::before": {
          content: "'Show Details'",
        },
        ".number-input-arrows-hide": {
          "&, &::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
            "-moz-appearance": "textfield",
            "-webkit-appearance": "none",
            margin: 0,
          },
        },
        ".scrollbar-hide": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      });
    }),
  ],
};
