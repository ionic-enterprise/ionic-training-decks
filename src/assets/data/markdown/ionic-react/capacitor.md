# Lab: Using Capacitor

## Install Capacitor

From your application's root directory run: `ionic integrations enable capacitor`

You should see the following changes to your application:

```Bash
$ git status
On branch training/stepByStep_ThrowAway
Your branch is up to date with 'origin/training/stepByStep_ThrowAway'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   ionic.config.json
	modified:   package-lock.json
	modified:   package.json

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	capacitor.config.json

no changes added to commit (use "git add" and/or "git commit -a")
```

Having a closer look at a couple of those files:

```diff
diff --git a/package.json b/package.json
index 9684a24..ba2ffa9 100644
--- a/package.json
+++ b/package.json
@@ -3,6 +3,7 @@
   "version": "0.0.1",
   "private": true,
   "dependencies": {
+    "@capacitor/core": "1.4.0",
     "@ionic/react": "~4.11.7",
     "@ionic/react-router": "~4.11.7",
     "@types/jest": "~24.0.24",
@@ -21,6 +22,7 @@
     "typescript": "~3.7.4"
   },
   "devDependencies": {
+    "@capacitor/cli": "1.4.0",
     "@testing-library/react": "~9.4.0"
   },
   "scripts": {
```

```diff
diff --git a/ionic.config.json b/ionic.config.json
index fee85d2..3179f93 100644
--- a/ionic.config.json
+++ b/ionic.config.json
@@ -1,5 +1,7 @@
 {
   "name": "ionic-weather-react-starter",
-  "integrations": {},
+  "integrations": {
+    "capacitor": {}
+  },
   "type": "react"
 }
```

Commit those changes now.

## Install Platforms

We want to build for two platforms: Android and iOS. Install both of those platforms now (note: I am assuming you are developing on a Mac, if not that is OK, just get one... well, or only do the Android bit, whichever you find best)

Run the following two commands:

- `npx cap add android`
- `npx cap add ios`

The `npx` command is one you may not have used much before. Basically, it will use your current NPM environment to run the command that follows it.

Those commands installed a couple of libraries and constructed the project directories for iOS and Android. Go ahead and have a look at the changes, then commit them.

## Update the Build Script

Just like with Cordova, Capacitor applications consist of a web application wrapped in a native application and run inside a webview. The current `npm run build` command will only run the web build. Once it is complete we need to copy it to the native projects. To do that manually, we can run `npx cap copy` after the `npm run build` completes. If we do that, though, there are times that we will probably forget to do it. It would be better to update the "build" script in the `package.json` to just do it for us.

The build script currently looks like this: `"build": "react-scripts build",`

Change the build script to look like this: `"build": "react-scripts build; cap copy",`

Note that we not need the `npx` part here because this command is automatically run within the current NPM environment.

## Run on Devices

To run on a device or an emulator, use `npx cap open android` or `npx cap open ios` to open the proper IDE and then run anywhere you want to from there.

Notice that on iOS the status bar text is black and hard to read on the dark blue background. On Android, the status bar is black. The Android specs say it should be a different color than the application's header, but it would be nice if it was closer to the color of the application header. We will fix that stuff next.

## Using the Capacitor APIs

### Hide the Splash Screen and Style the Status Bar

**Note:** unfortunatly, I have not found a good way to get this yet, so comment out all of the `App.test.ts` file and add the following placeholder test:

```TypeScript
it('is just a placeholder', () => {
  expect(true).toBeTruthy();
})
```

Next, add an effect hook where we can then use the Capacitor API to hide the Splash Screen, set the style of the status bar, as well as its background color if we are on Android:

```TypeScript
  useEffect(() => {
    if (isPlatform('cordova')) {
      Plugins.SplashScreen.hide();
      Plugins.StatusBar.setStyle({ style: StatusBarStyle.Dark });
      if (isPlatform('android')) {
        Plugins.StatusBar.setBackgroundColor({ color: '#074f8b' });
      }
    }
  });
```

Rebuild the application and run these on the devices (or emulators) to see the difference.

### Use the Geolocation API

#### Test First

First, mock the Geolocation API.  The only requirement for the value resolved by `getCurrentPosition()` is that the `coords` should be different than than the hard-coded ones you picked.

```TypeScript
import { Plugins } from '@capacitor/core';
...
  beforeEach(() => {
    (Plugins.Geolocation.getCurrentPosition as any) = jest.fn(() =>
      Promise.resolve({ coords: { latitude: 42.123, longitude: -73.4242 } })
    );
  });

  afterEach(() => (Plugins.Geolocation.getCurrentPosition as any).mockRestore());
```

Next, change the tests that compare the URL. Use the latitude and longitude resoled by the mock instead of the hard coded values that are in the code. All of those tests should fail now.

#### Code Second

Modify the `currentLocation()` method to call the Geolocation API.

```TypeScript
  private async currentLocation(): Promise<Coordinate> {
    const { coords } = await Plugins.Geolocation.getCurrentPosition();
    return {
      latitude: coords.latitude,
      longitude: coords.longitude
    };
  }
```

Test the code changes on Android and iOS devices (or emulators). The application should now ask for permission to use Geolocation.

## Conclusion

You have now integrated your application with Capacitor and can now build it for native platforms.
