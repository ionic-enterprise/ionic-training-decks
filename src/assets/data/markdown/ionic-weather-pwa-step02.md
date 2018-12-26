# Lab: Add the PWA Goodies

Let's raise that PWA scrore to 100. In this lab you will learn:

* How to optimize the Firebase hosting
* How to install the Angular PWA library

## Optimize Firebase Hosting

Since we are using Firebase to host our app, we already get a lot of benefits for our PWA such as HTTPS and support for HTTP2 push. However there are a couple more optimizations we should make. These optimizations are specified in our <a href="https://beta.ionicframework.com/docs/publishing/progressive-web-app/" target="_blank">Publishing a Progressive Web App</a> documentation and will be updated if anything changes.

Add the following configuration to your `firebase.json` file:

```JSON
"headers": [
  {
    "source": "/build/app/**",
    "headers": [
      {
        "key": "Cache-Control",
        "value": "public, max-age=31536000"
      }
    ]
  },
  {
    "source": "sw.js",
    "headers": [
      {
        "key": "Cache-Control",
        "value": "no-cache"
      }
    ]
  }
]
```

When you are comlpete, the `firebase.json` file should look something like this:

```JSON
{
  "hosting": {
    "public": "www",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/build/app/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000"
          }
        ]
      },
      {
        "source": "sw.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache"
          }
        ]
      }
    ]
  }
}
```

## Install and Configure `@angular/pwa`

A PWA is built upon three key pieces of technology:

* HTTPS
* Service Workers
* The Web App Manifest

The HTTPS bit is handled by Firebase Hosting. Now we will handle the last two as well as adding some polish.

First, let's install Angular's PWA library by running `ng add @angular/pwa`. This command did several things:

1. Installed a pre-built configurable service worker
1. Installed a pre-defined Web App Manifest file
1. Installed several default icons
1. Modified a couple of project files to load the service worker and web app manifest

Out of the box, this provides almost everything we need for our app to be served as a PWA. We need to adjust a few things, however.

* All of the icons are the Angular logo
* The application name is incorrect in the `src/manifest.json` file

Now is a good time to add the new files to our git repo and commit the other changes.

### Install Our Icons

<a download href="/assets/images/icons.zip">Download our icons</a> and unpack the zip file under `src/assets`, replacing the files in the  `images` folder.

**Note:** the specifics on doing this depends on the type of machine you are using. On a Mac:

1. Drag and drop the `icons.zip` from `Downloads` into `src/assets`
1. Remove the existing `icons` folder
1. Double click the `icons.zip` file in `src/assets` which creates a new `icons` folder
1. Remove the `icons.zip` file

### Update the `src/manifest.json` File

The default `src/manifest.json` file is complete, but it needs a couple of customizations for this application:

* The `name` and `short_name` need to be updated
* The `background_color` needs to be updated to match the background of the icon

Here are the changes:

```diff
~/Projects/Training/ionic-weather (master *): git diff src/manifest.json
diff --git a/src/manifest.json b/src/manifest.json
index 97f0552..6bf1d68 100644
--- a/src/manifest.json
+++ b/src/manifest.json
@@ -1,8 +1,8 @@
 {
-  "name": "app",
-  "short_name": "app",
+  "name": "Ionic Weather",
+  "short_name": "IonicWeather",
   "theme_color": "#1976d2",
-  "background_color": "#fafafa",
+  "background_color": "#f4a942",
```

## Configure the Service Worker

The service worker does exactly what we need it to do out of the box, which is to say it caches the application locally, downloads changes to the application as they are deployed, and applied them the next time the application is launched so the user does not experience change while using the app.

What it does not do is cache SVG files, and our app makes use of those for all of the button icons. Let's fix that.

Edit the `ngsw-config.json` file and add `*.svg` to the list of files that are pre-fetched and cached:

```JSON
      "resources": {
        "files": [
          "/favicon.ico",
          "/index.html",
          "/*.css",
          "/*.js",
          "/*.svg"
        ]
      }
```

## Handle iOS Quirks (Sort Of...)

If you build and deploy the application at this time:

* It will work great on Android devices
* It will get the following scores in Lighthouse:
   * **Performance:** 95
   * **Progressive Web App:** 100
   * **Best Practices:** 100 
* It will only sorta/kinda behave on iOS

Enter <a href="https://developers.google.com/web/updates/2018/07/pwacompat" target="_blank">PWACompat</a>. Follow the instuctions on that page to add this to your application. It involves addimg a `script` tag after the Web App Manifest is loaded. At this time, the markup looks like this:

```HTML
    <link rel="manifest" href="manifest.json" />
    <script
      async
      src="https://cdn.jsdelivr.net/npm/pwacompat@2.0.6/pwacompat.min.js"
      integrity="sha384-GOaSLecPIMCJksN83HLuYf9FToOiQ2Df0+0ntv7ey8zjUHESXhthwvq9hXAZTifA"
      crossorigin="anonymous"
    ></script>
```

It should be noted that PWACompat <a href="https://medium.com/@firt/you-shouldnt-use-chrome-s-pwacompat-library-in-your-progressive-web-apps-6b3496faab62" target="_blank">has its detractors</a> so you should evaluate its use on a case by case basis, but for our current appliation it will work wonderfully. That is probably also the case for most applications.

## Conclusion

Do the following:

* commit all changes in git
* `npm run build:web`
* `firebase deploy`

You should be able to open the app on a web-browser on your Android or iOS device. On Android you will be prompted to install the app. On iOS you will have to it your self via the "Share" button. Once it is installed to your desktop, you should be able to launch it on either platform and get an experience that is just like the Hybrid Mobile app we developed.

Except for one thing. The current location setting is not actually getting the current location. We will fix that in the next lab.