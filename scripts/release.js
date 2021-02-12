'use strict';

const chalk = require('chalk');
const execa = require('execa');
const inquirer = require('inquirer');
const Listr = require('listr');
const packageFile = require('./packageFile');
const path = require('path');
const rimraf = require('rimraf');
const semver = require('semver');

const rootDir = path.join(__dirname, '../');
const SEMVER_INCREMENTS = [
  'patch',
  'minor',
  'major',
  'prepatch',
  'preminor',
  'premajor',
  'prerelease',
];

function runTasks(oldVersion, inc) {
  const newVersion = semver.inc(oldVersion, inc);
  const tasks = new Listr([
    {
      title: 'Git',
      task: () => {
        return new Listr(
          [
            {
              title: 'Checking Git Status',
              task: async () => {
                const { stdout } = await execa('git', [
                  'status',
                  '--porcelain',
                ]);
                if (stdout !== '') {
                  throw new Error(
                    'Unclean working tree. Commit or stash changes first.',
                  );
                }
              },
            },
            {
              title: 'Checking Current Branch',
              task: async () => {
                const { stdout } = await execa('git', [
                  'symbolic-ref',
                  '--short',
                  'HEAD',
                ]);
                if (stdout !== 'main') {
                  throw new Error('Not on `main` branch.');
                }
              },
            },
            {
              title: 'Checking Remote History',
              task: async () => {
                const { stdout } = await execa('git', [
                  'rev-list',
                  '--count',
                  '--left-only',
                  '@{u}...HEAD',
                ]);
                if (stdout !== '0') {
                  throw new Error(
                    'Remote history differ. Please pull changes.',
                  );
                }
              },
            },
          ],
          { concurrent: true },
        );
      },
    },
    {
      title: 'Cleaning',
      task: () =>
        new Promise((resolve, reject) => {
          rimraf('node_modules', err => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        }),
    },
    {
      title: 'Installing',
      task: () => execa('npm', ['install'], { cwd: rootDir }),
    },
    {
      title: 'Test Build',
      task: () => execa('npm', ['run', 'build'], { cwd: rootDir }),
    },
    {
      title: 'Testing',
      task: () =>
        new Listr(
          [
            {
              title: 'Unit Tests',
              task: () => execa('npm', ['run', 'test:ci'], { cwd: rootDir }),
            },
            {
              title: 'Lint',
              task: () => execa('npm', ['run', 'lint'], { cwd: rootDir }),
            },
          ],
          { concurrent: true },
        ),
    },
    {
      title: 'Bumping',
      task: () => execa('npm', ['run', 'bump', inc], { cwd: rootDir }),
    },
    {
      title: 'Generating Changelog',
      task: () => execa('npm', ['run', 'changelog'], { cwd: rootDir }),
    },
    {
      title: 'Updating package-lock.json via install',
      task: () => execa('npm', ['install'], { cwd: rootDir }),
    },
    {
      title: 'Committing',
      task: () =>
        execa('git', ['commit', `-am chore(release): release ${newVersion}`], {
          cwd: rootDir,
        }),
    },
    {
      title: 'Tagging',
      task: () => execa('git', ['tag', `v${newVersion}`], { cwd: rootDir }),
    },
    {
      title: 'Pushing to Github',
      task: () =>
        execa('git', ['push', '--follow-tags', '--no-verify'], {
          cwd: rootDir,
        }),
    },
    {
      title: 'Production Build',
      task: () => execa('npm', ['run', 'build'], { cwd: rootDir }),
    },
    {
      title: 'Deploying',
      task: () => execa('firebase', ['deploy'], { cwd: rootDir }),
    },
  ]);

  return tasks.run();
}

function releaseUI() {
  const pkg = packageFile.read();
  const oldVersion = pkg.version;

  console.log(
    `\nPrepare to release a new version of ${chalk.bold.magenta(
      pkg.name,
    )} ${chalk.dim(`(${oldVersion})`)}\n`,
  );

  const prompts = [
    {
      type: 'list',
      name: 'inc',
      message: 'Select semver increment',
      pageSize: SEMVER_INCREMENTS.length,
      choices: SEMVER_INCREMENTS.map(inc => ({
        name: `${inc}   ${prettyVersionDiff(oldVersion, inc)}`,
        value: inc,
      })),
    },
    {
      type: 'confirm',
      name: 'confirm',
      message: answers => {
        return `Are you sure you want to bump the version from ${chalk.cyan(
          oldVersion,
        )} to ${chalk.cyan(semver.inc(oldVersion, answers.inc))}?`;
      },
    },
  ];

  return inquirer
    .prompt(prompts)
    .then(answers => {
      if (answers.confirm) {
        runTasks(oldVersion, answers.inc);
      }
    })
    .catch(err => {
      console.log('\n', chalk.red(err), '\n');
      process.exit(0);
    });
}

function prettyVersionDiff(oldVersion, inc) {
  const newVersion = semver.inc(oldVersion, inc).split('.');
  oldVersion = oldVersion.split('.');
  let firstVersionChange = false;
  const output = [];

  for (let i = 0; i < newVersion.length; i++) {
    if (newVersion[i] !== oldVersion[i] && !firstVersionChange) {
      output.push(`${chalk.dim.cyan(newVersion[i])}`);
      firstVersionChange = true;
    } else if (newVersion[i].indexOf('-') >= 1) {
      let preVersion = [];
      preVersion = newVersion[i].split('-');
      output.push(`${chalk.dim.cyan(`${preVersion[0]}-${preVersion[1]}`)}`);
    } else {
      output.push(chalk.reset.dim(newVersion[i]));
    }
  }
  return output.join(chalk.reset.dim('.'));
}

releaseUI();
