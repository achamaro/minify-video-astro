import icon from "@achamaro/tailwindcss-iconify-icon";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#C2BBA2",
          light: "#D4CFBE",
          dark: "#ABA181",
        },
        accent: "#776065",
      },
    },
  },
  plugins: [icon()],
};
