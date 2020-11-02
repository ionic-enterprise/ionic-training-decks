# Lab: The Base Application

This training starts with an Ionic Framework application that uses the Capacitor Storage API to store the current authentication token. This is a common paradigm used in web applications. For hybrid mobile applications, however, we can go a step further and store the token in a secure storage area. We can also lock the token behind biometric or PIN based security.

## Getting Started

These instrctions assume that you have a reasonable development environment set up on your machine including `git`, `node`, `npm`, and `Android Studio`. If your are using a Mac and want to build for iOS, you should also have `Xcode`, the Xcode commandline tools, and `cocoapods`.

To get started, perform the following actions within a working folder:

- `git clone https://github.com/ionic-team/tea-taster-angular.git`
- `cd tea-taster-angular`
- `npm i`
- `npm run build`
- `npx cap sync` - this may take a while
- `npm start` - to run in the browser

To build for installation on a device, use `npx cap open android` or `npx cap open ios`. This will open the project in the appropriate IDE. From there you can build the native application and install it on your device.

**Note:** If you recently participated in the Ionic Framework training, this repo is the end result of that training, so you can use your existing codebase if you wish. You can start with a clean slate following the instructions above.

## General Architecture

### Services

Two services are related to the authentication workflow. The `IdentiyService` handles the identity of the currently logged in user. The `AuthenticationService` handles the API calls that perform login and logout actions.

#### IdentityService

The `IdentityService` defines the identity of the currently logged in user including the authentication token associated with the user. This service also persists the token so it is available between sessions. This is the key service in this training, so let's have a look at it feature by feature.

##### Construction

This service is registered with the dependency injection engine such that it is availale to the whole application. All of the data controlled by this service is private. Consumers must interact with the data via the getters. A `changed` subject is created so other parts of the application can know when the user has changed, allowing then to requery data as needed.

```TypeScript
@Injectable({
  providedIn: 'root',
})
export class IdentityService {
  private key = 'auth-token';
  /* tslint:disable:variable-name */
  private _changed: Subject<User>;
  private _token: string;
  private _user: User;
  /* tslint:enable:variable-name */

  get changed(): Observable<User> {
    return this._changed.asObservable();
  }

  get token(): string {
    return this._token;
  }

  get user(): User {
    return this._user;
  }

  constructor(private http: HttpClient) {
    this._changed = new Subject();
  }
  ...
```

##### `init()` - Get the Current User

Our API has a `users/current` endpoint that returns the `User` that is assciated with whichever authentication token is sent in the request. The `init()` method determines if the application has a stored token, and if so it gets the user information associated with that token.

```TypeScript
  async init(): Promise<void> {
    const { Storage } = Plugins;
    const res = await Storage.get({ key: this.key });
    this._token = res && res.value;
    if (this._token) {
      this.http
        .get<User>(`${environment.dataService}/users/current`)
        .pipe(take(1))
        .subscribe(u => (this._user = u));
    }
  }
```

This allows our application to retrieve information about the currently logged in user after a restart. This method is called as part of the application bootstrap workflow.

##### `set()` - Set the Current User and Token

The `set()` method takes a `User` object and a token. The `User` object is cached locally and the token is stored via the Capacitor Storage API. The `changed` subject is also fired. This method is called as part of the login workflow.

```TypeScript
  async set(user: User, token: string): Promise<void> {
    this._user = user;
    this._token = token;
    const { Storage } = Plugins;
    await Storage.set({ key: this.key, value: token });
    this._changed.next(user);
  }
```

##### `clear()` - Remove the User and the Token

The user and the token are removed from memory and from Capacitor Storage.

```TypeScript
  async clear(): Promise<void> {
    this._user = undefined;
    this._token = undefined;
    const { Storage } = Plugins;
    await Storage.remove({ key: this.key });
    this._changed.next();
  }
```

This method is called as part of the logout workflow.

#### AuthenticationService

The `AuthenticationService` handles the POSTs to the login and logout endpoints. If these operations are successful it registers this fact with the `IdentityService`. Have a look at `src/services/authentication/authentication.service.ts` for details.

### HTTP Interceptors

Two HTTP interceptors are used by the authentication workflow. The `AuthInterceptor` adds the authentication token to outgoing requests if they require a token. The `UnauthInterceptor` redirects the application to the login page when requests fail with a 401 error.

### Auth Guard

This application uses an Route Guard to ensure that the user is logged in before accessing any routes other than the login page route. See `src/app/core/auth-guard/auth-guard.service.ts` for details.

### Application Workflow

#### Startup

The `IdentityService` initialization has been added to the `APP_INITIALIZER`, ensuring that if a token exists it will be obtained before attempting to load any route. The application attempts to load the `TeaPage`. If there was no token stored from a previous login, then the Auth Guard will redirect the application to the `LoginPage` instead.

#### Execution

The `AppComponent` subscribes to the `IdentityService` `changed` Observable. If the identity changes, the application will automatically redirect to either the `LoginPage` or the `TeaPage` depeding on the value emitted by the Observable.
