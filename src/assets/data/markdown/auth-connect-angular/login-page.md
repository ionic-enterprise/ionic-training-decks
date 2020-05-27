# Lab: Login Page

## Add Auth0 Login functions

### Modify the HTML

For this lab, we will be replacing the email/password flow with our new Auth0 login. Comment out or remove the form from the `login.page.html` and replace it with a new button that we will use to call our new `Auth0Service` methods.

```HTML
<ion-button (click)="tryAuth0()">Login with Auto0</ion-button>
```

This button will call a new method `tryAuth0()` that we will create in the typescript file.

### `tryAuth0()` Method

In our `login.page.ts` file, we will create a new method that will call the `login` method from our new `Auth0Service` that we created. Firstly, we will need to import the service into our file.

#### Imports

We will import our new service from the `@ac/core/services` import. We will also import the `IdentityService` into our page, but we wont use it until a little later.

```Typescript
import { ..., Auth0Service, IdentityService } from '@ac/core/services';
```

> This special import is using a combination of Typescript Barrel files and a Typescript Path configuration. For more information, see [Barrels](https://basarat.gitbooks.io/typescript/docs/tips/barrel.html) and [TsConfig Paths](https://decembersoft.com/posts/say-goodbye-to-relative-paths-in-typescript-imports/).

#### Constructor

We will inject our service into our page using the constructor.

```Typescript
export class LoginPage {
    ...
    constructor(
        ...,
        private auth0Service: Auth0Service,
        private identityService: IdentityService
    ) {}
}
```

#### New Method

Finally, we will create our new method. The Auth Connect API is promised based so we will make our function use `async/await` to help keep our code clean.

```Typescript
async tryAuth0(): Promise<void> {
    await this.auth0Service.login();
}
```

### Handle Successful Login

If we were to run our application at this point, we would be able to trigger the authentication flow, but we have no way to handle a succesful response. You'll recall that when we were configuring our Auth0 project, we set up an Authorized Callback URL for our application. When the user successfully logs in, Auth0 will redirect them to that page with a token that we will be able to use to finalize the login process with our application. We set up that page in Auth0 to be this same login page that we are currently working on, so we now need to modify the page a bit more to handle that callback from Auth0. We will do that in the `ngOnInit()` method that fires when the page first loads.

```Typescript
async ngOnInit(): Promise<void> {
    ...
    if (window.location.hash) {
        const res = await this.auth0Service.handleCallback(
            window.location.href
        );
        const token = await this.auth0Service.getIdToken();
        this.identityService.set(
            {
                username: token.nickname
            },
            await this.auth0Service.getAccessToken()
        );
        this.router.navigateByUrl('/home');
    }
}
```

In this method, we first check to see if there is a hash value in our URL. That hash contains our token that we will send to Auth0 to complete the authentication exchange. If that hash exists, then we will pass the entire URL to the `handleCallback` method on our `auth0Service`. This method will extract the token and communicate with Auth0 and finalize the login process. At this point, we are now successfully logged in. 

We can get details of the user by calling `getIdToken()` on the `auth0Service`. This method returns information from Auth0 about the currently logged in user. For our application, we will only store the nickname from the token as the username. The `auth0Service` also has a method for getting an access token. This access token is what you would use to authenticate the user if they were to make any API calls to another server. We will save both of these items into our `identityService` so our application can know who the current user is.

Finally, we navigate into the application.