  require.config({
    // This needs to be the absolute path of the deployed library.
    baseUrl: '{{DEPLOYED_BASE_DIR}}'
  });


  // An exposed wrapper around the Loader
  // Which provides immediate access to the client.
  // Saves client-provided config object, and passes
  // to the 'real' Loader class.
  aeris.Loader = function() {};
  aeris.Loader.load = function(config) {
    var loaderConfig = config;

    // Generate vendor library modules
    require(['vendor/config'], function() {
      // Load the 'real' Loader
      // And make it run.
      require(['aeris/loader/loader'], function(Loader) {
        var loader = new Loader();
        loader.load(loaderConfig);
      });
    });
  };
})(window.aeris);