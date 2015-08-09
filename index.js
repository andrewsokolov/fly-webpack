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

  this.webpack = function(opts, wp, customCb = () => {}){

    return this.defer((value, cb) => {

      opts.output.path = opts.output.path || process.cwd();
      opts.output.filename = opts.output.filename || '[hash].js';

      const done = (stats) => {

        if (opts.quiet){
          return;
        }

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

             if (!files.length){
               cb('source file not found');
             }

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
             customCb(err, stats);
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
             if (opts.watch) {
               done(stats);
             }
           });

         } catch (err) {
           cb(err);
         }
      });
    })();
  };
}
