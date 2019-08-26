// File required for jest, webpack includes different babel config
module.exports = {
  presets: [
    '@babel/preset-env'
  ],
  plugins: [
    '@babel/plugin-transform-runtime'
  ]
}
