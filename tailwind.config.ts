/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    // Add all potential bus color classes to safelist to ensure they're not purged
    {
      pattern:
        /bg-(blue|green|purple|yellow|orange|pink|indigo|gray|red)-(600)/,
    },
  ],
  theme: {
    extend: {
      screens: {
        xs: "320px", // Extra small screens (small phones)
      },
    },
  },
  plugins: [],
};
