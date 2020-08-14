# Lab: Generate the Application

In this lab, you will:

- Clone a repo to get started
- Build and run the starter application

## Clone the Ionic Weather Starter Template

For this training we will start with a template application that is based on the tabs starter but has all of the pages renamed to match the page structure of the weather application.

```bash
git clone https://github.com/ionic-team/ionic-weather-starter.git ionic-weather
cd ionic-weather
npm i
ionic serve
```

## Enforce Consistent Styling

<a href="https://prettier.io/" target="_blank">Prettier</a> is an excellent tool that you can use to keep the formatting of your code consistent and clean. We highly suggest you use a tool such as this. Whether your are a lone developer or part of a team, using a tool such as Prettier means that you do not have to think about the formatting of your code. Better yet, you do not run into "formatting wars" between developers.

Prettier itself is an opinionated code formatter, and Ionic has its own opinions on how it is best configured, so let's install a package that provides both Prettier and Ionic's configuration. We will also install <a href="https://www.npmjs.com/package/husky" target="_blank">husky</a> and <a href="https://www.npmjs.com/package/pretty-quick" target="_blank">pretty-quick</a>. This will allow us to set up a commit hook to make sure Prettier is run with each commit. After that we don't have to waste brain cycles thinking about code formatting ever again.

```bash
$ npm install -D @ionic/prettier-config husky prettier pretty-quick
```

Modify your `package.json` file. I suggest moving the `description` up to the top and giving it a reasonable value, and then adding the Prettier config portion to the bottom. For example:

```json
{
  "name": "ionic-weather",
  "description": "A personal weather application",
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
