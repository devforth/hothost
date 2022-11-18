module.exports = {
  
  content: ["./**/*.{html,js}"],
  theme: {
    extend: {},
    screens: {
      'mobile': {'max': '640px'},
    },
  },
  darkMode: 'class',
  plugins: [
    require('@tailwindcss/forms'),
    require('flowbite/plugin'),
    require('@tailwindcss/typography'),
  ],
}