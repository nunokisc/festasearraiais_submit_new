module.exports = {
  apps: [
    {
      name: "festasearraiais-submit-new",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/var/www/html/festasearraiais_submit_new",
      env_production: {
        NODE_ENV: "production",
        PORT: 3002,
        NEXT_PUBLIC_BACKOFFICE_API_URL: "https://backoffice-api.festasearraiais.pt",
        NEXT_PUBLIC_MAIN_SITE_URL: "https://festasearraiais.pt",
        NEXT_PUBLIC_APP_URL: "https://adicionar.festasearraiais.pt",
      },
    },
  ],
};
