<div align="center">
  <a href="http://github.com/flyjs/fly">
    <img width=200px  src="https://cloud.githubusercontent.com/assets/8317250/8733685/0be81080-2c40-11e5-98d2-c634f076ccd7.png">
  </a>
</div>

> [Webpack](webpack.github.io) plugin for _[Fly][fly]_.

[![][fly-badge]][fly]
[![npm package][npm-ver-link]][releases]
[![][dl-badge]][npm-pkg-link]
[![][travis-badge]][travis-link]
[![][mit-badge]][mit]

Under development!

## Usage
> Check out the [documentation](http://webpack.github.io/docs/configuration.html) to see the available options.

### Install

```a
npm install -D fly-webpack
```

### Example

You can pass webpack options in with the first argument, including `watch` which will greatly decrease compilation times:

```js
export default function* () {

    let webpackConfig = {
        watch: true,
        output: {
            path: 'public'
        }
    };

    yield this
        .source("src/main.js")
        .webpack(webpackConfig);
}
```

Or just pass in your `webpack.config.js`:

```js
export default function* () {
    yield this
        .source("src/main.js")
        .webpack( require('./webpack.config.js') );
}
```
If you would like to use a different version of webpack than the one this plugin uses, pass in an optional 2nd argument:

```js

import webpack from 'webpack';

export default function* () {
    yield this
        .source("src/main.js")
        .webpack( require('./webpack.config.js'),  webpack);
}
```

Pass in 3rd argument if you want to access the stats outputted from webpack when the compilation is done:

```js
export default function* () {
    yield this
        .source("src/main.js")
        .webpack({
          /* config */
        }, null, (err, stats) => {
          /* Use stats to do more things if needed */
        });
}
```

#### Multiple Entry Points

A common request is how to handle multiple entry points. You can continue to pass in an `entry` option in your typical webpack config like so:

```js
export default function* () {
    yield this
        .source("src/main.js")
        .webpack({
                   entry: {
                           app: 'src/app.js',
                           test: 'test/test.js',
                   },
                   output: {
                       filename: '[name].js',
                   }
               });
}
```

Or you can handle this with passing multiple files to source like so:

```js
export default function* () {
    yield this
        .source(["src/app.js", "test/test.js"])
        .webpack({
                   output: {
                       filename: '[name].js',
                   }
               });
}
```

## Release History
* 1.0.3 - Initial release

# License

[MIT][mit] © [Andrew Sokolov][author] et [al][contributors]

[mit]:          http://opensource.org/licenses/MIT
[author]:       http://github.com/andrewsokolov
[contributors]: https://github.com/andrewsokolov/fly-webpack/graphs/contributors
[releases]:     https://github.com/andrewsokolov/fly-webpack/releases
[fly]:          https://www.github.com/flyjs/fly
[fly-badge]:    https://img.shields.io/badge/fly-JS-05B3E1.svg?style=flat-square
[mit-badge]:    https://img.shields.io/badge/license-MIT-444444.svg?style=flat-square
[npm-pkg-link]: https://www.npmjs.org/package/fly-webpack
[npm-ver-link]: https://img.shields.io/npm/v/fly-webpack.svg?style=flat-square
[dl-badge]:     http://img.shields.io/npm/dm/fly-webpack.svg?style=flat-square
[travis-link]:  https://travis-ci.org/andrewsokolov/fly-webpack
[travis-badge]: http://img.shields.io/travis/andrewsokolov/fly-webpack.svg?style=flat-square
