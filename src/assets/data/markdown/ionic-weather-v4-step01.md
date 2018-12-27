# Lab: Generate the Application

In this lab, you will:

- Generate an Ionic application
- Build and run the generated application

## `ionic start`

The first step is to create the application from a starter. To do this you will use the `ionic start` command.

1. In a command prompt, change directory to your working folder
1. Run the following command: `ionic start ionic-weather tabs --type=angular --no-link --cordova`

Let's dig into that command some more:

- `ionic` - this is our wrapper around several other CLIs
- `start` - command to start a new application
- `ionic-weather` - the application's name
- `tabs` - the starter to use
- `--type=angular` - create an Ionic v4 / Angular application
- `--no-link` - do not ask to link the app to Appflow
- `--cordova` - do set up the Cordova infrastructure right away

This process will run for a while. It will generate the application from a starter template, install the required libraries via NPM, initialize the git repository for the application, and perform the initial git commit.

The output looks like this:

```bash
~/Projects/Training: ionic start ionic-weather tabs --type=angular --no-link --cordova
✔ Preparing directory ./ionic-weather - done!
✔ Downloading and extracting tabs starter - done!
> ionic integrations enable cordova --quiet
[INFO] Downloading integration cordova
[INFO] Copying integrations files to project
[OK] Integration cordova added!

Installing dependencies may take several minutes.

     ✨   IONIC  DEVAPP   ✨

 Speed up development with the Ionic DevApp, our fast, on-device testing mobile app

  -  🔑   Test on iOS and Android without Native SDKs
  -  🚀   LiveReload for instant style and JS updates

 -->    Install DevApp: https://bit.ly/ionic-dev-app    <--

────────────────────────────────────────────────────────────

> npm i

...

[INFO] Next Steps:

       - Go to your newly created project: cd ./ionic-weather
       - Get Ionic DevApp for easy device testing: https://bit.ly/ionic-dev-app
```

That command performec several steps. The most impotant are:

- Created an `ionic-weather` directory
- Created a fully functional skeleton application
- Downloaded all of the application's current dependencies
- Created a git repository
- Created the initial git commit

## Building and Running

Let's just make sure you can build your application:

1. `cd ionic-weather`
1. `ionic serve`

You should now see your application running in your default browser.

## Side Note: `ionic serve` vs. `npm start`

You may be used to using `npm start` to start an application. That works, but it is different. The application is for all intents and purposes an Angular application and was generated using the standard Angular schematics with some extra Ionic spices, so all of the base Angular CLI application scripts are there.

In a nutshell:

- `npm start` uses the Angular CLI directly calling `ng serve` without any options, which always tries to use port 4200
- `ionic serve` finds the first unused port >= 8100 and passes passes that to the Angular CLI with some other options

In either case, the Angular CLI does all the heavy lifting, so use whichever command you want to use. Personally, I use `npm start` because it take less typing and thought on my part.

## Conclusion

Congratulations on creating your `@ionic/angular` application. Next we will have to add some Cordova platforms so we can run the application on devices.
