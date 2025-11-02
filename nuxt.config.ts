import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@pinia/nuxt", "@nuxt/image", undefined],
  css: ["~/assets/css/main.css"],



  // --- SUNUCU TARAFI (NITRO) ÇÖZÜMÜ ---
  nitro: {
    externals: {
      trace: false,
      inline: [".prisma/client"],
      external: ["@prisma/client"],
    },
    moduleSideEffects: ["@prisma/client"],
    preset: "node-server", // Standalone Node.js sunucusu olarak ayarlar
  },

  // --- İSTEMCİ TARAFI (VITE) ÇÖZÜMÜ ---
  vite: {
    resolve: {
      alias: {
        ".prisma/client/index-browser":
          "@prisma/client/runtime/index-browser.js",
      },
    },
    ssr: {
      noExternal: ["vue", "vue-router"],
    },
    plugins: [tailwindcss()],
  },

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
    },
  },

  image: {
    // Options
    cloudinary: {
      baseURL: "https://res.cloudinary.com/ocn315/image/upload/v1761417908/",
    },
  },
});