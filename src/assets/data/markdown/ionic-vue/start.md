# Lab: Generate the Application

In this lab, you will:

- Use the CLI to create a starter application
- Learn some Ionic CLI commands
- Build and run the starter application

## Overview

The Ionic command line is the main tool used to develop Ionic Framework applications. This tool allows you to generate new applications, add features to the application, build the application, interact with Appflow and many other tasks. The command line also wraps and extends several other command lines such as the Cordova or Capacitor command lines, the Vue command line, etc.

If you type `ionic --help` at the terminal prompt you get a list of the available top level commands that can be run via the CLI. These commands are separated into two sections: Global Commands and Project Commands. Global Commands can be run from anywhere. Project Commands can only be run from an Ionic project directory. Commonly used commands include `start`, `info`, `generate`, and `serve`. We wil learn more about these commands as we use them.

## Create the Application

The first thing we will use the Ionic CLI for is to start a new application. Type `ionic start --help` to get some instructions on how the `start` command works as well as some expamples on how to use it. Notice that it has two basic modes of operation. You an either enter the command with a complete set of options, at which point the start operation will run all of the way through without asking questions, or you can supply a partial set of options, and the `start` command will prompt you for the information that it needs. If you just type `ionic start`, it will prompt for all of the information.

Lets start our application via whichever technique you want.

1. At the command line, change directories in to a starting directory. I use `~/Projects/Training`
1. Enter the following command: `ionic start tea-taster blank --type=vue`
1. Alternatively, you could just enter `ionic start` and let the command line ask you for what it needs

**Example:**

```bash
$ cd ~/Projects/Training
$ ionic start tea-taster blank --type=vue
```

Let's look at some of those options more closely.

- The third option is the name of the application.
- The forth option, `blank` tells Ioinic to use the `blank` starter. We have three basic starters: `blank`, `tabs`, and `sidemenu`. The main difference is the main style of navigation.
- The `--type` option specifies the type of application to create. Options include `angular`, `react`, `vue`, `ionic-angular`, and `ionic1`. The `ionic-angular` type is an Ionic v3 application.
- The application will use Capacitor for the native layer

Once the application has been generated, let's start the development server:

```bash
$ cd tea-taster
$ ionic serve
```

## Enforce Consistent Styling

<a href="https://prettier.io/" target="_blank">Prettier</a> is an excellent tool that you can use to keep the formatting of your code consistent and clean. We highly suggest you use a tool such as this. Whether your are a lone developer or part of a team, using a tool such as Prettier means that you do not have to think about the formatting of your code. Better yet, you do not run into "formatting wars" between developers.

Prettier itself is an opinionated code formatter, and Ionic has its own opinions on how it is best configured, so let's install both Prettier and Ionic's Prettier configuration. We will also install <a href="https://www.npmjs.com/package/husky" target="_blank">husky</a> and <a href="https://www.npmjs.com/package/pretty-quick" target="_blank">pretty-quick</a>. This will allow us to set up a commit hook to make sure Prettier is run with each commit. After that we don't have to waste brain cycles thinking about code formatting ever again.

```bash
$ npm install -D @ionic/prettier-config husky prettier pretty-quick
```

Modify your `package.json` file. I suggest moving the `description` up to the top and giving it a reasonable value, and then adding the Prettier config portion to the bottom. For example:

```json
{
  "name": "tea-taster",
  "description": "Tea Tasting Notes",
  "version": "0.0.1",
  "author": "Ionic Framework",
  "homepage": "https://ionicframework.com/",
  "scripts": {
    ...
    "postinstall": "husky install",
    ...
  },
  "private": true,
  "dependencies": {
    ...
  },
  "devDependencies": {
    ...
  },
  "prettier": "@ionic/prettier-config"
}
```

**Note:** Throughout the training portions of code examples will be snipped and replaced with `...` (ellipsis). This is done for brevity and to better focus on actionable areas.

By default, the git hooks handled by `husky` are stored in the `.husky` directory. Let's add a couple now:

```bash
$ npx husky add .husky/pre-commit "npx pretty-quick --staged"
$ npx husky add .husky/pre-push "npm run lint"
```

This will ensure our code is properly fomatted before each commit. It will also ensure that our code does not have any linting errors before we push it out to the `origin` repo. It would also be good to run the unit tests in the `pre-push` hook, but we have not gotten that far yet.

Finally, make sure all of our source is formatted properly.

```bash
$ npx prettier --write src
```

At this point all of the source should be formatting properly and will remain so automatically with each commit.

**Note:** the default eslint configuration does not at this time conflict with the `prettier` configuration. However, it is possible that some configurations may. If that is the case, you may want to look into using <a href="https://github.com/prettier/eslint-config-prettier" target="_blank">eslint-config-prettier</a> which will help make the two systems play nice together.

## Side Note: `ionic serve` vs. `npm run serve`

You may be used to using `npm run serve` to start an application. That works, but it is different. The application is for all intents and purposes a Vue application and was generated using the standard Vue schematics with some extra Ionic spices, so all of the base Vue CLI application scripts are there.

In a nutshell:

- `npm run serve` uses the Vue CLI directly calling `vue-cli-service serve`, which uses the first free port starting at 8080
- `ionic serve` also uses the Vue CLI, calling `vue-cli-service serve`, however it uses the first free port starting at 8100

In either case, the Vue CLI does all the heavy lifting, so use whichever command you want to use.

## Conclusion

Congratulations on creating your `@ionic/vue` application. Next we will explore unit tests and discuss how they can help us in our development lifecycle.
