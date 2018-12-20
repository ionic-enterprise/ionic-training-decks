# Lab: Add Capacitor

In this lab, you will:

* add Capacitor to the project
* add the iOS and Adnroid platforms
* build and run the application on both platforms

## Capacitor in a Nutshell

Capacitor is a cross platform application runtime that is the spiritual successor to Apache Cordova and Adobe PhoneGap. Capacitor occupies the same space in the Ionic appliation stack that Cordova does and makes it easy to build applications that run natively on iOS, Android, Electron, _and_ the web.

A couple of key features that will be highlighted as we build this application are:

1. it makes the project for each platform a source artifact rather than a build artifact
1. it provides an API for the most commonly used native features

For this lab, we will focus on creating the application to run natively on iOS and on Android.

## Install Capacitor

Install Capacitor using `ionic capacitor update`

```bash
~/Projects/photo-gallery (master): ionic capacitor update
> ionic integrations enable capacitor
> npm i --save -E @capacitor/core
+ @capacitor/core@1.0.0-beta.11
removed 81 packages, updated 1 package and audited 49792 packages in 6.309s
found 0 vulnerabilities

> npm i --save -E @capacitor/cli
+ @capacitor/cli@1.0.0-beta.11
added 80 packages from 60 contributors and audited 51136 packages in 8.688s
found 0 vulnerabilities

> capacitor init photo-gallery io.ionic.starter
...
```

Let's see what that did:

```bash
~/Projects/photo-gallery (master *): git status
On branch feature/addAndroid
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

	modified:   ionic.config.json
	modified:   package-lock.json
	modified:   package.json

Untracked files:
  (use "git add <file>..." to include in what will be committed)

	capacitor.config.json

no changes added to commit (use "git add" and/or "git commit -a")
```

Notice that it added a file called `capacitor.config.json`. Let's make some minor changes to that file:

```json
{
  "appId": "com.kensodemann.photogallery",
  "appName": "Photo Gallery",
  "bundledWebRuntime": false,
  "webDir": "www"
}
```

Commit the change:

```bash
~/Projects/photo-gallery (master *): git add capacitor.config.json
~/Projects/photo-gallery (master *+): git commit -am "feat(app): install capacitor"
```

## Initial Build

In order to add platforms, the application needs to have been built at least once. Otherwise adding the platform will fail when the generated `www` directory is not found.

`ionic build`

## Android

### Add the Platform

Use the `ionic capacitor add android` command to add the Android platform to the project. This will allow you to configure and run Android builds of your application.

```bash
~/Projects/photo-gallery (master): ionic capacitor add android
> capacitor add android
✔ Installing android dependencies in 7.42s
✔ Adding native android project in: /Users/kensodemann/Projects/photo-gallery/android in 75.78ms
...
```

This command adds an `android/` directory to the project and adds the `@capacitor/android` npm package as a dependency in the `package.json` file.

```bash
~/Projects/photo-gallery (master *): git status
On branch feature/addAndroid
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

	modified:   package-lock.json
	modified:   package.json

Untracked files:
  (use "git add <file>..." to include in what will be committed)

	android/

no changes added to commit (use "git add" and/or "git commit -a")
```

Add the `android/` folder to git and commit the changes. 

```bash
~/Projects/photo-gallery (master *): git add android/
warning: CRLF will be replaced by LF in android/gradlew.bat.
The file will have its original line endings in your working directory
~/Projects/photo-gallery (master *+): git commit -am "feat(app): add android"
```

### Build and Run

Use `ionic capacitor open android` to open the application in Android Studio. From there you can build and run the application on a device or emulator.

```bash
~/Projects/photo-gallery (feature/addAndroid): ionic capacitor open android
> capacitor open android
[info] Opening Android project at /Users/kensodemann/Projects/photo-gallery/android
```

Any changes that are required in the `AndroidManifest.xml` document can also be made from here and saved. Since the build configuration is a source artifact with Capacitor those changes will be retained for future builds.

## iOS (Mac is Required)

### Add the Platform

Use the `ionic capacitor add ios` command to add the Android platform to the project. This will allow you to configure and run iOS builds of the application.

> **Note**: Capacitor uses CocoaPods to manage iOS dependencies. You may need to run `(sudo) gem install cocoapods` before continuing. See <a href="https://guides.cocoapods.org/using/getting-started.html#installation" target="_blank">this link</a> for more information.

```bash
~/Projects/photo-gallery (master): ionic capacitor add ios
> capacitor add ios
✔ Installing iOS dependencies in 10.02s
✔ Adding native xcode project in: /Users/kensodemann/Projects/photo-gallery/ios in 93.29ms
✔ add in 10.12s
✔ Copying web assets from www to ios/App/public in 624.01ms
✔ Copying native bridge in 1.50ms
✔ Copying capacitor.config.json in 888.82μp
✔ copy in 636.20ms
✔ Updating iOS plugins in 4.72ms
  Found 0 Capacitor plugins for ios:
✔ Updating iOS native dependencies in 20.95s
✔ update ios in 20.97s
```

This command adds an `ios/` directory to the project and adds the `@capacitor/ios` npm package as a dependency in the `package.json` file.

```bash
~/Projects/CS Demos/photo-gallery (master *): git status
On branch master
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

	modified:   package-lock.json
	modified:   package.json

Untracked files:
  (use "git add <file>..." to include in what will be committed)

	ios/

no changes added to commit (use "git add" and/or "git commit -a")
```

Add the `ios/` folder to git and commit the changes. 

```bash
~/Projects/CS Demos/photo-gallery (master *): git add ios
~/Projects/CS Demos/photo-gallery (master *+): git commit -am "feat(app): add ios"
```

### Build and Run

Use `ionic capacitor open ios` to open the application in Xcode. From there you can build and run the application on a device or emulator. *Note:* in order to run the application on a device, you need to specify a "Team" along with "Provisioning Profile" and "Signing Certificate"

```bash
~/Projects/CS Demos/photo-gallery (master): ionic capacitor open ios
> capacitor open ios
✔ Opening the Xcode workspace... in 3.02s
```

Doing this modifies the project a bit.

```bash
~/Projects/CS Demos/photo-gallery (master *): git status
On branch master
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

	modified:   ios/App/App.xcodeproj/project.pbxproj

Untracked files:
  (use "git add <file>..." to include in what will be committed)

	ios/App/App.xcworkspace/xcshareddata/

no changes added to commit (use "git add" and/or "git commit -a")
```

Add and commit those:

```bash
~/Projects/CS Demos/photo-gallery (master *): git add ios/App/App.xcworkspace/xcshareddata
~/Projects/CS Demos/photo-gallery (master *+): git commit -am "feat(app): update ios project"
```

## Conclusion

In this lab, we learned how to add various platforms and how to build the application for those platforms.
