module.exports = {
    extends: ["airbnb-base", "prettier"],
    rules: {
      quotes: ["error", "double"]
    },
    globals: { swal: true },
    env: {
      browser: true,
      node: true
    }
  };  