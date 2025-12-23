// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mattar: ["Mattar", "sans-serif"], // Default fallback to sans-serif if Mattar isn't available
      },
    },
  },
  plugins: [],
};
