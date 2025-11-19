import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";
import { copyFileSync } from "fs";

import dns from "dns";
dns.setDefaultResultOrder("verbatim");

export default () => {
  const baseURL =
    process.env.APP_ENV === "development" ? "/" : "seiv2025/p3/t5/";

  return defineConfig({
    plugins: [
      vue(), 
      vuetify({ autoImport: true }),
      {
        name: 'copy-htaccess',
        closeBundle() {
          try {
            copyFileSync('public/.htaccess', 'dist/.htaccess');
            console.log('✓ .htaccess copied to dist/');
          } catch (e) {
            console.warn('Could not copy .htaccess:', e.message);
          }
        }
      }
    ],

    server: {
      host: "localhost",
      port: 8081,
    },

    base: baseURL,
  });
};
