const plugin = require("tailwindcss/plugin");

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
    screens: {
      mobile: { max: "640px" },
    },
  },
  darkMode: "class",
  plugins: [
    require("@tailwindcss/forms"),
    require("flowbite/plugin"),
    require("@tailwindcss/typography"),
  ],
};
