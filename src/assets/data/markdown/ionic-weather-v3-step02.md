# Lab: Integrate Ionic Appflow

The first task we will perform with our newly generated application is to integrate it with the Ionic Appflow services. Ultimately, this will allow us to deploy changes to our devices.

In order to complete this lab, you will need the Ionic Appflow ID for your application. This is obtained from the <a href="https://dashboard.ionicframework.com/apps" target="_blank">Ionic Appflow Dashboard</a>.

To set up your application for use with Ionic Appflow you will need to install the Ionic Appflow deploy plugin.

In this lab, you will perform the following tasks:

1. update the reverse-domain ID
1. add at least one platform to your project (iOS or Android)
1. add the Ionic Appflow Cordova Plugin
1. build your application for your device
1. install the application on your device
1. push changes to Ionic Appflow
1. try the Ionic Appflow deploy feature

## Update the Reverse-Domain ID

The reverse domain ID is used as the Bundle ID or iOS and the Package Name for Android. It should be something unique. For personal applications, I suggest using `com.yourname.appname`.

1. open the `config.xml` file
1. change the `id` property of the `widget` node

```xml
<widget id="com.kensodemann.ionicweather"
        version="0.0.1"
        xmlns="http://www.w3.org/ns/widgets"
        xmlns:cdv="http://cordova.apache.org/ns/1.0">
```

## Add a Platform (or Two)

Add at least the platform matching the device you will use for this course. If you do not want to use an actual device, you can also use a simulator.

1. run at least one of the following
    1. `ionic cordova platform add ios`
    1. `ionic cordova platform add android`
1. `git add resources/*`

**Note:** If you have Xcode 10, you may need to take <a href="https://github.com/apache/cordova-ios/issues/407" target="_blank">this cordova-ios issue</a> into account.

## Add the Ionic Appflow Cordova Plugin

You are now ready to install the Ionic Appflow Cordova plugin. Use a command like the following. Make sure you use your application's ID in place of `YOUR_APP_ID`.

You can also generate this command by clicking `SET UP DEPLOY` on the channels page for your application on the Ionic Appflow dashboard.

```bash
cordova plugin add cordova-plugin-ionic --save \
--variable APP_ID="YOUR_APP_ID" \
--variable CHANNEL_NAME="Master" \
--variable UPDATE_METHOD="auto"
```

When you are done, you should see markup similar to the following in your `config.xml` file:


```xml
    <plugin name="cordova-plugin-ionic" spec="5.1.3">
        <variable name="APP_ID" value="1234abcd" />
        <variable name="CHANNEL_NAME" value="Master" />
        <variable name="UPDATE_METHOD" value="auto" />
        <variable name="WARN_DEBUG" value="true" />
        <variable name="UPDATE_API" value="https://api.ionicjs.com" />
        <variable name="MAX_STORE" value="2" />
        <variable name="MIN_BACKGROUND_DURATION" value="30" />
    </plugin>
```

You should also see markup similar to the following in your `package.json` file

```JSON
  "cordova": {
    "plugins": {
      "cordova-plugin-whitelist": {},
      "cordova-plugin-statusbar": {},
      "cordova-plugin-device": {},
      "cordova-plugin-splashscreen": {},
      "cordova-plugin-ionic-webview": {},
      "cordova-plugin-ionic-keyboard": {},
      "cordova-plugin-ionic": {
        "APP_ID": "024c2e54",
        "CHANNEL_NAME": "Master",
        "UPDATE_METHOD": "auto",
        "WARN_DEBUG": "true",
        "UPDATE_API": "https://api.ionicjs.com",
        "MAX_STORE": "2",
        "MIN_BACKGROUND_DURATION": "30"
      }
    },
```

These parameters can be updated later if need be. For example, the most common update method for production systems is `background` and not `auto`.

## Build the Application for Your Device

Run at least one of the following commands:

- `ionic cordova build android`
- `ionic cordova build ios`

The iOS build may fail in the packaging step, but that is OK. 

## Commit your changes and push to Ionic Appflow

1. `git commit -am "integrate ionic pro"`
1. `git push ionic pro`
1. `git push` (if you have an origin remote)

## Install the Application on Your Device

### iOS 

**Note:** you may need to perform some security related configuration on your device and you will need to have some form of an Apple developer account be it via your organization or a personal account (which can be free or paid)

1. open the project in Xcode: `open platforms/ios/ionic-weather.xcworkspace`
1. click on `ionic-weather` in the project tree
1. choose either your personal team or your organization's team
1. connect your phone
1. select your phone from the device drop-down
1. press the run button

**Note:** it is also possible to use `ionic cordova run ios` but I find that Xcode works better and more consistently.

### Android 

**Note:** you will need to put your device in "Developer Mode" if it is not already

1. connect your device
1. `adb devices` - make sure your device is listed
1. `ioinc cordova run android` - this will build your application and run it on your attached Android device

**Note:** it is also possible to use Android Studio to build and run the application

## Try Ionic Appflow Deploy

Currently, the about page does not show anything. Use that fact to test your deploy by modifying the `about.html` file as such:

```html
<ion-header>
  <ion-navbar>
    <ion-title>
      About
    </ion-title>
  </ion-navbar>
</ion-header>

<ion-content padding>
  <div>
    This is a starter application, so I cannot really tell you much.
  </div>
</ion-content>
```

1. close the application running on your device (be sure to close it, not just background it)
1. make the above change
1. `git commit -am "test(ionic-pro): update the about page"`
1. `git push`
1. `git push ionic master`
1. once the build finishes, verify that the master channel has been updated to the latest build
1. open the app, and verify your change is there
