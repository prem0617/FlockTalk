/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";

export default {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}", // Adjust this path according to your project structure
  ],
  theme: {
    extend: {
      fontFamily: {
        "dancing-script": ['"Dancing Script"', "cursive"],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["corporate"], // Specify the corporate theme
  },
};
