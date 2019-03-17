const LINTING = 'linting';
const PROJECT = 'project';
const TESTING = 'testing';

const N = 'neutrino';
const REACT = '@neutrinojs/react';
const PREACT = '@neutrinojs/preact';
const VUE = '@neutrinojs/vue';
const WEB = '@neutrinojs/web';
const NODE = '@neutrinojs/node';
const WEB_NODE_LIBRARY = '@neutrinojs/library';
const REACT_COMPONENTS = '@neutrinojs/react-components';
const JEST = '@neutrinojs/jest';
const KARMA = '@neutrinojs/karma';
const MOCHA = '@neutrinojs/mocha';
const AIRBNB = '@neutrinojs/airbnb';
const AIRBNB_BASE = '@neutrinojs/airbnb-base';
const STANDARDJS = '@neutrinojs/standardjs';

const ESLINT = 'eslint@^5';
const WEBPACK = 'webpack@^4';
const WEBPACK_CLI = 'webpack-cli@^3';
const WEBPACK_DEV_SERVER = 'webpack-dev-server@^3';

const presets = {
  [AIRBNB]: {
    name: 'airbnb',
    type: LINTING,
    devDependencies: [AIRBNB, ESLINT]
  },
  [AIRBNB_BASE]: {
    name: 'airbnbBase',
    type: LINTING,
    devDependencies: [AIRBNB_BASE, ESLINT]
  },
  [WEB_NODE_LIBRARY]: {
    name: 'library',
    type: PROJECT,
    devDependencies: [
      WEB_NODE_LIBRARY,
      N,
      WEBPACK,
      WEBPACK_CLI
    ]
  },
  [NODE]: {
    name: 'node',
    type: PROJECT,
    devDependencies: [NODE, N, WEBPACK, WEBPACK_CLI]
  },
  [PREACT]: {
    name: 'preact',
    type: PROJECT,
    dependencies: ['preact@^8', 'preact-compat@^3'],
    devDependencies: [PREACT, N, WEBPACK, WEBPACK_CLI, WEBPACK_DEV_SERVER]
  },
  [REACT]: {
    name: 'react',
    type: PROJECT,
    dependencies: ['prop-types@^15', 'react@^16', 'react-dom@^16', 'react-hot-loader@^4'],
    devDependencies: [REACT, N, WEBPACK, WEBPACK_CLI, WEBPACK_DEV_SERVER]
  },
  [REACT_COMPONENTS]: {
    name: 'reactComponents',
    type: PROJECT,
    devDependencies: [
      REACT_COMPONENTS,
      N,
      'prop-types@^15',
      'react@^16',
      'react-dom@^16',
      WEBPACK, WEBPACK_CLI, WEBPACK_DEV_SERVER
    ]
  },
  [STANDARDJS]: {
    name: 'standard',
    type: LINTING,
    devDependencies: [STANDARDJS, ESLINT]
  },
  [VUE]: {
    name: 'vue',
    type: PROJECT,
    dependencies: ['vue@^2'],
    devDependencies: [VUE, N, WEBPACK, WEBPACK_CLI, WEBPACK_DEV_SERVER]
  },
  [WEB]: {
    name: 'web',
    type: PROJECT,
    devDependencies: [WEB, N, WEBPACK, WEBPACK_CLI, WEBPACK_DEV_SERVER]
  },
  [JEST]: {
    name: 'jest',
    type: TESTING,
    devDependencies: [JEST, 'jest@^24']
  },
  [KARMA]: {
    name: 'karma',
    type: TESTING,
    devDependencies: [
      KARMA,
      'karma@^4',
      'karma-cli@^2',
      'mocha@^6'
    ]
  },
  [MOCHA]: {
    name: 'mocha',
    type: TESTING,
    devDependencies: [MOCHA, 'mocha@^6']
  }
};

const packages = {
  NEUTRINO: N,
  REACT,
  PREACT,
  VUE,
  WEB,
  NODE,
  WEB_NODE_LIBRARY,
  REACT_COMPONENTS,
  JEST,
  KARMA,
  MOCHA,
  AIRBNB,
  AIRBNB_BASE,
  STANDARDJS
};

module.exports = { presets, packages };
