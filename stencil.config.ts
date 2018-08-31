import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
  plugins: [sass()]
};

// exports.devServer = {
//   root: 'www',
//   watchGlob: '**/**'
// };
