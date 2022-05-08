export default {
  entry: './email.src.js',
  target: 'node16',
  output: {
    filename: '../../email.js',
    chunkFormat: 'module', // for ESM
    libraryTarget: 'module',
    module: true,
  },
  experiments: {
    outputModule: true,
  },
};