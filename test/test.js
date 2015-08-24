import { test } from "tape"
import { defer } from 'fly-util'
import plugin from '../dist'
import path from 'path'
import _ from 'lodash'
import 'tape-chai'

const es5 = './test/fixtures/es5.js'
const es6 = './test/fixtures/es6.js'
const ENTRY_SETUP_EVENT = "fly_wp_entry_setup"
const OUTPUT_EVENT = "fly_wp_output"

let fly = {}
plugin.call(fly)

let webpack = ({options = {}, files = [], log = () => {}, emit = () => {}, customCb} = {}) => {

  if (options){
    _.assign(options, {
      debug: true
    })
  }

  return fly.webpack.call({
    defer,
    log,
    emit,
    unwrap: cb => cb(files)
  }, options, false, customCb)
}

test('single run mode', (t) => {

  t.test("should throws error if files array is empty and entry not defined", (t) => {
    t.plan(2)
    webpack().catch((err) => {
      t.instanceOf(err, Error, 'should throws error!')
      t.equal(err.message, 'source file not found')
    })
  })

  t.test("should throws error if file not exists", (t) => {
    t.plan(2)
    webpack({
      files: ['not_exists.js']
    }).catch((err) => {
      t.instanceOf(err, Error, 'should throws error!')
      t.include(err.message, 'Module not found')
    })
  })

  t.test("should pass files array is not empty", (t) => {
    t.plan(1)
    webpack({
      files: [es5]
    }).then((data) => {
      t.include(data, 'webpack is done')
    })
  })

  t.test("should pass if entry is defined", (t) => {
    t.plan(1)
    webpack({
      options: {
        entry: es5
      }
    }).then((data) => {
      t.include(data, 'webpack is done')
    })
  })

  t.test("should throws error if appropriate loader not defined", (t) => {
    t.plan(2)
    webpack({
      files: [es6]
    }).catch((err) => {
      t.instanceOf(err, Error, 'should throws error!')
      t.include(err.message, 'Module parse failed')
    })
  })

  t.test("should pass if appropriate loader defined", (t) => {
    t.plan(1)
    webpack({
      options: {
        entry: es6,
        module: {
          loaders: [
            {
              test: /\.js$/,
              exclude: /(node_modules|bower_components)/,
              loader: 'babel'
            }
          ]
        }
      }
    }).then((data) => {
      t.include(data, 'webpack is done')
    })
  })

  t.test("should call custom callback", (t) => {
    t.plan(2)
    webpack({
      options: {
        entry: es5
      },
      customCb: (err, stats) => {
        t.isNull(err)
        t.isObject(stats)
      }
    })
  })

  t.test("should pass single entry setup", (t) => {
    t.plan(2)
    webpack({
      files: [es6],
      options: {
        entry: es5,
        output: {
          filename: '[name].js'
        }
      },
      emit: (event, data) => {
        if (event === ENTRY_SETUP_EVENT){
          t.equal(es5, data)
        }
        if (event === OUTPUT_EVENT){
          t.deepEqual(['main.js'], Object.keys(data))
        }
      }
    })
  })

  t.test("should pass single file setup", (t) => {
    t.plan(2)
    webpack({
      files: [es6],
      options: {
        output: {
          filename: '[name].js'
        }
      },
      emit: (event, data) => {
        if (event === ENTRY_SETUP_EVENT){
          t.deepEqual({es6: [ path.join(process.cwd(), es6) ]}, data)
        }
        if (event === OUTPUT_EVENT){
          t.deepEqual(['es6.js'], Object.keys(data))
        }
      }
    })
  })

  t.test("should pass multi files setup", (t) => {
    t.plan(2)
    webpack({
      files: [es5, es6],
      options: {
        output: {
          filename: '[name].js'
        }
      },
      emit: (event, data) => {
        if (event === ENTRY_SETUP_EVENT){
          t.deepEqual({
            es5: [ path.join(process.cwd(), es5) ],
            es6: [ path.join(process.cwd(), es6) ]
          }, data)
        }
        if (event === OUTPUT_EVENT){
          t.deepEqual(['es5.js', 'es6.js'], Object.keys(data))
        }
      }
    })
  })
})

test('watch run mode', (t) => {
  t.test("should not resolve defer in watch mode", (t) => {
    t.plan(1)
    webpack({
      options: {
        entry: es5,
        watch: true
      },
      log: (message) => {
        t.include(message, 'webpack is watching for changes')
      }
    }).then(t.fail)
      .catch(t.fail)
  })
})
