# Lab: Host the Application

The Ionic Weather application has been written as a hybrid mobile application, but we have also taken some care to make sure it would still work in our development environment, which is web-based. Therefore it should be very easy to run the application as a web app. In order to do this, it will need to be hosted somewhere. One of the easiest ways to do that is to use Firebase hosting. 

In this lab you will learn: 

* How to build your application as a web application
* How to host your application on Firebase
* How to run Lighthouse audits on your app

## Building the Application for the Web

We have been building our application for the web using `ng serve` (or a command that ultimately runs `ng serve`), but that is all virtual. It does not actually write the files out to disk so we can serve them in some other way. If you would like to test this for yourself, remove the `www/` directory (if it exists) and start the development server. The usual build steps occur, and you can view your application, but no `www/` folder is generated.

To build for the web, use `ionic build --engine=browser --prod`. This will build the application into the `www/` folder. It will also not include `cordova.js` since that is not available on the web, and it will minify the source.

Since this is something that will be done often, and I suggest adding it as a script in your `package.json` file. Here is my full set of scripts for this project:


```JSON
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "start:iphone7": "ionic cordova run ios --target='iPhone-7, 12.1' -- -buildFlag='-UseModernBuildSystem=0'",
    "start:iphonex": "ionic cordova run ios --target='iPhone-X, 12.1' -- -buildFlag='-UseModernBuildSystem=0'",
    "build": "ng build",
    "build:ios": "ionic cordova build ios --prod -- -buildFlag='-UseModernBuildSystem=0'",
    "build:web": "ionic build --engine=browser --prod",
    "test": "ng test",
    "lint": "ng lint",
    "e2e": "ng e2e"
  },
```

Now running `npm run build:web` will result in a build that is ready to be served as a web application.

## Host the Application on Firebase

If we develop a PWA, we eventually need to host it. Firebase is one hosting option that exists. We use it for the course because it is easy to set up and use and because Google offers a generous free tier that will easily cover our needs.

* If you do not already have a Firebase account, create one here: https://firebase.google.com/
* Go to the console and add a project: https://console.firebase.google.com/
   * Call the project `ionic-weather`
   * Firebase will generate a project ID for you
   * Use the default settings
   * Accept the terms and conditions
   * Click `Create project`

That is all you have to do on Firebase itself. The rest of the work needs to be done from the command line. First make sure you have the Firebase CLI tools and that you are logged in.

* `npm install -g firebase-tools`
* `firebase login`

From the `ionic-weather` root directory, run `firebase init` which will walk you through some steps to initialize your app:

* The only feature you need to chose is "Hosting: Configure and deploy Firebase Hosting sites".
* For "Project Setup", choose the project you just created
* Use `www` as your public directory
* Answer `Y` to "Configure as a single-page app (rewrite all urls to /index.html)?"
* Answer `N` to "File www/index.html already exists. Overwrite?" (if asked)

At this point, you are ready to build and deploy.

* `npm run build:web` - if you didn't already do this above
* `firebase deploy`

The deploy process should look something like this:

```
~/Projects/Training/ionic-weather (master): firebase deploy

=== Deploying to 'ionic-weather-1792a'...

i  deploying hosting
i  hosting[ionic-weather-1792a]: beginning deploy...
i  hosting[ionic-weather-1792a]: found 901 files in www
✔  hosting[ionic-weather-1792a]: file upload complete
i  hosting[ionic-weather-1792a]: finalizing version...
✔  hosting[ionic-weather-1792a]: version finalized
i  hosting[ionic-weather-1792a]: releasing new version...
✔  hosting[ionic-weather-1792a]: release complete

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/ionic-weather-1792a/overview
Hosting URL: https://ionic-weather-1792a.firebaseapp.com
```

Open an Icognito window and go to the specified `Hosting URL`.

## Running Lighthouse Audits

<a href="https://developers.google.com/web/tools/lighthouse/" target="_blank">Lighthouse</a> is an open-source tool that you can use to help improve the quality of your web applications. The tool is most easily run from Chrome's DevTools, but can also be run from the command line or as a Node module. We will use the Chrome DevTools.

Notice that in the last step we opened the application in an Incognito window. It is suggested that you always run the Lighthouse tests in an Incognito window for the most accurate results.

* Open the dev tools and select the `Audits` tab
* Select the folloing options:
   * Device: Mobile
   * Audits:
      * Performance
      * Progressive Web App
      * Best Practices
   * Throttling: Simulated Fast 3G, 4x CPU Slowdown
   * Clear storage: checked

The last time I ran Lighthouse on the app in this stage, I got the following scores:

* **Performance:** 95
* **Progressive Web App:** 54
* **Best Practices:** 100

This indicates that our app is performaing well from a general web application perspective, but it is falling down from a PWA perspetive. The Lighthouse report will tell you exactly which tests the application is failing.

## Final Cleanup

The `firebase init` and `firebase deploy` steps created a few files:

```
~/Projects/Training/ionic-weather (master): git status
On branch master
Untracked files:
  (use "git add <file>..." to include in what will be committed)

	.firebase/
	.firebaserc
	firebase.json
```

The `firebase.json` and `.firebaserc` contain firebase configuration information and should be committed. The `.firebase` directory contains cache information and should be ignored.

* Add `.firebase/` to the `.gitignore` file
* Add `firebase.json` and `.firebaserc` to git
* Commit the two new files and changed `.gitignore` file

## Conclusion

We have just hosted the application as a web app and run the Lighthouse audits on it to get a baseline. Our application performs quite well, but does not meet the standards of a PWA. In the next lab we will fix that.