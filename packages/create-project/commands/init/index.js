const { ensureDirSync, pathExistsSync, readFileSync, readJsonSync, removeSync, writeJsonSync } = require('fs-extra');
const { basename, join, relative } = require('path');
const chalk = require('chalk');
const ejs = require('ejs');
const { stringify } = require('javascript-stringify');
const merge = require('deepmerge');
const Generator = require('yeoman-generator');
const questions = require('./questions');
const { packages, presets } = require('./matrix');
const { isYarn } = require('./utils');
const { version: neutrinoVersion } = require('../../package.json');

const rcContent = readFileSync(join(__dirname, 'templates/neutrino/.neutrinorc.js.ejs')).toString();
const rcTemplate = ejs.compile(rcContent);

/* eslint-disable no-underscore-dangle */
module.exports = class Project extends Generator {
  static _logo() {
    return `                          _          _
      _ __    ___  _   _ | |_  _ __ (_) _ __    ___
     | '_ \\  / _ \\| | | || __|| '__|| || '_ \\  / _ \\
     | | | ||  __/| |_| || |_ | |   | || | | || (_) |
     |_| |_| \\___| \\__,_| \\__||_|   |_||_| |_| \\___/
    `;
  }

  static _processDependencies(dependencies) {
    // For dependencies that are Neutrino monorepo packages, install the
    // same major version as found in create-project's package.json.
    const neutrinoPackages = Object.values(packages);
    return dependencies.map(dependency =>
      neutrinoPackages.includes(dependency) ? `${dependency}@^${neutrinoVersion}` : dependency
    ).sort();
  }

  _spawnSync(command, args) {
    const result = this.spawnCommandSync(command, args, {
      cwd: this.options.directory,
      stdio: this.options.stdio,
      env: process.env
    });

    if (result.error || result.status !== 0) {
      const commandString = [command, ...args].join(' ');

      if (result.error) {
        // The child process failed to start entirely, or timed out.
        this.log.error(result.error);
      }

      this.log.error(`The command "${commandString}" exited unsuccessfully.`);

      if (!this.options.debug) {
        this.log.error('Cleaning up the incomplete project directory.');
        removeSync(this.options.directory);
        this.log.error('Try again with the --debug flag for more information and to skip cleanup.');
      }

      process.exit(result.status || 1);
    }

    return result;
  }

  _getProjectNeutrinorcData() {
    const { projectType, project } = this.data;
    const reIndent = /^(?!\s*$)/mg;
    let options = '';

    if (projectType === 'application' && project !== packages.NODE) {
      options = stringify({
        html: {
          title: this.options.name
        }
      }, null, 2);
    } else if (projectType === 'library') {
      options = stringify({
        name: this.options.name
      }, null, 2);
    }

    if (options) {
      const [head, ...tail] = options.split('\n');

      options = `${head}\n${tail.join('\n').replace(reIndent, '    ')}`;
    }

    return { pkg: project, options };
  }

  _getNeutrinorcContent() {
    return rcTemplate({
      middleware: [
        this.data.linter && { name: presets[this.data.linter].name, pkg: this.data.linter, options: '' },
        { name: presets[this.data.project].name, ...this._getProjectNeutrinorcData() },
        this.data.testRunner && { name: presets[this.data.testRunner].name, pkg: this.data.testRunner, options: '' }
      ].filter(Boolean)
    });
  }

  _getDependencies() {
    const deps = [this.data.project, this.data.testRunner, this.data.linter]
      .reduce(
        (deps, preset) => merge(deps, presets[preset] || {}),
        { dependencies: [], devDependencies: [] }
      );

    return {
      dependencies: Project._processDependencies(deps.dependencies),
      devDependencies: Project._processDependencies(deps.devDependencies)
    };
  }

  _initialPackageJson() {
    const { project, testRunner } = this.data;
    const installer = isYarn ? 'yarn' : 'npm';
    const scripts = { build: 'webpack --mode production' };
    let lintDirectories = 'src';

    if (this.data.projectType !== 'library') {
      scripts.start = project === '@neutrinojs/node'
        ? 'webpack --watch --mode development'
        : 'webpack-dev-server --mode development --open';
    }

    if (testRunner) {
      if (testRunner.includes('jest')) {
        scripts.test = 'jest';
      } else if (testRunner.includes('karma')) {
        scripts.test = 'karma start --single-run';
      } else if (testRunner.includes('mocha')) {
        scripts.test = 'mocha';
      }

      lintDirectories += ' test';
    }

    if (this.data.linter) {
      // The list of extensions here needs to be kept in sync with the  extension
      // list defined by neutrino/extensions.source. Modifying a value here should
      // have an accompanying change there as well. We can't pull in neutrino here
      // as that would potentially give us conflicting versions in node_modules.
      const lintExtensions = (project === '@neutrinojs/vue') ? 'mjs,vue,jsx,js' : 'mjs,jsx,js';
      scripts.lint = `eslint --cache --format codeframe --ext ${lintExtensions} ${lintDirectories}`;
    }

    this._spawnSync(installer, ['init', '--yes']);

    const jsonPath = join(this.options.directory, 'package.json');
    const json = readJsonSync(jsonPath);
    const packageJson = { ...json, scripts };

    writeJsonSync(jsonPath, packageJson, { spaces: 2 });
    this.log(`   ${chalk.green('create')} ${join(basename(this.options.directory), 'package.json')}`);
  }

  prompting() {
    const done = this.async();

    this.log(chalk.cyan.bold(Project._logo()));
    this.log(chalk.white.bold('Welcome to Neutrino! 👋'));
    this.log(chalk.cyan('To help you create your new project, I am going to ask you a few questions.\n'));

    this
      .prompt(questions())
      .then(answers => { this.data = answers; })
      .then(() => {
        this.log(`\n👌  ${chalk.white.bold('Looks like I have all the info I need. Give me a moment while I create your project!')}\n`);
        done();
      });
  }

  writing() {
    if (pathExistsSync(this.options.directory)) {
      this.log.error(
        `The directory ${this.options.directory} already exists. ` +
        'For safety, please use create-project with a non-existent directory.'
      );
      process.exit(1);
    }

    ensureDirSync(this.options.directory);

    const templates = [this.data.project, this.data.testRunner, this.data.linter].filter(Boolean);

    this._initialPackageJson();
    this.fs.write(
      join(this.options.directory, '.neutrinorc.js'),
      this._getNeutrinorcContent()
    );
    templates.forEach(template => {
      const templateDir = template.replace('@neutrinojs/', '');

      this.fs.copyTpl(
        this.templatePath(`${templateDir}/**`),
        this.options.directory,
        { data: this.options },
        {},
        { globOptions: { dot: true } }
      );
    });
  }

  install() {
    const packageManager = isYarn ? 'yarn' : 'npm';
    const install = isYarn ? 'add' : 'install';
    const devFlag = isYarn ? '--dev' : '--save-dev';
    const { dependencies, devDependencies } = this._getDependencies();

    this.log('');

    if (dependencies.length) {
      this.log(`${chalk.green('⏳  Installing dependencies:')} ${chalk.yellow(dependencies.join(', '))}`);
      this._spawnSync(
        packageManager,
        [
          install,
          ...(
            this.options.registry
              ? ['--registry', this.options.registry] :
              []
          ),
          ...dependencies
        ]
      );
    }

    if (devDependencies.length) {
      this.log(`${chalk.green('⏳  Installing devDependencies:')} ${chalk.yellow(devDependencies.join(', '))}`);
      this._spawnSync(
        packageManager,
        [
          install,
          devFlag,
          ...(
            this.options.registry
              ? ['--registry', this.options.registry] :
              []
          ),
          ...devDependencies
        ]
      );
    }

    if (this.data.linter) {
      this.log(`${chalk.green('⏳  Performing one-time lint')}`);
      this._spawnSync(packageManager,
        isYarn
          ? ['lint', '--fix']
          : ['run', 'lint', '--', '--fix']
      );
    }
  }

  end() {
    this.log(`\n${chalk.green('Hooray, I successfully created your project!')}`);
    this.log(`\nI have added a few ${isYarn ? 'yarn' : 'npm'} scripts to help you get started:`);
    this.log(`  • To build your project run:  ${chalk.cyan.bold(`${isYarn ? 'yarn' : 'npm run'} build`)}`);

    if (this.data.projectType !== 'library') {
      this.log(`  • To start your project locally run:  ${chalk.cyan.bold(`${isYarn ? 'yarn' : 'npm'} start`)}`);
    }

    if (this.data.testRunner) {
      this.log(`  • To execute tests run:  ${chalk.cyan.bold(`${isYarn ? 'yarn' : 'npm'} test`)}`);
    }

    if (this.data.linter) {
      const lintCommand = isYarn ? 'yarn lint' : 'npm run lint';
      const fixLintCommand = isYarn ? `${lintCommand} --fix` : `${lintCommand} -- --fix`;
      this.log(`  • To lint your project manually run:  ${chalk.cyan.bold(lintCommand)}`);
      this.log(`    You can also fix linting problems with:  ${chalk.cyan.bold(fixLintCommand)}`);
    }

    this.log('\nNow change your directory to the following to get started:');
    this.log(`  ${chalk.cyan('cd')} ${chalk.cyan(relative(process.cwd(), this.options.directory))}`);
    this.log(`\n❤️  ${chalk.white.bold('Neutrino')}`);
  }
};
