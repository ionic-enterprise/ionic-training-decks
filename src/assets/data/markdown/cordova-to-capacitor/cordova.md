# Create a Cordova App

You presumably already have a Cordova based application that you want to convert, and you can use that if you wish. We suggest doing this walkthrough on a simple starter application first, though, just to get your feet wet. Then, once you have been through the process once, you will have all of the tools you need in order to perform these steps on your own projects.

```bash
$ ionic start cor-to-cap blank --type=angular --cordova
$ cd cor-to-cap
```

To make this app unique, let's give it a unique bundle ID and name by editing the `config.xml` file. Here is what I am using:

```xml
<widget id="com.kensodemann.cortocap" version="0.0.1" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/    ns/1.0">
    <name>Cor to Cap</name>
    <description>An awesome Ionic/Cordova app.</description>
```

Now let's generate the platforms:

```bash
$ npm run build
$ ionic cordova platform add ios
$ ionic cordova platform add android
```

We now have a fully functional, though minimal, Cordova application. In the next section, we will perform phase one of our conversion: installing and configuring Capacitor.

