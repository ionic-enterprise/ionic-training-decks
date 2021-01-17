# Lab: The Base Application

This training starts with an Ionic Framework application that uses the Capacitor Storage API to store the current authentication token. This is a common paradigm used in web applications. For hybrid mobile applications, however, we can go a step further and store the token in a secure storage area. We can also lock the token behind biometric or PIN based security.

## Getting Started

These instrctions assume that you have a reasonable development environment set up on your machine including `git`, `node`, `npm`, and `Android Studio`. If your are using a Mac and want to build for iOS, you should also have `Xcode`, the Xcode commandline tools, and `cocoapods`.

To get started, perform the following actions within a working folder:

- `git clone https://github.com/ionic-team/tea-taster-vue.git`
- `cd tea-taster-vue`
- `npm i`
- `npm run build`
- `npx cap sync` - this may take a while
- `npm start` - to run in the browser

To build for installation on a device, use `npx cap open android` or `npx cap open ios`. This will open the project in the appropriate IDE. From there you can build the native application and install it on your device.

**Note:** If you recently participated in the Ionic Framework training, this repo is the end result of that training, so you can use your existing codebase if you wish. You can start with a clean slate following the instructions above.

## General Architecture

### The Store

This application uses a Vuex store to keep track of the application state. Part of that state includes the current session. Have a look at the root module of the state, defined in `src/store/state.ts` and examine how the session is represented in the state.

### Services

Two services are related to the authentication workflow. The `SessionVaultService` handles storing the session information in persistent storage. The `AuthenticationService` handles the API calls that perform login and logout actions.

### HTTP Interceptors

Two HTTP interceptors are used by the authentication workflow. One adds the authentication token to outgoing requests if they require a token. The other redirects the application to the login page when requests fail with a 401 error. Have a look in `src/services/api.ts` for details.

### Auth Guard

This application uses an Route Guard to ensure that the user is logged in before accessing any routes other than the login page route. See the `checkAuthStatus()` function in `src/router/index.ts` for details.

### Application Workflow

When the application first starts, the session is undefined in the store. The first time that a route is hit that requires authentication, the `checkAuthStatus()` will note that the session does not exist and attempt to restore the session. If the session is restored, then the application can continue to the guarded route. If not, then the application is redirected to the login page.

This allows the application to delay attempting to restore the session until a session is actually required (which is actually for all pages except the login page for this application, but that is not always the case in every app).
