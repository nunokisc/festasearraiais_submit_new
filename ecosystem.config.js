module.exports = {
  apps: [
    {
      name: "festasearraiais-submit-new",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/var/www/html/festasearraiais/festasearraiais_submit_new",
      env_production: {
        NODE_ENV: "production",
        PORT: 3009
      },
    },
  ],
};
