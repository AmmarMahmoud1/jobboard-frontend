/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0F4E7D",
          hover: "#0C3E64",
          soft: "#EAF3F9",
        },
        app: {
          bg: "#F7FAFC",
          surface: "#FFFFFF",
          border: "#E2E8F0",
          text: "#0F172A",
          muted: "#64748B",
        },
        state: {
          success: "#16A34A",
          danger: "#DC2626",
          warning: "#D97706",
        },
      },
      boxShadow: {
        soft: "0 8px 30px rgba(15, 23, 42, 0.06)",
      },
      borderRadius: {
        xl2: "1rem",
        xl3: "1.5rem",
      },
    },
  },
  plugins: [],
};