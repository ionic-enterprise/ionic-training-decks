# Lab: Generate the Application

In this lab, you will:

- Learn about the Ionic CLI and some of its commonly used commands
- Learn about starter templates and project types available through the Ionic CLI
- Generate, build, and run an application using a blank starter template
- Enforce consistent code formatting across the generated application

## Overview

The Ionic command line (CLI) is the main tool used to develop Ionic Framework applications. This tool allows you to generate new applications, build applications, interact with Appflow, and many other tasks. The Ionic CLI also wraps and extends other commands lines - such as the Capacitor command line, the Create React App command line, and more.

If you type `ionic --help` in the terminal, you will get a list of the available top level commands that can be run via the Ionic CLI. These commands are separated into two sections: Global Commands and Project Commands. Global Commands can be run from any directory whereas Project Commands can only be run within an Ionic Framework project directory. Commonly used Ionic CLI commands include `start`, `info`, `build`, and `serve`. We will learn more about these commands as we use them.

## Create the Application

The first thing we will use the Ionic CLI for is to start a new application. Open up a terminal and type `ionic start --help` to get instructions on how the `start` command works, as well as some examples on how to use it. Notice that it has two basic modes of operation: you can either enter the command with a complete set of options (at which point the operation will run all the way through without asking questions), or you can supply a partial set of options and the `start` command will prompt you for any additional information that it needs. If you just type `ionic start` it will prompt for all of the information.

Let's start our application by providing a set of options:

1. In the terminal, change directories to a starting directory. I prefer `~/Projects/Training`
2. Enter the following command: `ionic start tea-taster blank --type-react`.

Alternatively, you could just enter `ionic start` and let the command line ask you for what it needs.

**Example:**

```bash
$ cd ~/Projects/Training
$ ionic start tea-taster blank --type=react
```

Let's take a look at some of these options more closely:

- The forth option `blank` tells the Ionic CLI to use the `blank` starter template. The Ionic CLI has three basic starter templates: `blank`, `tabs`, and `sidemenu`. The main difference between them is the main style of navigation.
- The `--type` option specifies the type of Ionic Framework application to create. Options include `angular`, `react`, `ionic-angular`, and `ionic1`.

**Note:** The `ionic-angular` and `ionic1` options will generate an Ionic Framework v3 or Ionic Framework v1 application respectively. Those versions of the Ionic Framework are no longer supported, so pick those options at your own risk!

Once the application has been generated, let's start the development server:

```bash
$ cd tea-taster
$ ionic serve
```

### Side Note: `ionic serve` vs. `npm start`

You may be used to using `npm start` to start an application. That works, but it is different than the `ionic serve` command. The application - for all intents and purposes - is a React application generated using Create React App, with some extra Ionic spices thrown in. All of the base Create React App scripts are there.

In a nutshell:

- `npm start` uses Create React App directly calling `react-scripts start` without any options, which always tries to use port 3000
- `ionic serve` finds the first unused port >= 8100 and passes that to `react-scripts` with some other options

In either case Create React App does all the heavy lifting, so use whichever the command you want to use. Personally, I prefer `npm start` because it takes less typing and thought on my part.

## Enforce Consistent Styling

<a href="https://prettier.io/" target="_blank">Prettier</a> is an excellent tool that you can use to keep the formatting of your code consistent and clean. We highly suggest you use a tool such as this. Whether you're a lone developer or part of a team, using a tool such as Prettier means that you do not have to think about the formatting of your code. Better yet, you do not run into "formatting wars" between developers.

Prettier itself is an opinionated code formatter and Ionic has additional opinions on how it's best configured, so let's install a package that provides both Prettier and Ionic's configuration. We will also install <a href="https://www.npmjs.com/package/husky" target="_blank">husky</a> and <a href="https://www.npmjs.com/package/pretty-quick" target="_blank">pretty-quick</a> allowing us to set up a pre-commit hook to run Prettier with each commit. After that, we don't have to waste brain cycles thinking about code formatting ever again.

```bash
$ npm install -D @ionic/prettier-config husky prettier pretty-quick
```

Modify your `package.json` file. I suggest moving the `description` up to the top and giving it a reasonable value, and then adding the Prettier config portion to the bottom.

**Example:**

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

Finally, let's make sure all of our source is formatted properly:

```bash
$ npx prettier --write src
```

At this point all of the source should be formatting properly and will remain so automatically with each commit.

## Conclusion

Congratulations on creating your `@ionic/react` application! Next we will explore unit tests and discuss how they can help us in our development lifecycle.
