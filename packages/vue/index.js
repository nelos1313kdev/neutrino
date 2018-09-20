const loaderMerge = require('@neutrinojs/loader-merge');
const web = require('@neutrinojs/web');
const merge = require('deepmerge');

module.exports = (neutrino, opts = {}) => {
  // vue-loader extracts <style> tags to CSS files so they are parsed
  // automatically by the css-loader. In order to enable CSS modules
  // on these CSS files, we need to say that normal CSS files can use
  // CSS modules.
  const options = merge({
    style: {
      ruleId: 'style',
      styleUseId: 'style',
      extract: process.env.NODE_ENV === 'production',
      exclude: [],
      modulesTest: neutrino.regexFromExtensions(['css']),
      modulesSuffix: ''
    }
  }, opts);

  // Add vue extension as a higher priority than JS files.
  // Since neutrino.options.extensions is always a copy of a Set,
  // this splice operation is always mutation-safe.
  const { extensions } = neutrino.options;
  const index = extensions.indexOf('js');

  extensions.splice(index, 0, 'vue');

  neutrino.options.extensions = extensions; // eslint-disable-line no-param-reassign
  neutrino.use(web, options);

  // vue-loader needs CSS files to be parsed with vue-style-loader instead of
  // style-loader, so we replace the loader with the one vue wants.
  if (!options.style.extract) {
    neutrino.config.module
      .rule(options.style.ruleId)
      .use(options.style.styleUseId)
      .loader(require.resolve('vue-style-loader'));
  }

  neutrino.config.module
    .rule('vue')
      .test(neutrino.regexFromExtensions(['vue']))
      .use('vue')
        .loader(require.resolve('vue-loader'));

  neutrino.config.plugin('vue').use(require.resolve('vue-loader/lib/plugin'));

  if (neutrino.config.module.rules.has('compile')) {
    // We need to remove vue files from being parsed by Babel since the
    // vue-loader/VueLoaderPlugin will break down a vue file into its component
    // part files. For example, the <script> in a vue file becomes a JS file,
    // which will then be parsed by Babel, so no need for a double parse.
    neutrino.config.module
      .rule('compile')
      .test(neutrino.regexFromExtensions(
        neutrino.options.extensions.filter(ext => ext !== 'vue'))
      );
  }

  neutrino.config.when(neutrino.config.module.rules.has('lint'), () => {
    // We need to re-set the extension list used by the eslint settings
    // since when it was generated it didn't include the vue extension.
    neutrino.config.module
      .rule('lint')
        .test(neutrino.regexFromExtensions());

    neutrino.use(loaderMerge('lint', 'eslint'), {
      baseConfig: {
        extends: ['plugin:vue/base']
      },
      plugins: ['vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: 'babel-eslint'
      }
    });
  });
};
