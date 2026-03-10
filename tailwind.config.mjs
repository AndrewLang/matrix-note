/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{html,ts}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ecf4ff",
          100: "#d6e8ff",
          200: "#aecfff",
          300: "#82b2ff",
          400: "#4c8bff",
          500: "#1f64ff",
          600: "#124be0",
          700: "#0a37b4",
          800: "#082883",
          900: "#081f61"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
