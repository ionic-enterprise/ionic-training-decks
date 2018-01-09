# Fix Usage on Device (iOS Only)

When we load the application onto an Android device and run it, everything works well. This first time we go to the "Passes" tab it will ask if we would like to allow the app to get our current location. If we allow it (which we better do since we didn't code for not allowing it), the device will grab our current location and display the pass data. On subsequent visits to the same tab, the device just gets the location (it doesn't have to ask us for permission again).

On iOS, we have a different story. The first time we go to the "Passes" page, the application just sits there. If we look at the console in Xcode, we see the following message:

```
[Warning] No NSLocationAlwaysUsageDescription or NSLocationWhenInUseUsageDescription key is defined in the Info.plist file.
2017-12-27 15:34:02.356954-0600 ISSTracker[4096:2822107]
```

Let's try fixing that and see what happens.

## Details

We do not want to be messing with the iOS build files after they are generated:

- any adjustments we make to them will get overwritten the next time they are rewritten
- any adjustments we make to them will not get transferred cleanly to a CI server or to Ionic Pro's build system

Instead, we want to add an entry to the `config.xml` file that will result in the property being set properly when the build files are generated. Open the `config.xml` file and add the following lines right before the `<platform name="android">` section.

```xml
<config-file parent="NSLocationWhenInUseUsageDescription" platform="ios" target="*-Info.plist"> 
  <string>Used to determine where to get passes</string> 
</config-file> 
```

If we perform `ionic build` and then use Xcode to rebuild and reinstall our application it behaves properly now. That is, on the first visit to the "Passes" page, it asks the user to allow the application to access the current location, including the `NSLocationWhenInUseUsageDescription` in the alert. If the user allows it, the page will show the current address and a list of passes. Just like on Android, the question is only asked on the first visit to the page.kkkkj
