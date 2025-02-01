module.exports = function override(config, env) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "events": require.resolve("events/")
  };
  return config;
};
