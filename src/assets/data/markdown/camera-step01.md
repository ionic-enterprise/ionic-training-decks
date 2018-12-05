# Lab: Generate the Application

In this lab, you will:

* generate an Ionic application
* build and run the generated application

## `ionic start`

The first step is to create the application and connect the application to Ionic Pro. To do this, use the `ionic start` command.

1. In a command prompt, change directory to the working folder
1. Run the following command: `ionic start camera blank --type=angular`

This process will run for a while. It will generate the application from a starter template, install the required libraries via NPM, initialize the local git repository for the application, and perform the initial git commit.

```bash
✔ Preparing directory ./camera - done!
✔ Downloading and extracting blank starter - done!

Installing dependencies may take several minutes.

     ✨   IONIC  DEVAPP   ✨

 Speed up development with the Ionic DevApp, our fast, on-device testing mobile app

  -  🔑   Test on iOS and Android without Native SDKs
  -  🚀   LiveReload for instant style and JS updates

 -->    Install DevApp: https://bit.ly/ionic-dev-app    <--

────────────────────────────────────────────────────────────

> npm i
...
i> git init
Initialized empty Git repository in /Users/kensodemann/Projects/CS Demos/camera/.git/

     🔥   IONIC  APPFLOW   🔥

 Supercharge your Ionic development with the Ionic Appflow SDK

  -  ⚠️   Track runtime errors in real-time, back to your original TypeScript
  -  📲  Push remote updates and skip the app store queue

 Learn more about Ionic Appflow: https://ionicframework.com/appflow

────────────────────────────────────────────────────────────

? Install the free Ionic Appflow SDK and connect your app?
```

Note the final message in the output. This is asking if you would like to connect your application to Appflow. You can answer "No" for now.

## Building and Running

Let's just make sure the application builds and runs:

1. `cd camera`
1. `ionic serve`

The application running in the default browser.

## Conclusion

In this lab, we learned how to generate a simple starter application and how to run the application in the browser.