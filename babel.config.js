// File required for jest, webpack includes different babel config
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        browsers: ['defaults', 'ie >= 11']
      }
    }]
  ],
  plugins: [
    '@babel/plugin-transform-runtime'
  ]
}
