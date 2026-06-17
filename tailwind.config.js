/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        ink: {
          50: "#faf7f2",
          100: "#f5efe6",
          200: "#ebe0cc",
          300: "#dcc8a6",
          400: "#ccac7a",
          500: "#bf935c",
          600: "#b07d4c",
          700: "#93633f",
          800: "#785138",
          900: "#634431",
          950: "#3d2c1f",
        },
        brush: {
          50: "#fdf3f2",
          100: "#fce4e2",
          200: "#f9cdca",
          300: "#f4aaa4",
          400: "#eb7b72",
          500: "#de554a",
          600: "#c9392e",
          700: "#a92d24",
          800: "#8b2e20",
          900: "#742c22",
          950: "#3f140e",
        },
      },
      boxShadow: {
        paper:
          "0 1px 2px rgba(61, 44, 31, 0.04), 0 8px 24px -8px rgba(61, 44, 31, 0.08), 0 24px 48px -16px rgba(61, 44, 31, 0.06)",
      },
      fontFamily: {
        serif: [
          '"Noto Serif SC"',
          '"STSong"',
          '"SimSun"',
          '"宋体"',
          "serif",
        ],
        sans: [
          '"Noto Sans SC"',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
