# Lab: Generate the Application

In this lab, you will:

- Clone a repo to get started
- Build and run the starter application

## Clone the Ionic Weather Starter Template

For this training we will start with a template application that is based on the tabs starter but has all of the pages renamed to match the page structure of the weather application.

```bash
git clone https://github.com/ionic-team/ionic-weather-react-starter.git ionic-weather
cd ionic-weather
npm i
ionic serve
```

## Side Note: `ionic serve` vs. `npm start`

You may be used to using `npm start` to start an application. That works, but it is different. The application is for all intents and purposes a React application and was generated using the Create React App starter with some extra Ionic spices, so all of the base Create React App configuration is there.

In a nutshell:

- `npm start` uses the React Scripts CLI directly calling `react-scripts start` without any options, which tries to use port 3000 by default, though if port 3000 is used it will ask to use a different port
- `ionic serve` finds the first unused port >= 8100 and sets that as the PORT before calling `react-scripts start`

In either case, react-scripts does all the heavy lifting, so use whichever command you want to use. Personally, I use `npm start` because it take less typing and thought on my part.

## Using the CLI

Note that you could have also used the Ionic CLI to generate your application:

- `ionic start` - this will ask for information like the application's name, desired framework, and starter template.
- `ionic start my-cool-app tabs --type=react` - this will create an `@ionic/react` app called `my-cool-app` using the `tabs` starter template.

The reason we do not do this for this training is that you would then have to rename the files and paths yourself, which doesn't really teach you anything... 😀

## Conclusion

Congratulations on creating your `@ionic/react` application. Next we will explore unit tests and discuss how they can help us in our development lifecycle.
