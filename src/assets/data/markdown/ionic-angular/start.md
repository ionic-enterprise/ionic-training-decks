# Lab: Generate the Application

In this lab, you will:

- Use the CLI to create a starter application
- Learn some Ionic CLI commands
- Build and run the starter application

## Overview

The Ionic command line is the main tool used to develop Ionic applications. This tool allows you to generate new applications, add features to application, build the application, interact with Appflow and many other tasks. The command line also wraps and extends
several other command lines such as the Cordova or Capacitor command lines, the Angular command line, etc.

If you type `ionic --help` at the command line you get a list of the available top level commands that can be run via the CLI. These commands are broken into two sections: Global Commands and Project Commands. Global Commands can be run from anywhere where as Project Commands
can only be run from an Ionic project directory. Common top level commands include start, info, generate, and serve. We wil learn more about these commands as we use them.

## Create the Application

The first thing we will use the Ionic CLI for is to start a new application. Type `ionic start --help` to get some instructions on how the `start` command works as well as some expamples on how to use it. Notice that it has two basic modes of operation. You an either
enter enter the command with a complete set of options, at which point the start operation will run all of the way through without asking questions, or you can supply a partial set of options, and the `start` command will prompt you for the information that it needs.
If you just type `ionic start`, it will prompt for all of the information.

Lets start our application via whichever technique you want.

1. At the command line, change directories in to a starting directory. I use `~/Projects/Training`
1. Enter the following command: `ionic start tea-taster blank --type=angular --capacitor`
1. Alternately, you could just enter `ionic start` and let the command line ask you for what it needs

Let's look at some of those options more closely.

- The forth option, `blank` tells Ioinic to use the `blank` starter. We have three basic starters: `blank`, `tabs`, and `sidemenu`. The main difference is the main style of navigation.
- The `--type` option specifies the type of application to create. Options include `angular`, `react`, `ionic-angular`, and `ionic1`. The `ionic-angular` type is an Ionic v3 application.
- The `--capacitor` options tells the command line to integrate Capacitor as the native bridge. You could also choose Cordova, or nothing at all.


## Clone the Ionic Weather Starter Template

For this training we will start with a template application that is based on the tabs starter but has all of the pages renamed to match the page structure of the weather application.

```bash
git clone https://github.com/ionic-team/ionic-weather-starter.git ionic-weather
cd ionic-weather
npm i
ionic serve
```

## Side Note: `ionic serve` vs. `npm start`

You may be used to using `npm start` to start an application. That works, but it is different. The application is for all intents and purposes an Angular application and was generated using the standard Angular schematics with some extra Ionic spices, so all of the base Angular CLI application scripts are there.

In a nutshell:

- `npm start` uses the Angular CLI directly calling `ng serve` without any options, which always tries to use port 4200
- `ionic serve` finds the first unused port >= 8100 and passes that to the Angular CLI with some other options

In either case, the Angular CLI does all the heavy lifting, so use whichever command you want to use. Personally, I use `npm start` because it take less typing and thought on my part.

## Using the CLI

Note that you could have also used the Ionic CLI to generate your application:

- `ionic start` - this will ask for information like the application's name, desired framework, and starter template.
- `ionic start my-cool-app tabs --type=angular --capacitor` - this will create an `@ionic/angular` app called `my-cool-app` using the `tabs` starter template and will provide minimal Capacitor scaffolding.

The reason we do not do this for this training is that you would then have to rename the files and paths yourself, which doesn't really teach you anything... 😀

## Conclusion

Congratulations on creating your `@ionic/angular` application. Next we will explore unit tests and discuss how they can help us in our development lifecycle.
