import test from 'ava';
import Neutrino from '../../neutrino/Neutrino';
import neutrino from '../../neutrino';

const mw = () => require('..');
const originalNodeEnv = process.env.NODE_ENV;

test.afterEach(() => {
  // Restore the original NODE_ENV after each test (which Ava defaults to 'test').
  process.env.NODE_ENV = originalNodeEnv;
});

test('loads middleware', t => {
  t.notThrows(mw);
});

test('uses middleware', t => {
  const api = new Neutrino();

  t.notThrows(() => {
    api.use(mw());
  });
});

test('instantiates', t => {
  const api = new Neutrino();
  api.use(mw());

  t.notThrows(() => api.config.toConfig());
});

test('instantiates in development', t => {
  process.env.NODE_ENV = 'development';
  const api = new Neutrino();
  api.use(mw());

  t.notThrows(() => api.config.toConfig());
});

test('instantiates in production', t => {
  process.env.NODE_ENV = 'production';
  const api = new Neutrino();
  api.use(mw());

  t.notThrows(() => api.config.toConfig());
});

test('exposes jest output handler', t => {
  const api = new Neutrino();
  api.use(mw());

  const handler = api.outputHandlers.get('jest');

  t.is(typeof handler, 'function');
});

test('exposes jest config from output', t => {
  const config = neutrino(mw()).output('jest');

  t.is(typeof config, 'object');
});

test('exposes jest method', t => {
  t.is(typeof neutrino(mw()).jest, 'function');
});

test('exposes jest config from method', t => {
  t.is(typeof neutrino(mw()).jest(), 'object');
});

test('uses middleware with options', t => {
  const config = neutrino([mw(), { testEnvironment: 'node' }]).jest();

  t.is(config.testEnvironment, 'node');
});
