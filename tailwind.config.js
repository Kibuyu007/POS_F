/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#b4aca2", // Soft greyish background (Body)
        secondary: "#FFFFFF", // Bright white (Sections, cards)
        accent: "#EAEAEA", // Light gray (Borders, slight contrast)
        textPrimary: "#000000", // Pure black text
        textSecondary: "#4A4A4A", // Slightly faded black text
        highlight: "#22C55E", // Shining green for numbers & stats
        black: "#000000", // Pure black for buttons
        glassBlack: "rgba(0,0,0,0.6)",
        buttonText: "#FFFFFF", // White text on buttons
        Yellow: "#ffd740",
        GreenText: "#00c853",
        totallyBlue: "#0d47a1",
        grey: "#d6d6d6",
        lightGreen: "#1b5e20",
      },
      screens: {
        xs: "400px",  // Extra small screens (phones)
        sm: "640px",  // Small screens (larger phones)
        md: "768px",  // Medium screens (tablets)
        lg: "1024px", // Large screens (laptops)
        xl: "1280px", // Extra large screens (desktops)
        "2xl": "1536px", // Bigger screens
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
  ],
}

