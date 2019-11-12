# Lab: Auth0 Service

## Install Auth Connect

Before we can use Auth Connect, we need to install it. In order to install it, we need to be using the `@ionic-enterprise/cordova` version of the CLI. If you have not already set this up on your development machine, run the following commands:

```Bash
$ npm uninstall -g cordova
$ npm install -g @ionic-enterprise/cordova
```

Once that is set up properly, make sure you are in your `ac-training-starter` working directory and run the following commands:

```Bash
$ ionic enterprise register --key=YOURPRODUCTKEY
$ npm i @ionic-enterprise/auth
```

*Note:* Two different commands exist for installing Auth Connect in your project depending on whether you are using Capacitor or Cordova:

- _Capacitor_: `npm i @ionic-enterprise/auth`
- _Cordova_: `ionic cordova plugin add @ionic-enterprise/auth`

Be sure to use the correct command based on your application's stack. Since we are using Capacitor, we need to use the `npm install` based command. We also need to make sure the native projects get updated with the newly installed Cordova plugin:

```
$ npx cap update
```

## Update the Native Project Config Files

In both examples below, replace `$AUTH_URL_SCHEME` with your URL scheme you choose from the previous step. For Android, we need to make the following adjustments to the `Android Manifest.xml` file:

```xml
<intent-filter>
    <data android:scheme="$AUTH_URL_SCHEME"/>
    <action android:name="android.intent.action.VIEW"/>
    <category android:name="android.intent.category.DEFAULT"/>
    <category android:name="android.intent.category.BROWSABLE"/>
</intent-filter>
<intent-filter>
    <action android:name="android.intent.action.SEND"/>
    <category android:name="android.intent.category.DEFAULT"/>
    <data android:mimeType="text/*"/>
</intent-filter>
```

iOS requires us to add a section to the `Info.plist` file as well:

```xml
<dict>
    <key>CFBundleURLSchemes</key>
    <array>
        <string>$AUTH_URL_SCHEME</string>
    </array>
</dict>
```

## Inherit from `IonicAuth`

Auth Connect includes a class called `IonicAuth` which provides the common authentication functionality. By the end of this section we will have created a new `Auth0Service` to be a subclass of the `IonicAuth` class, giving us the access we need to the Auth Connect functionality.

### Create `Auth0Service`

In our `/src/core/services` folder we will create a new file called `auth0.service.ts` where we will add all of our configuration for Auth0 SSO.

#### Imports

At the top of the file, we will add the various imports that we will need for this file.

```Typescript
import { Injectable } from '@angular/core';
import { IonicAuth, IonicAuthOptions } from '@ionic-enterprise/auth';
```

#### Construction

We will now setup our new `Auth0Service` class. It will be injected into the root scope of our application so we can use it anywhere we need to and it will extend the `IonicAuth` class to provide all the of the functionality we need out of the box. We will set up our configuration object in the constructor and pass it to the base class using the `super` call.

```Typescript
@Injectable({
    providedIn: 'root'
})
export class Auth0Service extends IonicAuth {
    constructor() {
        const host = 'com.ionic.actraining://';
        const targetPlatform = 'capacitor';
        const config: IonicAuthOptions = {
            authConfig: 'auth0',
            platform: targetPlatform,
            clientID: 'VQU81DmKm1WxhA6iehCrltCzErXo3YYo',
            discoveryUrl: `https://actraining.auth0.com/.well-known/openid-configuration`,
            redirectUri: `${host}login`,
            scope: 'openid offline_access email picture profile',
            logoutUrl: `${host}logout`,
            iosWebView: 'private'
        };
        super(config);
    }
}
```

#### Add Service to Barrel File

In our services folder, we have an `index.ts` that is used for making access to these services easier throughout our application. We want to add this new `Auth0Service` to that barrel. Simply open the file and export that service from there.

```Typescript
export { Auth0Service } from './auth0.service';
```