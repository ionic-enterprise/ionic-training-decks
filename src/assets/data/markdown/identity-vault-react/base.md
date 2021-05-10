# Lab: The Base Application

This training starts with an Ionic Framework application that uses the Capacitor Storage API to store the current authentication token. This is a common paradigm used in web applications. For hybrid mobile applications, however, we can go a step further and store the token in a secure storage area. We can also lock the token behind biometric or PIN based security.

## Getting Started

These instructions assume that you have a reasonable development environment set up on your machine including `git`, `node`, `npm`, and `Android Studio`. If your are using a Mac and want to build for iOS, you should also have `Xcode`, the Xcode command line tools, and `cocoapods`.

To get started, perform the following actions within a working folder:

- `git clone https://github.com/ionic-team/tea-taster-react.git`
- `cd tea-taster-react`
- `npm i`
- `npm run build`
- `npx cap sync` - this may take a while
- `npm start` - to run in the browser

To build for installation on a device, use `npx cap open android` or `npx cap open ios`. This will open the project in the appropriate IDE. From there you can build the native application and install it on your device.

**Note:** If you recently participated in the Ionic Framework training, this repo is the end result of that training, so you can use your existing codebase if you wish. You can start with a clean slate following the instructions above.

## General Architecture

### Authentication Context

This application uses React's Context API to keep track of authentication state. Part of that state includes the current session. Have a look at the authentication state, defined in `src/core/auth/AuthContext.tsx` and examine how the session is represented in the state.

Component interaction with the context is placed within a custom React hook, defined in `src/core/auth/useAuthentication.tsx`. This hook is provided as an abstraction between components and the authentication context.

### HTTP Interceptors

An HTTP interceptor is used by the authentication workflow. The `useAuthInterceptor` hook adds the authentication token to outgoing requests if they require a token, and redirects the application to the login page when requests fail with a 401 error. This hook is defined in `src/core/auth/useAuthInterceptor.tsx`.

### Private Routing

This application supplies a `<PrivateRoute />` component that will redirect the user to the login page should they attempt to access any routes that require the user to be authenticated to access. See `src/core/auth/PrivateRoute.tsx` for details.

### Application Workflow

#### Startup

When the application first starts, the session is undefined in the store. The authentication context will attempt to restore the session. If the session is restored, then the application continues to the guarded route. If not, then the application is redirected to the login page.

While the application is determining if a session exists and can be restored, a "loading" component is displayed. Once the determination has been made, the "loading" component is removed and the core application component is rendered. Provided that the core application component dismisses the application's splash screen, the "loading" component is only observed on the web platform and does not display on mobile platforms.

#### Execution

If at any point the user is logged out, either through their own logging out, or via a 401 error, the `LOGOUT_SUCCESS` action is dispatched, and the user is redirected to the login page where they can reestablish a session.
