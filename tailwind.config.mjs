/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./styles/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["system-ui", "ui-sans-serif", "sans-serif"]
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(circle at top, rgba(168,85,247,0.25), transparent 60%)",
        "gradient-glass": "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.7))"
      }
    }
  },
  plugins: []
};

