module.exports = {
  entry: './src/frontend/index.jsx',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  output: {
    path: __dirname + '/public/javascripts',
    filename: 'ar-bundle.js'
  }
};
