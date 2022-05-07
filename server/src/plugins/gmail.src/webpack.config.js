export default {
  entry: './gmail.src.js',
  target: 'node',
  output: {
    filename: '../../gmail.js',
    chunkFormat: 'module', // for ESM
    libraryTarget: 'module',
    module: true,
  },
  experiments: {
    outputModule: true,
  },
  // optimization: {
  //   usedExports: true,
  // },
};