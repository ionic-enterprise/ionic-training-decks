# Lab: Generate the Application

In this lab, you will:

- Use the CLI to create a starter application
- Learn some Ionic CLI commands
- Build and run the starter application

## Overview

THe Ionic command line is the main tool used to develop Ionic applications. This tool allows you to generate new applications, built the application, interact with Appflow and many other tasks. The command line also wraps and extends other command lines such as the Capacitor command line, react-scripts command line, etc.

If you type `ionic --help` at the command line you get a list of the available top level commands that can be run via the CLI. These commands are broken into two sections: Global Commands and Project Commands. Global Commands can be run from anywhere where as the Project Commands can only be run from an Ionic project directory. Common top level commands include `start`, `info`, `generate`, and `serve`. We will learn more about these commands as we use them.

## Create the Application

The first thing we will use the Ionic CLI for is to start a new application. Type `ionic start --help` to get some instructions on how the `start` command works as well as some examples on how to use it. Notice that it has two basic modes of operation. You can either enter the command with a complete set of options, at which point the start operation will run all of the way through without asking questions, or you can supply a partial set of options, and the `start` command will prompt you for the information that it needs. If you just type `ionic start`, it will prompt for all of the information.

Lets start our application via whichever technique you prefer:

1. At the command line, change directories to a starting directory. I prefer `~/Projects/Training`
2. Enter the following command: `ionic start tea-taster blank --type=react`
3. Alternatively, you could just enter `ionic start` and let the command line ask you for what it needs

**Example**

```bash
$ cd ~/Projects/Training
$ ionic start tea-taster blank --type=react
```

Let's look at some of these options more closely:

- The forth option, `blank`, tells Ionic to use the `blank` starter. We have three basic starters: `blank`, `tabs`, and `sidemenu`. The main difference is the main style of navigation.
- The `--type` option specifies the type of application to create. Options include `angular`, `react`, `ionic-angular`, and `ionic1`. The `ionic-angular` type is an Ionic v3 application.

Once the application has been generated, let's start the development server:

```bash
$ cd tea-taster
$ ionic serve
```

## Side Note: `ionic serve` vs. `npm start`

You may be used to using `npm start` to start an application. That works, but it is different. The application, for all intents and purposes, is a React application and was generated using Create React App with some extra Ionic spices, so all of the base Create React App application scripts are there.

In a nutshell:

- `npm start` uses Create React App directly calling `react-scripts start` without any options, which always tries to use port 3000
- `ionic serve` finds the first unused port >= 8100 and passes that to Create React App with some other options

In either case, Create React App does all the heavy lifting, so use whichever the command you want to use. Personally, I prefer `npm start` because it takes less typing and thought on my part.

## Enforce Consistent Styling

<a href="https://prettier.io/" target="_blank">Prettier</a> is an excellent tool that you can use to keep the formatting of your code consistent and clean. We highly suggest you use a tool such as this. Whether you're a lone developer or part of a team, using a tool such as Prettier means that you do not have to think about the formatting of your code. Better yet, you do not run into "formatting wars" between developers.

Prettier itself is an opinionated code formatter, and Ionic has its own opinions on how it is best configured, so let's install a package that provides both Prettier and Ionic's configuration. We will also install <a href="https://www.npmjs.com/package/husky" target="_blank">husky</a> and <a href="https://www.npmjs.com/package/pretty-quick" target="_blank">pretty-quick</a>. This will allow us to set up a commit hook to make sure Prettier is run with each commit. After that we don't have to waste brain cycles thinking about code formatting ever again.

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
  },
  "private": true,
  "dependencies": {
    ...
  },
  "devDependencies": {
    ...
  },
  "prettier": "@ionic/prettier-config",
  "husky": {
    "hooks": {
      "pre-commit": "pretty-quick --staged"
    }
  }
}
```

Finally, make sure all of our source is formatted properly.

```bash
$ npx prettier --write src
```

At this point all of the source should be formatting properly and will remain so automatically with each commit.

## Conclusion

Congratulations on creating your `@ionic/react` application. Next we will explore unit tests and discuss how they can help us in our development lifecycle.
