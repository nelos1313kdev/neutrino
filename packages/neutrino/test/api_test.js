import test from 'ava';
import { join } from 'path';
import Neutrino from '../Neutrino';

test('initializes with no arguments', t => {
  t.notThrows(() => new Neutrino());
});

test('initializes with options', t => {
  t.notThrows(() => new Neutrino({ testing: true }));
});

test('initialization stores options', t => {
  const options = { alpha: 'a', beta: 'b', gamma: 'c' };
  const api = new Neutrino(options);

  t.is(api.options.alpha, options.alpha);
  t.is(api.options.beta, options.beta);
  t.is(api.options.gamma, options.gamma);
});

test('merges custom primitive option properties', t => {
  const options = { alpha: 'a', beta: {}, gamma: 4, delta: [] };
  const api = new Neutrino(options);

  api.options = api.mergeOptions(api.options, { alpha: 'd', beta: 3, gamma: /.*/, delta: true });

  t.is(api.options.alpha, 'd');
  t.is(api.options.beta, 3);
  t.deepEqual(api.options.gamma, /.*/);
  t.is(api.options.delta, true);
});

test('options.root', t => {
  const api = new Neutrino();

  t.is(api.options.root, process.cwd());
  api.options.root = './alpha';
  t.is(api.options.root, join(process.cwd(), 'alpha'));
  api.options.root = '/alpha';
  t.is(api.options.root, '/alpha');
});

test('options.source', t => {
  const api = new Neutrino();

  t.is(api.options.source, join(process.cwd(), 'src'));
  api.options.source = './alpha';
  t.is(api.options.source, join(process.cwd(), 'alpha'));
  api.options.root = '/beta';
  t.is(api.options.source, join('/beta', 'alpha'));
  api.options.source = '/alpha';
  t.is(api.options.source, '/alpha');
});

test('options.output', t => {
  const api = new Neutrino();

  t.is(api.options.output, join(process.cwd(), 'build'));
  api.options.output = './alpha';
  t.is(api.options.output, join(process.cwd(), 'alpha'));
  api.options.root = '/beta';
  t.is(api.options.output, join('/beta', 'alpha'));
  api.options.output = '/alpha';
  t.is(api.options.output, '/alpha');
});

test('options.tests', t => {
  const api = new Neutrino();

  t.is(api.options.tests, join(process.cwd(), 'test'));
  api.options.tests = './alpha';
  t.is(api.options.tests, join(process.cwd(), 'alpha'));
  api.options.root = '/beta';
  t.is(api.options.tests, join('/beta', 'alpha'));
  api.options.tests = '/alpha';
  t.is(api.options.tests, '/alpha');
});

test('throws when legacy options.node_modules is set', t => {
  const api = new Neutrino();
  const options = { node_modules: 'abc' };

  t.throws(() => api.use({ options }), /options\.node_modules has been removed/);
});

test('throws when middleware "env" is set', t => {
  const api = new Neutrino();
  const middleware = {
    env: {
      NODE_ENV: {
        production: neutrino => {
          neutrino.config.devtool('alpha');
        }
      }
    }
  };

  api.config.devtool('beta');

  t.throws(() => api.use(middleware), /"env" in middleware has been removed/);
  t.is(api.config.get('devtool'), 'beta');
});

test('options.mains', t => {
  const api = new Neutrino();

  t.deepEqual(api.options.mains.index, { entry: join(process.cwd(), 'src/index') });
  api.options.mains.index = './alpha.js';
  t.deepEqual(api.options.mains.index, { entry: join(process.cwd(), 'src/alpha.js') });
  api.options.source = 'beta';
  t.deepEqual(api.options.mains.index, { entry: join(process.cwd(), 'beta/alpha.js') });
  api.options.root = '/gamma';
  t.deepEqual(api.options.mains.index, { entry: join('/gamma', 'beta/alpha.js') });
  api.options.mains.index = '/alpha.js';
  t.deepEqual(api.options.mains.index, { entry: '/alpha.js' });
});

test('override options.mains', t => {
  const api = new Neutrino({
    mains: {
      alpha: 'beta',
      gamma: {
        entry: 'delta',
        title: 'Gamma Page'
      }
    }
  });

  t.deepEqual(api.options.mains.alpha, { entry: join(process.cwd(), 'src/beta') });
  api.options.mains.alpha = { entry: './alpha.js', minify: false };
  t.deepEqual(api.options.mains.alpha, { entry: join(process.cwd(), 'src/alpha.js'), minify: false });
  api.options.source = 'epsilon';
  t.deepEqual(api.options.mains.alpha, { entry: join(process.cwd(), 'epsilon/alpha.js'), minify: false });
  api.options.root = '/zeta';
  t.deepEqual(api.options.mains.alpha, { entry: join('/zeta', 'epsilon/alpha.js'), minify: false });
  api.options.mains.alpha = '/alpha.js';
  t.deepEqual(api.options.mains.alpha, { entry: '/alpha.js' });

  t.deepEqual(api.options.mains.gamma, { entry: join('/zeta', 'epsilon/delta'), title: 'Gamma Page' });
  api.options.mains.gamma = './alpha.js';
  t.deepEqual(api.options.mains.gamma, { entry: join('/zeta', 'epsilon/alpha.js') });
  api.options.source = 'src';
  t.deepEqual(api.options.mains.gamma, { entry: join('/zeta', 'src/alpha.js') });
  api.options.root = process.cwd();
  t.deepEqual(api.options.mains.gamma, { entry: join(process.cwd(), 'src/alpha.js') });
  api.options.mains.gamma = '/alpha.js';
  t.deepEqual(api.options.mains.gamma, { entry: '/alpha.js' });
});

test('override options.mains.index template', t => {
  const api = new Neutrino({
    mains: {
      index: {
        template: 'alpha.eps'
      }
    }
  });

  t.deepEqual(
    api.options.mains.index,
    {
      entry: join(process.cwd(), 'src/index'),
      template: 'alpha.eps'
    }
  );
});

test('creates an instance of webpack-chain', t => {
  t.is(typeof new Neutrino().config.toConfig, 'function');
});

test('middleware receives API instance', t => {
  const api = new Neutrino();

  api.use(n => t.is(n, api));
});

test('middleware receives no default options', t => {
  const api = new Neutrino();

  api.use((api, options) => {
    t.is(options, undefined);
  });
});

test('middleware receives options parameter', t => {
  const api = new Neutrino();
  const defaults = { alpha: 'a', beta: 'b', gamma: 'c' };

  api.use((api, options) => {
    t.deepEqual(options, defaults);
  }, defaults);
});

test('import middleware for use', async (t) => {
  const api = new Neutrino({ root: __dirname });

  api.use(['fixtures/middleware']);
  t.notDeepEqual(api.config.toConfig(), {});
});

test('creates a webpack config', t => {
  const api = new Neutrino();

  api.use(api => {
    api.config.module
      .rule('compile')
      .test(api.regexFromExtensions(['js']));
  });

  t.notDeepEqual(api.config.toConfig(), {});
});

test('regexFromExtensions', t => {
  const api = new Neutrino();

  t.is(String(api.regexFromExtensions()), '/\\.(mjs|jsx|js)$/');
  t.is(String(api.regexFromExtensions(['js'])), '/\\.js$/');
  t.is(String(api.regexFromExtensions(['js', 'css'])), '/\\.(js|css)$/');
  t.is(String(api.regexFromExtensions(['worker.js', 'worker.jsx'])), '/\\.(worker\\.js|worker\\.jsx)$/');
});
