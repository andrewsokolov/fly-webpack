import webpack from 'webpack';
import path from 'path';
import chalk from 'chalk';
import ProgressPlugin from 'webpack/lib/ProgressPlugin';

export default function () {

  let defaultStatsOptions = {
    colors: chalk.supportsColor,
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

  this.webpack = function(opts, wp){

    return this.defer((value, cb) => {

      if (!opts.output.path){
        reject('output.path not defined in Webpack config');
      }

      if (!opts.output.filename){
        opts.output.filename = "[name].entry.js";
      }

      const done = (stats) => {

        let statsOptions = opts.stats || {};

        if (opts.verbose) {
          statsOptions = {colors: chalk.supportsColor};
        } else {
          Object.keys(defaultStatsOptions).forEach(function (key) {
            if (typeof statsOptions[key] === 'undefined') {
              statsOptions[key] = defaultStatsOptions[key];
            }
          });
        }

        this.log(stats.toString(statsOptions));
      };

      this.unwrap((files) => {

         try {

           let _webpack = wp || webpack;

           if (!opts.entry){

             let entries = {};

             files.forEach((file) => {
               let name = path.basename(file, path.extname(file));
               entries[name] = [];
               entries[name].push(path.join(process.cwd(), file));
             });

             opts.entry = entries;

           }

           let compiler = _webpack(opts, (err, stats) => {
             if (!opts.watch) {
               if (err){
                 cb(err);
               } else {
                 done(stats);
                 cb(null, chalk.bold.green('webpack is done'));
               }
             }
           });

           if (opts.watch) {
             compiler = compiler.compiler;
             this.log(chalk.underline.cyan('webpack is watching for changes'));
           }

           if (opts.progress) {
             compiler.apply(new ProgressPlugin((percentage, msg) => {
               percentage = Math.floor(percentage * 100);
               msg = percentage + '% ' + msg;
               if (percentage < 10) {
                 msg = ' ' + msg;
               }
               this.log(chalk.bold.yellow('webpack ' + msg));
             }));
           }

           compiler.plugin('done', (stats) => {
             if (opts.watch && !opts.quiet) {
               done(stats);
             }
           });

         } catch (e) {
           reject(e);
         }
      });
    })();
  };
}
