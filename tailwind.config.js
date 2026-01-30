/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#6B7280',
        background: '#F5F7FA',
        surface: '#FFFFFF',
        text: '#111827',
        muted: '#6B7280',
        border: '#E5E7EB',
        error: '#EF4444',
      },
    },
  },
  plugins: [],
}
