import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  // Prevent Tailwind from resetting global styles on host page
  corePlugins: {
    preflight: false, // Disable Tailwind's base reset
  },
  theme: {
    extend: {}
  },
  plugins: []
} satisfies Config;



