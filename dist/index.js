'use strict';

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _webpack2 = require('webpack');

var _webpack3 = _interopRequireDefault(_webpack2);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _webpackLibProgressPlugin = require('webpack/lib/ProgressPlugin');

var _webpackLibProgressPlugin2 = _interopRequireDefault(_webpackLibProgressPlugin);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _memoryFs = require("memory-fs");

var _memoryFs2 = _interopRequireDefault(_memoryFs);

exports['default'] = function () {

  var defaultStatsOptions = {
    colors: _chalk2['default'].supportsColor,
    hash: false,
    timings: false,
    chunks: false,
    chunkModules: false,
    modules: false,
    children: true,
    version: true,
    cached: false,
    cachedAssets: false,
    reasons: false,
    source: false,
    errorDetails: false
  };

  this.webpack = function () {
    var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var _this = this;

    var wp = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
    var customCb = arguments.length <= 2 || arguments[2] === undefined ? function () {} : arguments[2];

    return this.defer(function (value, cb) {

      opts.output = opts.output || {};
      opts.output.path = opts.output && opts.output.path || process.cwd();
      opts.output.filename = opts.output.filename || '[hash].js';

      var done = function done(stats) {

        if (opts.quiet) {
          return;
        }

        var statsOptions = opts.stats || {};

        if (opts.verbose) {
          statsOptions = { colors: _chalk2['default'].supportsColor };
        } else {
          _Object$keys(defaultStatsOptions).forEach(function (key) {
            if (typeof statsOptions[key] === 'undefined') {
              statsOptions[key] = defaultStatsOptions[key];
            }
          });
        }

        _this.log(stats.toString(statsOptions));
      };

      _this.unwrap(function (files) {

        try {
          (function () {

            var _webpack = wp || _webpack3['default'];

            if (!opts.entry) {
              (function () {

                if (!files.length) {
                  cb(new Error('source file not found'));
                }

                var entries = {};

                files.forEach(function (file) {
                  if (_fs2['default'].existsSync(file) && _fs2['default'].lstatSync(file).isDirectory()) {
                    return;
                  }
                  var name = _path2['default'].basename(file, _path2['default'].extname(file));
                  entries[name] = [];
                  entries[name].push(_path2['default'].join(process.cwd(), file));
                });

                opts.entry = entries;
              })();
            }

            if (opts.debug) {
              _this.emit('fly_wp_entry_setup', opts.entry);
            }

            var _opts = _lodash2['default'].cloneDeep(opts);

            if (opts.plugins) {
              _opts.plugins = opts.plugins;
            }

            if (opts.debug) {
              _opts.watch = false;
            }

            var compiler = _webpack(_opts, function (err, stats) {
              if (!opts.watch) {
                if (err || stats.compilation.errors.length) {
                  cb(err || stats.compilation.errors[0]);
                } else {
                  done(stats);
                  cb(null, _chalk2['default'].bold.green('webpack is done'));
                }
              }
              customCb(err, stats);
            });

            if (opts.debug) {
              (function () {
                // hide output in dev mode
                var fs = compiler.outputFileSystem = new _memoryFs2['default']();
                compiler.plugin('after-emit', function (compilation, callback) {
                  var output = {};
                  _Object$keys(compilation.assets).forEach(function (outname) {
                    if (compilation.assets[outname].emitted) {
                      var file_path = fs.join(compiler.outputPath, outname);
                      if (file_path.indexOf('?') !== -1) {
                        file_path = file_path.split('?')[0];
                      }
                      output[outname] = file_path;
                    }
                  });
                  _this.emit('fly_wp_output', output);
                  callback();
                });
              })();
            }

            if (opts.watch) {
              if (!opts.debug) {
                compiler = compiler.compiler;
              }
              _this.log(_chalk2['default'].underline.cyan('webpack is watching for changes'));
            }

            if (!opts.debug) {

              if (opts.progress && !opts.debug) {
                compiler.apply(new _webpackLibProgressPlugin2['default'](function (percentage, msg) {
                  percentage = Math.floor(percentage * 100);
                  msg = percentage + '% ' + msg;
                  if (percentage < 10) {
                    msg = ' ' + msg;
                  }
                  _this.log(_chalk2['default'].bold.yellow('webpack ' + msg));
                }));
              }

              compiler.plugin('done', function (stats) {
                if (opts.watch) {
                  done(stats);
                }
              });
            }
          })();
        } catch (err) {
          cb(err);
        }
      });
    })();
  };
};

module.exports = exports['default'];