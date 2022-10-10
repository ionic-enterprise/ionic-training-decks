# Lab: Add the PWA Goodies

Let's raise that PWA score to 100. In this lab you will learn:

- How to optimize the Firebase hosting
- How to install the Angular PWA library

## Optimize Firebase Hosting

Since we are using Firebase to host our app, we already get a lot of benefits for our PWA such as HTTPS and support for HTTP2 push. However there are a couple more optimizations we should make. These optimizations are specified in our <a href="https://ionicframework.com/docs/publishing/progressive-web-app/" target="_blank">Publishing a Progressive Web App</a> documentation and will be updated if anything changes.

Add the following configuration to your `firebase.json` file:

```JSON
"headers": [
  {
    "source": "ngsw-worker.js",
    "headers": [
      {
        "key": "Cache-Control",
        "value": "no-cache"
      }
    ]
  }
]
```

When you are complete, the `firebase.json` file should look something like this:

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
        "source": "ngsw-worker.js",
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

- HTTPS
- Service Workers
- The Web App Manifest

The HTTPS bit is handled by Firebase Hosting. Now we will handle the last two as well as adding some polish.

We need to install Angular's PWA library. Some of what the installation is going to do is going to have conflicts with work that `@capacitor/assets` already did for us. Specifically, Angular's PWA library will install some icons as well as a `src/manifest.webmanifest` file. It is that last file that is going to give us trouble, so let's move the existing one out of the way, and then install the Angular PWA tooling:

```
git mv src/manifest.webmanifest src/manifest.webmanifest.orig
npx ng add @angular/pwa
```

The `ng add` command did several things:

1. Installed a pre-built configurable service worker
1. Installed a pre-defined Web App Manifest file
1. Installed several default icons
1. Modified a couple of project files to load the service worker and web app manifest

Out of the box, this provides almost everything we need for our app to be served as a PWA. We need to adjust a few things:

- All of the icons are the Angular logo
- The application name is incorrect in the `src/manifest.webmanifest` file

Now is a good time to add the new files to our git repo and commit the other changes.

### Install Our Icons

When we generated the original app and ran `@capacitor/assets`, icons for use in a PWA were generated in the `icons` folder. We need to replace the Angular supplied icons with our generated icons.

```
rm -rf src/assets/icons
git mv icons src/assets
```

### Update the `src/manifest.webmanifest` File

The default `src/manifest.webmanifest` needs a couple of customizations for this application:

- The `name` needs to be updated
- The `short_name` needs to be updated
- The `background_color` needs to be updated to match the background of the icon
- The icons configuration needs to use the icons we just copied over

Here are the first three changes:

```diff
$ git diff src/manifest.webmanifest
diff --git a/src/manifest.webmanifest b/src/manifest.webmanifest
index 97f0552..6bf1d68 100644
--- a/src/manifest.webmanifest
+++ b/src/manifest.webmanifest
@@ -1,8 +1,8 @@
 {
-  "name": "app",
-  "short_name": "app",
+  "name": "Tea Taster",
+  "short_name": "TeaTaster",
   "theme_color": "#1976d2",
-  "background_color": "#fafafa",
+  "background_color": "#f1ebe1",
```

For the last change, replace the content of the `icons` array with the `icons` array values from `src/manifest.webmanifest.orig`. You can remove `src/manifest.webmanifest.orig` at this point.

## Configure the Service Worker

The current version of the service worker does not need to be configured. It currently does exactly what we need right out of the box. Here is the default configuration defined in `ngsw-config.json`:

```JSON
{
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": [
          "/favicon.ico",
          "/index.html",
          "/*.css",
          "/*.js"
        ]
      }
    }, {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": [
          "/assets/**",
          "/*.(eot|svg|cur|jpg|png|webp|gif|otf|ttf|woff|woff2|ani)"
        ]
      }
    }
  ]
}
```

The `app` asset group pre-fetches all of the application files. The result is that after the first access of the application, the application is launched from the user's device without having to download any code from the Internet.

The `assets` asset group lazily fetches application assets that tend to be larger, such as icons, images, and other assets. This prevents a large initial download and wasted space in the cache. The theory behind using an update mode of `prefetch` is that assets that already exist in the cache are likely to be needed again, so pre-fetching changes to those assets makes sense. Assets that have not been fetched yet are not as likely to be needed any time soon and are thus still lazy loaded when needed.

## Handle iOS Quirks (Sort Of...)

If you do a production build and deploy the application at this time:

- It will work great on Android devices
- It will get the following scores in Lighthouse:
  - **Performance:** 95
  - **Progressive Web App:** 100
  - **Best Practices:** 100
- It will mostly behave on iOS

Enter <a href="https://developers.google.com/web/updates/2018/07/pwacompat" target="_blank">PWACompat</a>. Follow the instuctions on that page to add this to your application. It involves addimg a `script` tag after the Web App Manifest is loaded. At this time, the markup looks like this:

```HTML
    <link rel="manifest" href="manifest.webmanifest" />
    <script async src="https://unpkg.com/pwacompat" crossorigin="anonymous"></script>
```

It should be noted that PWACompat <a href="https://medium.com/@firt/you-shouldnt-use-chrome-s-pwacompat-library-in-your-progressive-web-apps-6b3496faab62" target="_blank">has its detractors</a> so you should evaluate its use on a case by case basis, but for our current appliation it will work wonderfully. That is probably also the case for most applications.

## Conclusion

Do the following:

- commit all changes in git
- `npm run build`
- `firebase deploy`

You should be able to open the app on a web-browser on your Android or iOS device. On Android you will be prompted to install the app. On iOS you will have to it your self via the "Share" button. Once it is installed to your desktop, you should be able to launch it on either platform and get an experience that is just like the Hybrid Mobile app we developed.
