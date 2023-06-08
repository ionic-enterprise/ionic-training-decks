# Lab: Host the Application

The Tea Taster application has been written as a hybrid mobile application, but we have also taken care to make sure it will still work in our development environment, which is web-based. This was done through a combination of using Capacitor Plugin APIs, which often support both mobile and web, and Ionic's `Platform` service to detect the current platform in cases where the APIs did not support the web. Therefore it is very easy to run the application as a web app.

In order to properly run our application as a web app it will need to be hosted somewhere. One of the easiest ways to do that is to use Firebase hosting.

In this lab you will learn:

- How to build your application as a web application
- How to host your application on Firebase
- How to run Lighthouse audits on your app

## Clone the Application

If you participated in the three-day Ionic Vue Framework training, then you should already have a copy of the application on your machine.

If you do not already have the application, you can clone the <a href="https://github.com/ionic-enterprise/tea-taster-vue" target="_blank">Tea Taster repo</a>. This repo contains the model application, including the PWA support. The repo also contains <a href="https://github.com/ionic-enterprise/tea-taster-vue/tags" target="_blank">several tags</a> that represent various milestones in development. To follow along, you should create a branch at one of the non-PWA milestones. We suggest one of the following:

- `end-basic-extra-credit`: this milestone represents the complete application without Identity Vault or Auth Connect. Use this tag if are not using those products.
- `auth-connect`: this milestone represents the application with Identity Vault and Auth Connect. Use this tag if you are using those products.

If you are cloning our repo as a starting point, follow these steps:

1. Clone the repository: <a href="https://github.com/ionic-enterprise/tea-taster-vue" target="\_blank">https://github.com/ionic-enterprise/tea-taster-vue</a>
1. `cd tea-taster-vue`
1. Create a branch at the appropriate tag (example: `git checkout -b feature/pwa auth-connect`)
1. `npm i`
1. `npm run build`
1. `npx cap sync`
1. `git remote remove origin`
1. Create your own remote origin if you so desire

**Note:** you can also do all of the steps in this tutorial using your own app, or even a newly generated starter template application. In those cases, it is up to you to modify the details of any steps as required.

## Building the Application for the Web

We have been building our application for the web using `ng serve` (or a command that ultimately runs `ng serve`), but that is all virtual. It does not actually write the files out to disk so we can serve them in some other way. If you would like to test this for yourself, remove the `www/` directory (if it exists) and start the development server. The usual build steps occur, and you can view your application, but no `www/` folder is generated.

To build for the web, use `ng build --configuration production`. This will build the application into the `www/` folder.

Since this is something that will be done often, and I suggest adding it as a script in your `package.json` file. Here is my full set of scripts for this project (this should already be configured properly from the starting repo):

```json
  "scripts": {
    "build": "ng build --configuration production && cap copy",
    "e2e": "ng e2e",
    "lint": "ng lint",
    "ng": "ng",
    "start": "ng serve",
    "test": "ng test --browsers=ChromeHeadless",
    "test:ci": "ng test --no-watch --browsers=ChromeHeadlessCI",
    "test:debug": "ng test"
  },
```

## Host the Application on Firebase

As the PWA is developed, it will need to be hosted. Firebase is one hosting option that exists. It is used for this course because it is easy to set up and use, and because Google offers a generous free tier that will easily cover our needs.

- If you do not already have a Firebase account, create one here: <a href="https://firebase.google.com/" target="_blank">https://firebase.google.com/</a>
- Go to the console and add a project: <a href="https://console.firebase.google.com/" target="_blank">https://console.firebase.google.com/</a>
  - Call the project `tea-taster-vue`
  - Firebase will generate a project ID for you
  - Use the default settings
  - If asked about Firebase Analytics, you can turn it off
  - Accept the terms and conditions
  - Click `Create project`

That is all you have to do on Firebase itself. The rest of the work needs to be done from the command line. First make sure you have the Firebase CLI tools and that you are logged in.

- `npm install -g firebase-tools`
- `firebase login`

From the `tea-taster-vue` root directory, run `firebase init` which will walk you through some steps to initialize your app:

- The only feature you need to chose is "Hosting: Configure and deploy Firebase Hosting sites".
- For "Project Setup", choose the project you just created
- Use `www` as your public directory
- Answer `Y` to "Configure as a single-page app (rewrite all urls to /index.html)?"
- Answer `N` to "File www/index.html already exists. Overwrite?" (if asked)

At this point, you are ready to build and deploy.

- `npm run build` - if you didn't already do this above
- `firebase deploy`

The deploy process should look something like this:

```bash
$ firebase deploy

=== Deploying to 'tea-taster-vue'...

i  deploying hosting
i  hosting[tea-taster-vue]: beginning deploy...
i  hosting[tea-taster-vue]: found 50 files in dist
✔  hosting[tea-taster-vue]: file upload complete
i  hosting[tea-taster-vue]: finalizing version...
✔  hosting[tea-taster-vue]: version finalized
i  hosting[tea-taster-vue]: releasing new version...
✔  hosting[tea-taster-vue]: release complete

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/tea-taster-vue/overview
Hosting URL: https://tea-taster-vue.web.app
```

Open an Icognito window and go to the specified `Hosting URL` (**note:** your hosting URL will be different than mine).

## Running Lighthouse Audits

<a href="https://developers.google.com/web/tools/lighthouse/" target="_blank">
  Lighthouse
</a> is an open-source tool that you can use to help improve the quality of your web applications. The tool is most easily
run from Chrome's DevTools, but can also be run from the command line or as a Node module. We will use the Chrome DevTools.

Notice that in the last step we opened the application in an Incognito window. It is suggested that you always run the Lighthouse tests in an Incognito window for the most accurate results.

- Open the dev tools and select the `Audits` tab
- Select the folloing options:
  - Device: Mobile
  - Audits:
    - Performance
    - Progressive Web App
    - Best Practices
  - Throttling: Simulated Fast 3G, 4x CPU Slowdown
  - Clear storage: checked

The last time I ran Lighthouse on the app in this stage, I got the following scores:

- **Performance:** 95
- **Progressive Web App:** 54
- **Best Practices:** 100

This indicates that our app is performaing well from a general web application perspective, but it is falling down from a PWA perspetive. The Lighthouse report will tell you exactly which tests the application is failing.

## Final Cleanup

The `firebase init` and `firebase deploy` steps created a few files:

```bash
$ git status
On branch master
Untracked files:
  (use "git add <file>..." to include in what will be committed)

	.firebase/
	.firebaserc
	firebase.json
```

The `firebase.json` and `.firebaserc` contain firebase configuration information and should be committed. The `.firebase` directory contains cache information and should be ignored.

- Add `/.firebase` to the `.gitignore` file
- Add `firebase.json` and `.firebaserc` to git
- Commit the two new files and changed `.gitignore` file

## Conclusion

We have just hosted the application as a web app and run the Lighthouse audits on it to get a baseline. Our application performs quite well, but does not meet the standards of a PWA. In the next lab we will fix that.
