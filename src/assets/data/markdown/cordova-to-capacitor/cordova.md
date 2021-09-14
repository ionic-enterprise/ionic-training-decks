# Create an Apache Cordova App

Let's create a very simple Ionic Framework based Apache Cordova application to use for this tutorial. This application will just be one of Ionic's starter applications with the minimal Cordova plugins included.

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

At this point, make sure everything is committed to your git repository in case we need to fallback to this state:

```bash
$ git add .
$ git commit -m "I am so ready to convert to Capacitor"
```
