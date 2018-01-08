exports.config = {
  bundles: [
    { components: ['my-app', 'app-home'] },
    { components: ['app-lab'] },
    { components: ['app-menu', 'app-menu-item'] }
  ],
  collections: [
    { name: '@stencil/router' }
  ]
};

exports.devServer = {
  root: 'www',
  watchGlob: '**/**'
};
