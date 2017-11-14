# Neutrino Compile Loader Middleware

`@neutrinojs/compile-loader` is Neutrino middleware for compiling source code with Babel.

[![NPM version][npm-image]]
[npm-url][![NPM downloads][npm-downloads]]
[npm-url][![Join the Neutrino community on Spectrum][spectrum-image]][spectrum-url]

## Requirements

- Node.js v6.10+
- Yarn or npm client
- Neutrino v7

## Installation

`@neutrinojs/compile-loader` can be installed via the Yarn or npm clients.

#### Yarn

```bash
❯ yarn add @neutrinojs/compile-loader
```

#### npm

```bash
❯ npm install --save @neutrinojs/compile-loader
```

## Usage

`@neutrinojs/compile-loader` can be consumed from the Neutrino API, middleware, or presets. Require this package
and plug it into Neutrino:

```js
// Using function middleware format

const compile = require('@neutrinojs/compile-loader');

neutrino.use(compile, {
  include: [],
  exclude: [],
  babel: {}
});
```

```js
// Using object or array middleware format

module.exports = {
  use: [
    ['@neutrinojs/compile-loader', {
      include: [],
      exclude: [],
      babel: {}
    }]
  ]
};
```

- `include` should be an array of paths to include in the compilation. Maps to Webpack's
[`Rule.include`](https://webpack.js.org/configuration/module/#rule-include)
- `exclude` should be an array of paths to exclude from the compilation. Maps to Webpack's
[`Rule.exclude`](https://webpack.js.org/configuration/module/#rule-exclude)
- `babel` is a [Babel configuration object](https://babeljs.io/docs/usage/api/#options), consumed by babel-loader. Use
this to set properties such as `presets`, `plugins`, and `env`.

## Merging Babel Configuration

This package also exposes a function for merging Babel configurations. This comes from
the [babel-merge](https://www.npmjs.com/package/babel-merge) package.

```js
const { merge } = require('@neutrinojs/compile-loader');

const together = merge(
  {
    presets: [
      ['babel-preset-env', {
        targets: {
          browsers: ['latest 1 Chrome']
        }
      }]
    ]
  },
  {
    presets: [
      ['babel-preset-env', {
        targets: {
          browsers: ['latest 1 Firefox']
        }
      }]
    ]
  }
);

console.log(together);

// Logs:
{
  presets: [
    ['babel-preset-env', {
      targets: {
        browsers: [
          'latest 1 Chrome',
          'latest 1 Firefox'
        ]
      }
    }]
  ]
}
```

## Customization

`@neutrinojs/compile-loader` creates some conventions to make overriding the configuration easier once you are
ready to make changes.

### Rules

The following is a list of rules and their identifiers which can be overridden:

| Name | Description | Environments and Commands |
| --- | --- | --- |
| `compile` | Compiles JS and JSX files from the `src` directory using Babel. Contains a single loader named `babel`. | all |

## Contributing

This middleware is part of the [neutrino-dev](https://github.com/mozilla-neutrino/neutrino-dev) repository, a monorepo
containing all resources for developing Neutrino and its core presets and middleware. Follow the
[contributing guide](https://neutrino.js/contributing) for details.

[npm-image]: https://img.shields.io/npm/v/@neutrinojs/compile-loader.svg
[npm-downloads]: https://img.shields.io/npm/dt/@neutrinojs/compile-loader.svg
[npm-url]: https://npmjs.org/package/@neutrinojs/compile-loader
[spectrum-image]: https://withspectrum.github.io/badge/badge.svg
[spectrum-url]: https://spectrum.chat/neutrino
