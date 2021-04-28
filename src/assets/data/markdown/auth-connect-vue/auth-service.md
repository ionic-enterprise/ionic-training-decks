# The Authentication Workflow

We now have our OIDC provider properly configured. We also have Ionic Auth Connect installed in our application with a configuration to match that of our OIDC provider. It is time to implement the overall authentication flow in our application. To do this, we will need to perform the following tasks:

- create an Authentication Service that extends Ionic Auth Connect
- modify the login page to perform the login
- modify the tab1 page to get authentication information from Auth Connect and to perform the logout
- update the auth interceptor to append the access token to the Authentication header as a bearer token
- update the route guard to determine if the user is authenticated or not and respond accordingly

Let's get started.

## Authentication Service

The first step will be to create a service class that extends the Ionic Auth Connect base class (`IonicAuth`). The `IonicAuth` base class <a href="https://ionic.io/docs/auth-connect/api/#iionicauth" target="_blank">provides several methods</a> with useful base implementations. We will use the following methods as-is in various parts of our application:

- `login()`
- `logout()`
- `isAuthenticated()`
- `getIdToken()`
- `getAccessToken()`
- `refresh()`

We _do_ need to do some work in our extended class, however:

- we need to pass the correct configuration based on the current execution context of the application
- we will add a `getUserInfo()` method to extract important user information from the ID token

Here is the code for our service (create a new file: `src/services/AuthenticationService.ts`).

```TypeScript
import { User } from '@/models';
import { IonicAuth } from '@ionic-enterprise/auth';
import { getAuthConfig } from './AuthConnectConfig';

export class AuthenticationService extends IonicAuth {
  constructor() {
    const config = getAuthConfig();
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

export const authenticationService = new AuthenticationService();
```

## Login Page

The login page currently contains boiler-plate for a standard email/password based authentication challenge. We will not be using this. Rather, we will use Ionic Auth Connect to access our OIDC provider, which will present the appropriate authentication challenge to the user.

In order to replace this with something more appropriate for use with Ionic Auth Connect, we will make the following modifications.

In the markup:

- remove the `ion-list` and its contents
- remove the `v-if="email && password"` from the "Sign In" outer `div`
- add an `error-message` div as shown below
- move the "Skip Login" `div` to the bottom of the content

When completed, the `ion-content` for the page should look like this:

```HTML
    <ion-content>
      <div class="login-control ion-text-center" @click="signInClicked" data-testid="signin-button">
        <ion-icon :icon="logInOutline"></ion-icon>
        <div>Sign In</div>
      </div>

      <div class="error-message">
        <div>{{ errorMessage }}</div>
      </div>

      <div class="ion-text-center">
        <a href="tabs/tab1">Skip Login</a>
      </div>
    </ion-content>
```

In the code:

- add an `errorMessage` property
- remove the now unused `email` and `password` properties
- import the `authenticationService` service (`import { authenticationService } from '@/services/AuthenticationService';`)
- modify the `signInClicked()` function to do the login
- clean up the imports and the components list since there are a few that are no longer in the template

Here is what the page's `setup()` function should look like:

```TypeScript
  setup() {
    const errorMessage = ref('');
    const router = useRouter();

    async function signInClicked() {
      try {
        await authenticationService.login();
        router.replace('/');
      } catch (err) {
        errorMessage.value = 'Login failed, please try again';
      }
    }

    return { errorMessage, logInOutline, signInClicked };
  }
```

At this point, we can log in, but there are a couple of problems:

1. the tab1 page still shows us as logged out
1. going to tab2 still causes a 401 error which kicks us back to the login page

## The Information Page (tab1)

The first thing we need to do is import our authenticvation service. We will also need to import the `onIonViewWillEnter` composition hook from `@ionic/vue`.

```TypeScript
import { authenticationService } from '@/services/AuthenticationService';
import { ..., onIonViewWillEnter } from '@ionic/vue';
```

Upon entry to the screen we need to get the information for the currently logged in user. Add the following code within the `setup()` method.

```TypeScript
  onIonViewWillEnter(async () => currentUser.value = await authenticationService.getUserInfo());
```

This will be displayed already by the view due to how the template is currently set up.

Pressing the logout button will currently take us to the login page, but it does not really perform a logout. We can see this by doing a "sign in" again from the login page. Note that we were not asked for credentials from Azure. Fixing that is a matter of calling Ionic Auth Connect's `logout()` method before navigating to the login page. Note the `await`. We only want to navigate after a successful logout.

Update the definition of the `logout` function in the page's `setup()`:

```TypeScript
    const logout = async () => {
      await authenticationService.logout();
      router.replace('/login');
    };
```

**Note:** in a production application we probably would also want to wrap that in a `try ... catch` block so we can do something reasonable in the unlikely event that the `logout()` fails.

## Fixing the Teas Route

We still cannot go to the tea list on the `tab2` page. The reason is that while we are certainly authenticated, we are not letting our REST API know.

### The Request Interceptor

We are getting 401 errors since we are still not including the access token on the outgoing requests. We fix that by updating the request interceptor. The interceptor currently just sets the token to a blank string. We will change it to get the access token from Ionic Auth Connect.

Here is the full code in `src/services/api.ts`. Note that we needed to mark the interceptor as `async`. We also wrapped the `getAccessToken()` call in a `try ... catch` block because it will throw an error if we are not logged in or if there is an error refreshing an expired access token.

```TypeScript
client.interceptors.request.use(async (config: AxiosRequestConfig) => {
  try {
    const token = await authenticationService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    null;
  }
  return config;
});
```

Now that we are sending the access token to the backend, we should see a list of teas rather than getting 401 errors that redirect us to the login page.

### Guard the Route

If we log out and then try to go to `tab2` we still get a 401 error in the console. Idealy we would not see those at all.

Let's update the guard to make sure we are authenticated before we ever get to the route. To do this, open `src/router/index.ts` and find the definition for `checkAuthStatus`. Notice that it is currently just setting `authenticated` to true. Change that line to check with our authenticationService instead.

```TypeScript
    const authenticated = await authenticationService.isAuthenticated();
```

## Conclusion

At this point, Ionic Auth Connect is fully configured and our authentication flow is working properly.

However, we are using the default storage for the tokens, which means that we are using `localstorage` in all cases. This default behavior is only inteded to ease development and is not meant or production cases.

The reason this is not a good option for production is that on mobile devices the OS can and will wipe that data out whenever it feels like it needs the memory. Ionic Auth Connect offers a couple of better options, however:

- create your own service that implements the <a href="https://ionic.io/docs/auth-connect/api#tokenstorageprovider" target="_blank">token storage provider</a> interface
- use <a href="https://ionic.io/docs/identity-vault">Ioinc Identity Vault</a>

We suggest the latter. It is your easiest and most secure option. We will look at integrating it in the next section.
