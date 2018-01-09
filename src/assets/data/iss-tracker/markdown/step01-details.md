# Details

The `ionic start lab-iss-tracker tabs` command will generate a new Ionic application using our tabs starter. Be sure to run this command where it will not interfere with the repo you are reading now.

Once the command finishes, you can `cd` into the newly created directory and use `ionic serve` to run the application in the browser. The `ionic serve` command will build the application, start a development web server, and serve up the application in your default browser. The process will then watch for changes and rebuild the application as you make them.

The first task we would like to do is to check and see if any of our libraries are outdated. If we run `npm outdated` we should see that indeed the Angular libraries and a few others are outdated. Some of these are safe to update, some are not. Knowing what is compatible and what is not can be tricky. For now, just update the `package.json` file as such and run `npm i` (short for `npm install`) to install the updates.

```
    "@angular/common": "~5.1.0", 
    "@angular/compiler": "~5.1.0", 
    "@angular/compiler-cli": "~5.1.0", 
    "@angular/core": "~5.1.0", 
    "@angular/forms": "~5.1.0", 
    "@angular/http": "~5.1.0", 
    "@angular/platform-browser": "~5.1.0", 
    "@angular/platform-browser-dynamic": "~5.1.0", 
    "@ionic-native/core": "~4.5.0", 
    "@ionic-native/splash-screen": "~4.5.0", 
    "@ionic-native/status-bar": "~4.5.0",
    ...
    "rxjs": "~5.5.2",
    ...
```

**Note:** the `~` (tilde) tells npm that we will accept bug fix releases to the package, meaning that if there is a `@angular/common` version `5.1.3` we will take it, but not a `5.2.0`. If you see a `^`, the meaning is similar but will allow updates to the minor version. That is, it would take `5.2.0` but not `6.0.0` in the above scenario.

The final step is to add the platforms that you are going to use. This allows you to build for your iOS and Android devices, emulate the devices on your development machine, and install development versions of the applications to physical devices. This will only work if you have the proper development tools and SDKs already installed on your system. Doing that is beyond the scope of this lab. You can skip adding these platforms if you wish.
