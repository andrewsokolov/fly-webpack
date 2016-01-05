import webpack from 'webpack'
import path from 'path'
import FileSystem from "fs"
import chalk from 'chalk'
import ProgressPlugin from 'webpack/lib/ProgressPlugin'
import _ from 'lodash'
import MemoryFileSystem from "memory-fs"

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
  }

  this.webpack = function(opts = {}, wp = false, customCb = () => {}){

    return this.defer((value, cb) => {

      opts.output = opts.output || {}
      opts.output.path = opts.output && opts.output.path || process.cwd()
      opts.output.filename = opts.output.filename || '[hash].js'

      const done = (stats) => {

        if (opts.quiet){
          return
        }

        let statsOptions = opts.stats || {}

        if (opts.verbose) {
          statsOptions = {colors: chalk.supportsColor}
        } else {
          Object.keys(defaultStatsOptions).forEach(function (key) {
            if (typeof statsOptions[key] === 'undefined') {
              statsOptions[key] = defaultStatsOptions[key]
            }
          })
        }

        this.log(stats.toString(statsOptions))
      }

      this.unwrap((files) => {

         try {

           let _webpack = wp || webpack

           if (!opts.entry) {

             if (!files.length) {
               cb(new Error('source file not found'))
             }

             let entries = {}

             files.forEach((file) => {
               if (FileSystem.existsSync(file) && FileSystem.lstatSync(file).isDirectory()) {
                 return
               }
               let name = path.basename(file, path.extname(file))
               entries[name] = []
               entries[name].push(path.join(process.cwd(), file))
             })

             opts.entry = entries

           }

           if (opts.debug) {
             this.emit('fly_wp_entry_setup', opts.entry)
           }

           let _opts = _.cloneDeep(opts)

           if (opts.plugins) {
               _opts.plugins = opts.plugins
           }

           if (opts.debug) {
             _opts.watch = false
           }

           let compiler = _webpack(_opts, (err, stats) => {
             if (!opts.watch) {
               if (err || stats.compilation.errors.length) {
                 cb(err || stats.compilation.errors[0])
               } else {
                 done(stats)
                 cb(null, chalk.bold.green('webpack is done'))
               }
             }
             customCb(err, stats)
           })

           if (opts.debug) {
             // hide output in dev mode
             let fs = compiler.outputFileSystem = new MemoryFileSystem()
             compiler.plugin('after-emit', (compilation, callback) => {
               let output = {}
               Object.keys(compilation.assets).forEach(function (outname) {
                 if (compilation.assets[outname].emitted) {
                   let file_path = fs.join(compiler.outputPath, outname)
                   if (file_path.indexOf('?') !== -1) {
                     file_path = file_path.split('?')[0]
                   }
                   output[outname] = file_path
                 }
               })
               this.emit('fly_wp_output', output)
               callback()
             })
           }

           if (opts.watch) {
             if (!opts.debug) {
                compiler = compiler.compiler
             }
             this.log(chalk.underline.cyan('webpack is watching for changes'))
           }

           if (!opts.debug) {

             if (opts.progress && !opts.debug) {
               compiler.apply(new ProgressPlugin((percentage, msg) => {
                 percentage = Math.floor(percentage * 100)
                 msg = percentage + '% ' + msg
                 if (percentage < 10) {
                   msg = ' ' + msg
                 }
                 this.log(chalk.bold.yellow('webpack ' + msg))
               }))
             }

             compiler.plugin('done', (stats) => {
               if (opts.watch) {
                 done(stats)
               }
             })

           }

         } catch (err) {
           cb(err)
         }
      })
    })()
  }
}
