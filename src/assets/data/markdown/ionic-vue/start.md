# Lab: Generate the Application

In this lab, you will:

- Use the CLI to create a starter application
- Learn some Ionic CLI commands
- Build and run the starter application

## Overview

The Ionic command line is the main tool used to develop Ionic Framework applications. This tool allows you to generate new applications, add features to the application, build the application, interact with Appflow and many other tasks. The command line also wraps and extends several other command lines such as the Cordova or Capacitor command lines, the Vue command line, etc.

If you type `ionic --help` at the terminal prompt you get a list of the available top level commands that can be run via the CLI. These commands are separated into two sections: Global Commands and Project Commands. Global Commands can be run from anywhere. Project Commands can only be run from an Ionic project directory. Commonly used commands include `start`, `info`, `generate`, and `serve`. We will learn more about these commands as we use them.

## Create the Application

The first thing we will use the Ionic CLI for is to start a new application. Type `ionic start --help` to get some instructions on how the `start` command works as well as some examples on how to use it. Notice that it has two basic modes of operation. You an either enter the command with a complete set of options, at which point the start operation will run all of the way through without asking questions, or you can supply a partial set of options, and the `start` command will prompt you for the information that it needs. If you just type `ionic start`, it will prompt for all of the information.

Lets start our application via whichever technique you want.

1. At the command line, change directories in to a starting directory. I use `~/Projects/Training`
1. Enter the following command: `ionic start tea-taster blank --type=vue --no-git`
1. Alternatively, you could just enter `ionic start --no-git` and let the command line ask you for what it needs

**Example:**

```bash
cd ~/Projects/Training
ionic start tea-taster blank --type=vue --no-git
```

Let's look at some of those options more closely.

- The third option is the name of the application.
- The forth option, `blank` tells Ionic to use the `blank` starter. We have three basic starters: `blank`, `tabs`, and `sidemenu`. The main difference is the style of navigation.
- The `--type` option specifies the type of application to create. Options include `angular`, `react`, `vue`, `ionic-angular`, and `ionic1`. The `ionic-angular` type is an Ionic v3 application.
- The application will use Capacitor for the native layer by default. Cordova is not supported for Vue applications.

Once the application has been generated, let's start the development server:

```bash
cd tea-taster
ionic serve
```

**Version Note:**

This process was last tested with the following versions of key libraries:

- **Vue**: `3.4.27`
- **Capacitor**: `6.0.0`
- **Ionic**: `8.1.2`
- **Husky**: `9.0.11`

Over time, modifications in these and other libraries and tooling in the ecosystem can easily change how things work. You may need to perform minor modifications to any step in this training. Please [let us know](mailto:support@ionic.io) if you run into any major issues in any step.

## Enforce Consistent Styling

<a href="https://prettier.io/" target="_blank">
  Prettier
</a> is an excellent tool that you can use to keep the formatting of your code consistent and clean. We highly suggest you
use a tool such as this. Whether your are a lone developer or part of a team, using a tool such as Prettier means that you
do not have to think about the formatting of your code. Better yet, you do not run into "formatting wars" between developers.

Prettier itself is an opinionated code formatter, and Ionic has its own opinions on how it is best configured, so let's install both Prettier and Ionic's Prettier configuration. We will also install <a href="https://www.npmjs.com/package/husky" target="_blank">husky</a> and <a href="https://www.npmjs.com/package/lint-staged" target="_blank">lint-staged</a>. This will allow us to set up a commit hook to make sure Prettier is run with each commit. After that we don't have to waste brain cycles thinking about code formatting ever again.

```bash
npm install -D @ionic/prettier-config husky prettier lint-staged
```

Modify your `package.json` file. I suggest moving the `description` up to the top and giving it a reasonable value, and then adding the `prettier` and `lint-staged` config portions to the bottom. For example:

```json
{
  "name": "tea-taster",
  "description": "Tea Tasting Notes",
  "version": "0.0.1",
  "author": "Ionic Framework",
  "homepage": "https://ionicframework.com/",
  "scripts": {
    ...
    "prepare": "husky",
    ...
  },
  "private": true,
  "dependencies": {
    ...
  },
  "devDependencies": {
    ...
  },
  "prettier": "@ionic/prettier-config",
  "lint-staged": {
    "*.{js,jsx,ts,tsx,vue}": [
      "prettier --write",
      "eslint --fix"
    ],
    "*.{css,scss,html,md,json}": [
      "prettier --write"
    ]
  }
}
```

**Note:** Throughout the training portions of code examples will be snipped and replaced with `...` (ellipsis). This is done for brevity and to better focus on actionable areas.

Initialize Husky:

```bash
git init
npm install
```

**Note:** we also could have run `npx husky` or `npm run prepare` but using `install` ensures that we have set up the `prepare` properly and that it runs with the `install`.

By default, the git hooks handled by `husky` are stored in the `.husky` directory. Let's add a couple now:

**`.husky/pre-commit`**

```bash
npx lint-staged
```

**`.husky/pre-push`**

```bash
npm run lint
```

This will ensure our code is properly formatted before each commit. It will also ensure that our code does not have any linting errors before we push it out to the `origin` repo. It is also a good idea to run the unit tests in the `pre-push` hook, but we have not gotten that far yet.

Finally, let's add all of our source to git and commit it.

```bash
git add .
git commit -m "Initial commit"
```

If the hooks are installed correctly, the output of the `git commit` should look something like this:

```bash
$ git commit -m "Initial Commit"
⚠ Skipping backup because there’s no initial commit yet.

✔ Preparing lint-staged...
✔ Running tasks for staged files...
✔ Applying modifications from tasks...
[main (root-commit) 07550c7] Initial Commit
 28 files changed, 10517 insertions(+)
 ...
```

At this point all of the source should be formatting properly and will remain so automatically with each commit.

**Note:** the default eslint configuration does not currently conflict with the `prettier` configuration. However, it is possible that some configurations may. If that is the case, you may want to look into using <a href="https://github.com/prettier/eslint-config-prettier" target="_blank">eslint-config-prettier</a> which will help make the two systems play nice together.

## Update Dependencies

It is important to keep our dependencies up to date on a regular basis. At least once a quarter (though preferably more often than that), we should evaluate our dependencies, and update them to the latest supportable version. Before we do that, though, it is important to know a couple of important concepts: <a href="https://semver.org/" target="_blank">Semantic Versioning</a> (a.k.a. semver), and the `npm` <a href="https://semver.npmjs.com/" target="_blank">Version Range Syntax</a>.

### Semantic Versioning

<a href="https://semver.org/" target="_blank">
  Semantic Versioning
</a> is, at a basic level, a three point versioning scheme as such: `major.minor.patch`. A modification of the version at
any level signifies the types of changes made in the version:

- **Major**: breaking changes are contained in this release.
- **Minor**: new features have been added in this release, but in a backwards compatible manner.
- **Patch**: bug fixes and other optimization are in this release, all done in a backwards compatible manner.

Most libraries and tools that you will use follow semver (or at least try to).

### Version Range Syntax

NPM uses a <a href="https://semver.npmjs.com/" target="_blank">Version Range Syntax</a> to specify the acceptable versions for a package. This is a rather rich syntax and you can read about it in their documentation if you wish. Here we will examine the three most common forms used: pinned, patch-level, or minor.

- **pinned**: this syntax will _only_ take the specified version. Example: `1.2.3`.
- **patch-level**: this syntax uses the `~`. It will take patch level upgrades via `npm update`. Example: `~1.2.3`.
- **minor**: this syntax uses the `^`. It will take minor or patch level upgrades via `npm update`. Example: `^1.2.3`.

### The Update Process

To determine which packages are outdated and update them:

1. Create a new branch in case you need to back out your changes.
1. `npm outdated`: this will create a list of items that are out of date, along with the "Wanted" and "Latest" versions.
   1. **Wanted:** the latest version that matches the version range specification for the dependency.
   1. **Latest:** the latest version of the dependency, depending on its `@latest` tag.
1. Examine the changes for the out of date dependencies.
1. Use `npm update` to update dependencies to their "Wanted" version.
1. Use `npm install <dependency>@latest` to update dependencies to their "Latest" version.

Usually it is safe to `npm update` all dependencies that qualify.

Updating dependencies to the `@latest` version should generally be done with more care.

Perform a build and run all automated tests between individual updates.

Commit each individual update (you can always squash the commits before merging into `main`). This will allow you to fall back to a working state if any individual update causes problems.

Let's practice by updating our project now (**note**: you do not need to do all of the `git` related parts for the training, but you definitely should if you are working with a production project).

## Side Note: `ionic serve` vs. `npm run dev` vs. VS Code

You may be used to using `npm run dev` to start an application. That works as well, but it is slightly different. The application is for all intents and purposes a Vue application using Vite and all of the tooling around that will continue to work.

In a nutshell:

- `npm run serve` uses the Vue CLI directly calling `vite`, which uses the first free port starting at 5173 (configurable via the `vite.config.ts` file). You then have to load the served app in a web browser.
- `ionic serve` also uses the Vue CLI, calling `vite`, however it uses the first free port starting at 8100 and then launches the served app in a web browser for you.
- VS Code has some Vite and Vitest plugins that make this all moot by running Vite and Vitest directly from the IDE. Use whatever works for you.

In any case, the Vite does all the heavy lifting, so use whichever command you want to use.

## Conclusion

Congratulations on creating your `@ionic/vue` application. Next we will explore unit tests and discuss how they can help us in our development life cycle.
