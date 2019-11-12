# Lab: Login Page

## Update the Logout Method

Since we have changed our login flow to use Auth0, we need to update our logout process to also involve Auth0.

### Logout Flow

#### Imports

As before with the login page, we need to import our `Auth0Service` into this file so we can use it.

```Typescript
import { ..., Auth0Service } from '@ac/core/services';
```

#### Constructor

```Typescript
export class HomePage {
    constructor(
        ...,
        private auth0Service: Auth0Service
    ) {}
}
```

#### Logout Method

The only change we will make here will be to remove the call to the Angular router and instead tell our `Auth0Service` to logout.

```Typescript
async logout(): Promise<void> {
    this.identityService.remove();
    this.auth0Service.logout();
}
```

At this point, we can build our application and test it on a device.