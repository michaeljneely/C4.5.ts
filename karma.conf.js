let webpackConfig = require('./webpack.config')();
webpackConfig.module.rules.push({
  test: /\.ts$/,
  loader: 'istanbul-instrumenter-loader',
  exclude: /\.spec\.ts$/
});

module.exports = function (config) {
  var configuration = {
    basePath: '',
    frameworks: ['mocha', 'sinon-chai'],
    plugins: [
      require('karma-mocha'),
      require('karma-sinon-chai'),
      require('karma-chrome-launcher'),
      require('karma-coverage-istanbul-reporter'),
      require('karma-webpack'),
      require('karma-coveralls'),
      require('karma-coverage')
    ],
    files: [
      { pattern: './src/**/*.spec.ts', watched: false }
    ],
    preprocessors: {
      './src/**/*.ts': ['webpack']
    },
    mime: {
      'text/x-typescript': ['ts']
    },
    webpack: {
      module: webpackConfig.module,
      resolve: webpackConfig.resolve
    },
    coverageIstanbulReporter: {
      reports: [ 'html', 'lcovonly', 'text-summary' ],
      fixWebpackSourcePaths: true
    },
    remapIstanbulReporter: {
      reports: {
        html: 'coverage',
        lcovonly: './coverage/coverage.lcov',
        "text-summary": ''
      }
    },
    customLaunchers: {
      ChromeTravisCi: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },
    reporters: ['progress', 'coverage-istanbul', 'coverage'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['Chrome'],
    singleRun: true
  };
  if (process.env.TRAVIS) {
    configuration.reporters.push('coveralls');
  }
  config.set(configuration);
};
