const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { HotModuleReplacementPlugin } = require('webpack');
const path = require('path');

let defaultLoaders = {};

defaultLoaders.babel = {
  loader: 'babel-loader',
  options: {
    presets: [
      '@babel/preset-env',
      '@babel/preset-react',
      '@babel/preset-typescript'
    ],
    plugins: [
      '@babel/plugin-proposal-object-rest-spread',
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-async-generator-functions'
    ]
  }
};

defaultLoaders.postCss = {
  loader: 'postcss-loader',
  options: {
    plugins: (loader) => [
      require('postcss-preset-env')()
    ]
  }
}

let defaultRules = (config, props) => {
  let rules = {};
  rules.css = () => ({
    test: /\.css$/,
    exclude: /\.module\.css$/,
    use: [
      props.dev ? 'style-loader' : MiniCssExtractPlugin.loader,
      'css-loader',
      defaultLoaders.postCss
    ]
  })

  rules.cssModules = () => ({
    test: /\.module\.css$/,
    use: [
      rules.css().use[0],
      {
        loader: 'css-loader',
        options: {
          modules: true,
          localIdentName: props.dev ? '[name]__[local]--[hash:base64:5]' : '[hash:base64:8]'
        }
      },
      rules.css().use[2]
    ]
  });

  rules.scss = (options) => ({
    test: /\.s[ac]ss$/,
    exclude: /\.module\.s[ac]ss$/,
    use: [
      ...rules.css().use,
      { loader: 'sass-loader', options }
    ]
  });

  rules.scssModules = (options) => ({
    test: /\.module\.s[ac]ss$/,
    use: [
      ...rules.cssModules().use,
      { loader: 'sass-loader', options }
    ]
  });

  rules.js = (options = {}) => ({
    test: /\.jsx?$/,
    exclude: /node_modules/,
    loader: defaultLoaders.babel,
    ...options
  });

  rules.ts = (options = {}) => ({
    test: /\.[tj]sx?$/,
    exclude: /node_modules/,
    loader: defaultLoaders.babel,
    ...options
  });

  rules.html = (options = {}) => ({
    test: /\.html$/,
    loader: 'html-loader',
    options: {
      minimize: !props.dev
    },
    ...options
  });

  rules.files = (options = {}) => ({
    test: /\.(png|jpg|gif|svg|eot|ttf)$/,
    loader: 'file-loader',
    ...options
  });

  rules.fonts = (options = {}) => ({
    test: /\.(woff(2)?|eot|ttf)$/,
    loader: 'file-loader',
    options: {
      name: '[name].[ext]',
      outputPath: 'fonts/'
    },
    ...options
  })

  return rules;
};

const buildConfig = configuration => (env, argv) => {
  let props = {
    dev: !(env && env.production),
    defaultLoaders,
  }

  let config = {
    mode: props.dev ? 'development' : 'production',
    entry: path.resolve(__dirname, 'src', 'index.js'),
    target: 'web',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: props.dev ? '[name].js' : '[name].[chunkhash:8].js',
      publicPath: '/'
    },
    module: {
      rules: []
    },
    resolve: {
      extensions: [ '.jsx', '.js', '.wasm', '.mjs', '.json' ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: props.dev ? '[name].css' : '[name].[chunkhash:8].css'
      }),
      props.dev && new HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin()
    ].filter(Boolean),
    devtool: props.dev && 'cheap-module-eval-source-map',
    devServer: props.dev && {
      // contentBase: './dist',
      hot: true,
      port: 8822,
      compress: true,
      historyApiFallback: true
      // open: true
    }
  }
  props.defaultRules = defaultRules(config, props);

  return configuration(config, props);
}


module.exports = {
  buildConfig,
  defaultLoaders,
  defaultRules,
}
