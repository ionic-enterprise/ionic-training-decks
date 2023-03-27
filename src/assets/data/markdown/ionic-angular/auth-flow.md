# Lab: Authentication Flow

In this lab you will learn how to:

- Setup a pipeline on an observable.
- Setup the authentication flow.

## Hook up the Login

For the login process, we need to perform the following tasks:

- Gather the credentials.
- Post the login request.
- If the login succeeds:
  - Store the session in the session vault.
  - Navigate to the main page of the application.
- If the login fails, display an indication for the user.

All of the following code belongs in the files in the `src/app/login` folder.

### Inject the Services

Three services are required in order to complete our login workflow:

- `AuthenticationService`
- `SessionVaultService`
- `NavController` (from `@ionic/angular`)

#### Test

We need to set up the test to inject mock services (remember that unit tests should execute the unit under test in isolation).

```typescript
import { AuthenticationService, SessionVaultService } from '@app/core';
import { createAuthenticationServiceMock, createSessionVaultServiceMock } from '@app/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { createNavControllerMock } from '@test/mocks';
...
    TestBed.configureTestingModule({
      imports: [LoginPage],
    })
      .overrideProvider(AuthenticationService, { useFactory: createAuthenticationServiceMock })
      .overrideProvider(SessionVaultService, { useFactory: createSessionVaultServiceMock })
      .overrideProvider(NavController, { useFactory: createNavControllerMock })
      .compileComponents();
```

#### Code

We then need to inject the services into the class for our page.

```typescript
import { AuthenticationService, SessionVaultService } from '@app/core';
import { NavController } from '@ionic/angular';
...
  constructor(
    private auth: AuthenticationService,
    private fb: FormBuilder,
    private nav: NavController,
    private sessionVault: SessionVaultService
  ) {}
```

### Call the Login

When the user clicks the sign in button, we need to post a login request and then build an `Observable` pipeline around that. The first step is just calling the `login()`. Let's get that set up.

#### Test

We have a function that performs input operations. We need a similar one that clicks buttons. Once we have that in place we click the button and verify that the `login()` call is made.

```typescript
  const click = (button: HTMLElement) => {
    const event = new Event('click');
    button.dispatchEvent(event);
    fixture.detectChanges();
  };
...
  describe('signin button', () => {
    ...
    describe('on click', () => {
      let auth: AuthenticationService;

      beforeEach(() => {
        auth = TestBed.inject(AuthenticationService);
      });

      it('calls the login', () => {
        setInputValue(email, 'test@test.com');
        setInputValue(password, 'ThisIsMyPa$$W0rd');
        click(button);
        expect(auth.login).toHaveBeenCalledTimes(1);
        expect(auth.login).toHaveBeenCalledWith('test@test.com', 'ThisIsMyPa$$W0rd');
      });
    });
  });
```

#### Code

For now, we can just call the method passing in the entered values.

```typescript
signIn() {
  const controls = this.loginForm.controls;
  this.auth
    .login(controls.email.value as string, controls.password.value as string);
}
```

### Save the Session

#### Test

If the `login()` succeeds, a session will be returned. In that case, we need to store it in the session vault. The "on success" group of tests should be nested within the "on click" group.

```typescript
describe('on success', () => {
  const session: Session = {
    user: {
      id: 314,
      firstName: 'Kevin',
      lastName: 'Minion',
      email: 'goodtobebad@gru.org',
    },
    token: '39948503',
  };

  beforeEach(() => {
    (auth.login as jasmine.Spy).and.returnValue(of(session));
  });

  it('stores the session', () => {
    const sessionVault = TestBed.inject(SessionVaultService);
    setInputValue(email, 'test@test.com');
    setInputValue(password, 'ThisIsMyPa$$W0rd');
    click(button);
    expect(sessionVault.set).toHaveBeenCalledTimes(1);
    expect(sessionVault.set).toHaveBeenCalledWith(session);
  });
});
```

#### Code

Within the code, we create an Observable pipeline and tap into it to grab the session and save it. The `take(1)` call ensures that the subscription will be completed. This is not strictly needed, but is here for completeness.

```typescript
  signIn() {
    const controls = this.loginForm.controls;
    this.auth
      .login(controls.email.value as string, controls.password.value as string)
      .pipe(
        take(1),
        tap(async (session) => {
          if (session) {
            await this.sessionVault.set(session);
          }
        })
      )
      .subscribe();
  }
```

**Note:** the `subscribe()` is _very_ important. If you do not subscribe, then all you are doing is setting up an Observable pipeline, but not executing it.

### Navigate

#### Test

After the session is saved, we need to navigate to the root path. Note that the session vault `set()` method is asynchronous. As such, we need to wait for it to complete before we navigate. To force this, we run the test in the "fake async" zone and then call `tick()` to move to the next cycle in the task queue.

Add this test within the "on success" group of tests.

```typescript
it('navigates to the main page', fakeAsync(() => {
  const nav = TestBed.inject(NavController);
  setInputValue(email, 'test@test.com');
  setInputValue(password, 'ThisIsMyPa$$W0rd');
  click(button);
  tick();
  expect(nav.navigateRoot).toHaveBeenCalledTimes(1);
  expect(nav.navigateRoot).toHaveBeenCalledWith(['/']);
}));
```

#### Code

In the code, we just need to add the navigation right after we set the session within the pipeline.

```typescript
  signIn() {
    const controls = this.loginForm.controls;
    this.auth
      .login(controls.email.value as string, controls.password.value as string)
      .pipe(
        take(1),
        tap(async (session) => {
          if (session) {
            await this.sessionVault.set(session);
            this.nav.navigateRoot(['/']);
          }
        })
      )
      .subscribe();
  }
```

### Try it Out

Test this out in the application by manually loading `http://localhost:8100/login` (remember that your port number may differ). Ooops!! It looks like something is wrong. Nothing is showing up.

Open the devtools and have a look at the console. You should see an error something like this:

```
Uncaught (in promise): NullInjectorError: R3InjectorError(LoginPageModule)[AuthenticationService -> AuthenticationService -> HttpClient -> HttpClient -> HttpClient]:
  NullInjectorError: No provider for HttpClient!
NullInjectorError: R3InjectorError(LoginPageModule)[AuthenticationService -> AuthenticationService -> HttpClient -> HttpClient -> HttpClient]:
  NullInjectorError: No provider for HttpClient!
    at NullInjector.get (:8100/vendor.js:76705:27)
    at R3Injector.get (:8100/vendor.js:76872:33)
    at R3Injector.get (:8100/vendor.js:76872:33)
    at R3Injector.get (:8100/vendor.js:76872:33)
    at injectInjectorOnly (:8100/vendor.js:70360:33)
    at ɵɵinject (:8100/vendor.js:70364:61)
    at Object.AuthenticationService_Factory [as factory] (ng:///AuthenticationService/ɵfac.js:4:49)
    at R3Injector.hydrate (:8100/vendor.js:77042:35)
    at R3Injector.get (:8100/vendor.js:76861:33)
    at injectInjectorOnly (:8100/vendor.js:70360:33)
```

This is because we are using the Angular HTTP Client, but we never registered it with Angular's injector. Open `src/main.ts` and add an import for `HttpClientModule` to the `importProvidersFrom()` call that is part of the application bootstrapping.

```typescript
import { HttpClientModule } from '@angular/common/http';
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouteReuseStrategy } from '@angular/router';
import { AppComponent } from '@app/app.component';
import { routes } from '@app/app.routes';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    importProvidersFrom(HttpClientModule, IonicModule.forRoot({})),
    provideRouter(routes),
  ],
});
```

Test this out in the application again. Note from the "network" tab in the devtools that you are now using actual calls to the backend for the login and the logout.

To successfully log in, use the following credentials:

- email: `test@ionic.io`
- password: `Ion54321`

### Login Failures

The user can enter the wrong email or password. If they do so, we will not store a session and we will not navigate. Try that out from the login page just to be sure. The fact that we stay on the login page is good, but there is no indication provided to the user.

We will use a <a href="https://ionicframework.com/docs/api/toast" target="_blank">toast</a> to inform the user when they enter invalid credentials. First add the following markup somewhere within the page. It does not really matter where. I placed it after the footer.

```html
<ion-toast
  [isOpen]="loginFailed"
  message="Invalid Email or Password!"
  color="danger"
  [duration]="3000"
  (didDismiss)="loginFailed = false"
></ion-toast>
```

Note that we are using `loginFailed` to open the toast. The toast will open when `loginFailed` is set to `true`. The toast stays up for three seconds and then closes. When it closes, `didDismiss` is fired and we set `loginFailed` to `false`.

In the class, we need to define the property, initialize it to `false`, and set it to `true` if the login fails.

```typescript
  loginFailed = false;

  ...

  signIn() {
    const controls = this.loginForm.controls;
    this.auth
      .login(controls.email.value as string, controls.password.value as string)
      .pipe(
        take(1),
        tap(async (session) => {
          if (session) {
            await this.sessionVault.set(session);
            this.nav.navigateRoot(['/']);
          } else {
            this.loginFailed = true;
          }
        })
      )
      .subscribe();
  }
```

## Hook up the Logout

For now, we will add a logout button to the `TeaPage`. The button will log out the user and navigate to the login page so they can log in again. We will need to make changes to the following files:

- `src/app/tea/tea.page.spec.ts`
- `src/app/tea/tea.page.ts`
- `src/app/tea/tea.page.html`

### Inject the Services

#### Test

```typescript
import { AuthenticationService, SessionVaultService } from '@app/core';
import { createAuthenticationServiceMock, createSessionVaultServiceMock } from '@app/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { createNavControllerMock } from '@test/mocks';
...
    TestBed.configureTestingModule({
      imports: [TeaPage],
    })
      .overrideProvider(AuthenticationService, { useFactory: createAuthenticationServiceMock })
      .overrideProvider(NavController, { useFactory: createNavControllerMock })
      .overrideProvider(SessionVaultService, { useFactory: createSessionVaultServiceMock })
      .compileComponents();
```

#### Code

```typescript
import { AuthenticationService, SessionVaultService } from '@app/core';
import { NavController } from '@ionic/angular';
...
  constructor(
    private auth: AuthenticationService,
    private nav: NavController,
    private sessionVault: SessionVaultService
  ) {}
```

### Add a Button in the Header

In the header section after the `ion-title`

```html
<ion-buttons slot="end">
  <ion-button (click)="logout()" data-testid="logout-button">
    <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
  </ion-button>
</ion-buttons>
```

```typescript
  logout() {
    null;
  }
```

### Call the Logout

#### Test

Copy the `click()` function from `src/app/login/login.page.spec.ts`. With that in place, add a section for the _logout button_ and nest one inside of that for _on click_. Our first test calls the logout.

```typescript
  const click = (button: HTMLElement) => {
    const event = new Event('click');
    button.dispatchEvent(event);
    fixture.detectChanges();
  };
...
  describe('logout button', () => {
    describe('on click', () => {
      beforeEach(() => {
        const auth = TestBed.inject(AuthenticationService);
        (auth.logout as jasmine.Spy).and.returnValue(of(undefined));
      });

      it('calls the logout', () => {
        const auth = TestBed.inject(AuthenticationService);
        const button = fixture.debugElement.query(By.css('[data-testid="logout-button"]')).nativeElement;
        click(button);
        expect(auth.logout).toHaveBeenCalledTimes(1);
      });
    });
  });
```

#### Code

The code is left as a challenge to the reader, but will be _very_ similar to what we did for the login at this stage.

### Clear the Vault

#### Test

Add the following test within the _on click_ section.

```typescript
it('clears the session', () => {
  const button = fixture.debugElement.query(By.css('[data-testid="logout-button"]')).nativeElement;
  const sessionVault = TestBed.inject(SessionVaultService);
  click(button);
  expect(sessionVault.clear).toHaveBeenCalledTimes(1);
});
```

#### Code

The code is left as a challenge to the reader, but will be _very_ similar to what we did for the login at this stage.

### Navigate to Login

Add the following test within the _on click_ section.

#### Test

```typescript
it('navigates to the login page', fakeAsync(() => {
  const button = fixture.debugElement.query(By.css('[data-testid="logout-button"]')).nativeElement;
  const nav = TestBed.inject(NavController);
  click(button);
  tick();
  expect(nav.navigateRoot).toHaveBeenCalledTimes(1);
  expect(nav.navigateRoot).toHaveBeenCalledWith(['/', 'login']);
}));
```

#### Code

Your final code should look something like this:

```typescript
logout() {
  return this.auth
    .logout()
    .pipe(
      take(1),
      tap(async () => {
        await this.sessionVault.clear();
        this.nav.navigateRoot(['/', 'login']);
      })
    )
    .subscribe();
}
```

## Conclusion

We can now log in and out, but we still have a few issues: we can get to the tea page even if we are not logged in, we are not placing the token on outbound requests, and if a token becomes invalid we will just fail silently.

We will fix those problems next by implementing guards and interceptors.
