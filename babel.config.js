// File required for jest, webpack includes different babel config
module.exports = {
  presets: [
    [
      '@babel/preset-env', {
        targets: {
          browsers: ['last 1 version', 'ie >= 11']
        }
      },
    ],
    '@babel/preset-react'
  ],
  plugins: [
    '@babel/plugin-transform-runtime'
  ]
}
