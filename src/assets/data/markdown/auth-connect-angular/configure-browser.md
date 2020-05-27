# Lab: Login Page

## Configure Browser Support

As we have our Application currently configured, it only works when running on a real device. While this may work if we are only targeting devices, if we want to work on our application in a browser or build a PWA version of our application, we need to make one small tweak.

### Auth0Service - Browser Support

In our `Auth0Service` we initially setup variables for our two values in our auth0 config variable. We did that so that we can change them out as needed so we can support other targets.

#### Imports

Firstly, we need to import the Platform service so we can detect what platform we are currently running on.

```Typescript
import { Platform } from '@ionic/angular';
```

#### Constructor

In our constructor, we will inject the platform service and use it to change the values of our `host` and `targetPlatform` variables based on our running platform.

```Typescript
export class Auth0Service extends IonicAuth {
    constructor(platform: Platform) {
        const host = platform.is('capacitor') ? 'com.ionic.actraining://' : 'http://localhost:8100/';
        const targetPlatform = platform.is('capacitor') ? 'capacitor' : 'web';
    }
}
```

### Update Auth0 Config

Back in our Auth0 Project, we also need to add our web address to:

* `Authorized Callback URLs` - `http://localhost:8100/login`
* `Allowed Web Origins` - `http://localhost:8100`
* `Allowed Logout URLs` - `http://localhost:8100/logout`

We can now run our application using `ionic serve` and in the browser we will be able to successfully login with Auth0.