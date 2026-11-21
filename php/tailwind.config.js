/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.php", "./admin/*.php"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0A3BC4",
          50: "#EEF3FF",
          100: "#DCE7FF",
          200: "#B9CDFF",
          300: "#8FABF7",
          400: "#6C8FE6",
          500: "#3A63D6",
          600: "#0A3BC4",
          700: "#0A32A2",
          800: "#0B2B80",
          900: "#0D2664",
        },
        navy: "#14213D",
        muted: "#4A5878",
        accent: "#FFD21F",
        canvas: "#F4F6FB",
        line: "#E5EAF5",
        field: "#C9D3EA",
        success: "#1B6B3A",
        warning: "#7A4A1E",
        danger: "#B42318",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20, 33, 61, 0.04), 0 8px 24px rgba(20, 33, 61, 0.06)",
      },
      borderRadius: {
        xl: "14px",
      },
    },
  },
  plugins: [],
};
