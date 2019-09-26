const webpack = require('webpack')
const path = require('path')
const isBuild = (process.env.npm_lifecycle_event || '').startsWith('build')

const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const MomentLocalesPlugin = require('moment-locales-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const ManifestPlugin = require('webpack-manifest-plugin')

const giveComponents = [
  'app/cart/cart.component.js',
  'app/checkout/checkout.component.js',
  'app/thankYou/thankYou.component.js',
  'app/productConfig/productConfig.component.js',
  'app/signIn/signIn.component.js',
  'app/searchResults/searchResults.component.js',
  'app/profile/yourGiving/yourGiving.component.js',
  'app/profile/profile.component.js',
  'app/profile/receipts/receipts.component.js',
  'app/profile/payment-methods/payment-methods.component.js',
  'app/designationEditor/designationEditor.component.js',
  'assets/scss/styles.scss'
]

const brandedComponents = [
  'app/branded/branded-checkout.component.js',
  'assets/scss/branded-checkout.scss'
]

const sharedConfig = {
  mode: isBuild ? 'production' : 'development',
  devtool: 'source-map',
  entry: {},
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].min.css',
      disable: !isBuild
    }),
    new CopyWebpackPlugin([
      {
        context: 'src',
        from: '**/*.+(eot|png|svg|ttf|woff)',
        to: '[path][name].[ext]'
      },
      'unsupportedBrowser.html',
      'branded-checkout.html'
    ]),
    new webpack.EnvironmentPlugin({
      TRAVIS_COMMIT: 'development'
    }),
    // To strip all locales except “en”
    new MomentLocalesPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env', { modules: false }]],
            plugins: [
              '@babel/plugin-transform-runtime',
              'angularjs-annotate'
            ]
          }
        }]
      },
      {
        test: /\.html$/,
        use: [
          `ngtemplate-loader?relativeTo=${path.resolve(__dirname, './src')}/`,
          'html-loader'
        ]
      },
      {
        test: /\.s?[ac]ss$/,
        include: path.resolve(__dirname, './src/assets'),
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader?-url',
          'sass-loader?sourceMap'
        ]
      },
      {
        test: /\.s?[ac]ss$/,
        exclude: path.resolve(__dirname, './src/assets'),
        use: [
          'style-loader',
          'css-loader?sourceMap',
          'sass-loader?sourceMap'
        ]
      }
    ]
  },
  optimization: {
    usedExports: true
  }
}

const devServer = {
  https: true,
  historyApiFallback: {
    rewrites: [{ from: /\/(?!test-release).+\.html/, to: '/index.html' }]
  },
  proxy: {
    '/bin': {
      target: 'https://give-stage2.cru.org',
      changeOrigin: true
    },
    '/content': {
      target: 'https://give-stage2.cru.org',
      changeOrigin: true
    },
    '/etc': {
      target: 'https://give-stage2.cru.org',
      changeOrigin: true
    },
    '/designations': {
      target: 'https://give-stage2.cru.org',
      changeOrigin: true
    }
  },
  port: 9000,
  public: 'localhost.cru.org:9000'
}

module.exports = (env = {}) => [
  // Manifest Loader build
  {
    ...sharedConfig,
    entry: {
      ...(isBuild ? {
        'give.loader': 'loaders/give.js',
        'branded-checkout.loader': 'loaders/branded.js',
        'give.v2': giveComponents,
        'branded-checkout.v2': brandedComponents
      } : {
        'dev.loader': 'loaders/dev.js',
        'main.v2': 'app/main/main.component.js'
      })
    },
    output: {
      filename (chunkData) {
        return ['dev.loader', 'give.loader', 'branded-checkout.loader'].includes(chunkData.chunk.name)
          ? '[name].js' : '[name].[contenthash].js'
      },
      path: path.resolve(__dirname, 'dist')
    },
    plugins: [
      ...sharedConfig.plugins,
      new BundleAnalyzerPlugin({
        analyzerMode: env.analyze ? 'static' : 'disabled'
      }),
      new ManifestPlugin({
        // Don't include assets or map files in the manifest
        filter: file => file.isChunk && !/.*\.map$/.test(file.name),
        seed: {
          'fontawesome.css': '//give.cru.org/css/fontawesome.css'
        }
      })
    ],
    optimization: {
      usedExports: true,
      splitChunks: {
        filename: '[name].[contenthash].js',
        chunks (chunk) {
          // Don't chunk loader files
          return !['dev.loader', 'give.loader', 'branded-checkout.loader'].includes(chunk.name)
        },
        cacheGroups: {
          angular: {
            test: /[\\/]node_modules[\\/]angular[\\/]/,
            name: 'angular',
            chunks: 'all'
          }
        }
      }
    },
    devServer
  },
  // Legacy build (single big file)
  {
    ...sharedConfig,
    entry: {
      give: giveComponents,
      'branded-checkout': brandedComponents
    },
    plugins: [
      ...sharedConfig.plugins,
      new BundleAnalyzerPlugin({
        analyzerMode: env.analyze ? 'static' : 'disabled'
      })
    ]
  }
]
