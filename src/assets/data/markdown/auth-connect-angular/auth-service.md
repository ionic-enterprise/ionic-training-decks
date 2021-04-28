# The Authentication Workflow

We now have our OIDC provider properly configured. We also have Ionic Auth Connect installed in our application with a configuration to match that of our OIDC provider. It is time to implement the overall authentication flow in our application. To do this, we will need to perform the following tasks:

- create an Authentication Service that extends Ionic Auth Connect
- modify the login page to perform the login
- modify the tab1 page to get authentication information from Auth Connect and to perform the logout
- update the auth interceptor to append the access token to the Authentication header as a bearer token
- update the route guard to determine if the user is authenticated or not and respond accordingly

Let's get started.

## Authentication Service

The first step will be to create a service class that extends the Ionic Auth Connect base class (`IonicAuth`).

```bash
ionic g s core/authentication --skipTests
```

The `IonicAuth` base class <a href="https://ionic.io/docs/auth-connect/api/#iionicauth" target="_blank">provides several methods</a> with useful base implementations. We will use the following methods as-is in various parts of our application:

- `login()`
- `logout()`
- `isAuthenticated()`
- `getIdToken()`
- `getAccessToken()`
- `refresh()`

We _do_ need to do some work in our extended class, however:

- we need to pass the correct configuration based on the current execution context of the application
- we will add a `getUserInfo()` method to extract important user information from the ID token

Here is the code for our service.

```TypeScript
import { Injectable } from '@angular/core';
import { IonicAuth } from '@ionic-enterprise/auth';
import { Platform } from '@ionic/angular';
import { mobileAzureConfig, webAzureConfig } from 'src/environments/environment';
import { User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService extends IonicAuth {
  constructor(platform: Platform) {
    const config = platform.is('hybrid') ? mobileAzureConfig : webAzureConfig;
    super(config);
  }

  async getUserInfo(): Promise<User | undefined> {
    const idToken = await this.getIdToken();
    if (!idToken) {
      return;
    }

    let email = idToken.email;
    if (idToken.emails instanceof Array) {
      email = idToken.emails[0];
    }

    return {
      id: idToken.sub,
      email,
      firstName: idToken.given_name,
      lastName: idToken.family_name
    };
  }
}
```

## Login Page

The login page currently contains boiler-plate for a standard email/password based authentication challenge. We will not be using this. Rather, we will use Ionic Auth Connect to access our OIDC provider, which will present the appropriate authentication challenge to the user.

In order to replace this with something more appropriate for use with Ionic Auth Connect, we will make the following modifications.

In the markup:

- remove the form
- remove the `*ngIf="loginForm.form.valid"` from the signin `div`
- replace the contents of the `error-message` div with `{{ errorMessage}}`
- move the "Skip Login" to the bottom

When completed, the `ion-content` for the page should look like this:

```HTML
<ion-content>
  <div
    class="login-control ion-text-center"
    (click)="signIn()"
    data-testid="signin-button"
  >
    <ion-icon name="log-in-outline"></ion-icon>
    <div>Sign In</div>
  </div>

  <div class="error-message">
    <div>{{ errorMessage }}</div>
  </div>

  <div class="ion-text-center"><a href="tabs/tab1">Skip Login</a></div>
</ion-content>
```

In the code:

- add an `errorMessage` property
- inject the auth service
- modify the `signIn()` to do the login

Here is what the `signIn()` method should look like:

```TypeScript
  async signIn() {
    try {
      this.errorMessage = '';
      await this.auth.login();
      this.navController.navigateRoot('/');
    } catch (err) {
      this.errorMessage = 'Login failed, please try again';
    }
  }
```

At this point, we can log in, but there are a couple of problems:

1. the tab1 page still shows us as logged out
1. going to tab2 still causes a 401 error which kicks us back to the login page

## The Information Page (tab1)

The first thing we need to do is inject the auth service:

```TypeScript
  constructor(
    private auth: AuthenticationService,
    private navController: NavController,
  ) {}
```

Upon entry to the screen we need to get the information for the currently logged in user:

```TypeScript
  async ionViewWillEnter() {
    this.currentUser = await this.auth.getUserInfo();
  }
```

This will be displayed already by the view due to how the template is currently set up.

Pressing the logout button will currently take us to the login page, but it does not really perform a logout. We can see this by doing a "sign in" again from the login page. Note that we were not asked for credentials from Azure. Fixing that is a matter of calling Ionic Auth Connect's `logout()` method before navigating to the login page. Note the `await`. We only want to navigate after a successful logout.

```TypeScript
  async logout() {
    await this.auth.logout();
    this.navController.navigateRoot(['/', 'login']);
  }
```

**Note:** in a production application we probably would also want to wrap that in a `try ... catch` block so we can do something reasonable in the unlikely event that the `logout()` fails.

## Fixing the Teas Route

We still cannot go to the tea list on the `tab2` page. The reason is that while we are certainly authenticated, we are not letting our REST API know.

### The Auth Interceptor

We are getting 401 errors since while we now have an access token we are not actually including it on the outgoing request. We fix that by updating the auth interceptor (`src/app/core/auth-interceptor.service.ts`). The interceptor has a `getToken()` method that currently returns `undefined`. We will change it to get the access token from Ionic Auth Connect.

```TypeScript
  private async getToken(): Promise<string | undefined> {
    return this.auth.getAccessToken();
  }
```

**Note:** you will need to inject the `AuthenticationService` just like we have in other places.

Now that we are sending the access token to the backend, we should see a list of teas rather than getting 401 errors that redirect us to the login page.

### Guard the Route

If we log out and then try to go to `tab2` we get a weird error in the console about not being able to refresh the authentication tokens, and we do not get any teas. Worse, we are not redirected to the login page. That is because the exception we are getting is preventing the request from going out so we never get the 401 error.

Let's update the auth-guard to make sure we are authenticated before we ever get to the route.

**src/app/core/auth-guard.service.ts**

- inject the nav controller
- inject the auth service
- update the canActivate logic as shown below

```TypeScript
  async canActivate(): Promise<boolean> {
    if (await this.auth.isAuthenticated()) {
      return true;
    }

    this.navController.navigateRoot(['/', 'login']);
    return false;
  }
```

## Conclusion

At this point, Ionic Auth Connect is fully configured and our authentication flow is working properly. However, we are using the default storage for the tokens, which means that we are using `localstorage` in all cases. This default behavior is only inteded to ease development and is not meant or production cases.

The reason this is not a good option for production is that on mobile devices the OS can and will wipe that data out whenever it feels like it needs the memory. Ionic Auth Connect offers a couple of better options, however:

- create your own service that implements the <a href="https://ionic.io/docs/auth-connect/api#tokenstorageprovider" target="_blank">token storage provider</a> interface
- use <a href="https://ionic.io/docs/identity-vault">Ioinc Identity Vault</a>

We suggest the latter. It is your easiest and most secure option. We will look at integrating that in the next section.
