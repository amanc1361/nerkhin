

/** @type {import('tailwindcss').Config} */
import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        "gray-dark": "#575757",
        "gray-ultra-dark": "#121212",
        // "blue-ultra-dark": "#004b59",
        // "blue-dark": "#0099b7",
         "purple-light": "#eaf0f9",
        "purple-medium": "#4e90e9",
        "purple-dark": "#02367b",
        "purple-ultra-dark": "#001633",
        "gray-light": "#E6E6E6",
        "orange-dark": "#FF8C00",
        "gray-ultra-light": "#F3F3F3",
        "gray-medium": "#ADADAD",
        "white-light": "#EDFBFF",
        // "blue-light": "#f4fdff",
         'blue-ultra-dark': '#083344',
        'blue-dark': '#0E7490',
       'blue-light': '#38BDF8',
        "ORANGE": "#EE8F20", // نام با حروف بزرگ هم مشکلی ندارد
      },
      borderWidth: {
        // کلیدهای عددی به عنوان رشته در نظر گرفته می‌شوند و صحیح هستند
        '1': "1px", // می‌توانید به صورت رشته هم بنویسید که واضح‌تر باشد
      },
      width: {
        // کلیدهای عددی اینجا هم مشکلی ندارند
        '748': "748px", // بهتر است کلیدها رشته باشند برای جلوگیری از هرگونه ابهام
        '513': "513px",
        '465': "465px",
        '358': "358px",
        '179': "179px",
        '175': "175px",
      },
      height: {
        '48': "48px",
        '56': "56px",
        '96': "96px",
        '175': "175px",
        '249': "249px",
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
          const newUtilities = {
        ".h-calc": {
          height: "calc(50vh - 61px)",
        },
      };
      addUtilities(newUtilities);
    }),
  ],
};

export default config;