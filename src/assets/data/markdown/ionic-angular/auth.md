
# Lab: Handle Authentication
 
In this lab you will learn how to:

Notes for slides:

- may want to split this in two:
- Identity: Capacitor Storage API, Subjects, Auth Guards
- Authentication: HTTP and HTTP Testing

We will then need to move Capacitor up in the chain

## Create the User Model

```TypeScript
export class User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}
```

Be sure to update `src/app/models/index.ts`

## Set up the Environment

```TypeScript
dataService: 'https://cs-demo-api.herokuapp.com'
```

## Install @ionic/storage

install
set up... (refer to web page)

## Create the Identity Service

```bash
$ ionic generate service services/identity/identity
```

Create `src/app/services/index.ts`

```typescript
export * from './identity/identity.service';
```

### Interface Setup

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Subject, Observable } from 'rxjs';

import { User } from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class IdentityService {
  private key = 'auth-token';
  private _changed: Subject<User>;
  private _token: string;
  private _user: User;

  get changed(): Observable<User> {
    return this._changed.asObservable();
  }

  get token(): string {
    return this._token;
  }

  get user(): User {
    return this._user;
  }

  constructor(private storage: Storage, private http: HttpClient) {
    this._changed = new Subject();
  }

  async init(): Promise<void> {}

  async set(user: User, token: string): Promise<void> {}

  async clear(): Promise<void> {}
}
```

### Test Setup

```TypeScript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Storage } from '@ionic/storage';

import { IdentityService } from './identity.service';

describe('IdentityService', () => {
  let service: IdentityService;
  let httpTestController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: Storage, useFactory: createIonicStorageMock }]
    });
    service = TestBed.inject(IdentityService);
    httpTestController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('init', () => {});

  describe('set', () => {});

  describe('clear', () => {});
});

function createIonicStorageMock() {
  return jasmine.createSpyObj<Storage>('Storage', {
    get: Promise.resolve(),
    set: Promise.resolve(),
    ready: Promise.resolve(null)
  });
}
```

### Init

```typescript
    it('waits for storage to be ready', () => {
      const storage = TestBed.inject(Storage);
      service.init();
      expect(storage.ready).toHaveBeenCalledTimes(1);
    });

    it('gets the stored token', async () => {
      const storage = TestBed.inject(Storage);
      await service.init();
      expect(storage.get).toHaveBeenCalledTimes(1);
      expect(storage.get).toHaveBeenCalledWith('auth-token');
    });
```

#### If a Token Exists

```typescript
    describe('if there is a token', () => {
      beforeEach(() => {
        const storage = TestBed.inject(Storage);
        (storage.get as any).and.returnValue(Promise.resolve('3884915llf950'));
      });
    });
```

```typescript
      it('assigns the token', async ()=>{
        await service.init();
        expect(service.token).toEqual('3884915llf950');
      });
```

```typescript
      it('gets the current user', async () => {
        await service.init();
        const req = httpTestController.expectOne(`${environment.dataService}/users/current`);
        expect(req.request.method).toEqual('GET');
        httpTestController.verify();
      });
```

```typescript
      it('assigns the user', async () => {
        await service.init();
        const req = httpTestController.expectOne(`${environment.dataService}/users/current`);
        req.flush({ id: 42, firstName: 'Joe', lastName: 'Tester', email: 'test@test.org' });
        expect(service.user).toEqual({ id: 42, firstName: 'Joe', lastName: 'Tester', email: 'test@test.org' });
      });
```

#### If a Token Does Not Exist

```typescript
    describe('if there is not a token', () => {
      it('does not get the current user', async () => {
        await service.init();
        httpTestController.verify();
        expect(service.token).toBeUndefined();
        expect(service.user).toBeUndefined();
      });
    });
```

### Set

Step 1 - set the user

```typescript
    it('sets the user', () => {
      service.set({ id: 42, firstName: 'Joe', lastName: 'Tester', email: 'test@test.org' }, '19940059fkkf039');
      expect(service.user).toEqual({ id: 42, firstName: 'Joe', lastName: 'Tester', email: 'test@test.org' });
    });
```

Step 2 - set the token

```typescript
    it('sets the token', () => {
      service.set({ id: 42, firstName: 'Joe', lastName: 'Tester', email: 'test@test.org' }, '19940059fkkf039');
      expect(service.token).toEqual('19940059fkkf039');
    });
```

Step 3 - wait for the storage to be ready

```typescript
    it('waits for storage to be ready', ()=>{
      const storage = TestBed.inject(Storage);
      service.set({id: 42, firstName: 'Joe', lastName: 'Tester', email: 'test@test.org'}, '19940059fkkf039');
      expect(storage.ready).toHaveBeenCalledTimes(1);
    });
```

Step 4 - save the token

```typescript
    it('saves the token in storage', async ()=>{
      const storage = TestBed.inject(Storage);
      await service.set({id: 42, firstName: 'Joe', lastName: 'Tester', email: 'test@test.org'}, '19940059fkkf039');
      expect(storage.set).toHaveBeenCalledTimes(1);
      expect(storage.set).toHaveBeenCalledWith('auth-token', '19940059fkkf039');
    });
```

Step 5 - emits changed

```typescript
    it('emits the change', async () => {
      let user: User;
      service.changed.subscribe(u => (user = u));
      await service.set({ id: 42, firstName: 'Joe', lastName: 'Tester', email: 'test@test.org' }, '19940059fkkf039');
      expect(user).toEqual({ id: 42, firstName: 'Joe', lastName: 'Tester', email: 'test@test.org' });
    });
```

### Clear

Test Setup:

```typescript
  describe('clear', () => {
    beforeEach(async () => {
      await service.set({ id: 42, firstName: 'Joe', lastName: 'Tester', email: 'test@test.org' }, '19940059fkkf039');
      const storage = TestBed.inject(Storage);
      (storage.ready as any).calls.reset();
    });
  });
```

Step 1 - clear the user

```typescript
    it('clears the user', () => {
      service.clear();
      expect(service.user).toBeUndefined();
    });
```

Step 2 - clear the token

```typescript
    it('clears the token', () => {
      service.clear();
      expect(service.token).toBeUndefined();
    });
```

Step 3 - await ready 

```typescript
    it('waits for the storage to be ready', () => {
      const storage = TestBed.inject(Storage);
      service.clear();
      expect(storage.ready).toHaveBeenCalledTimes(1);
    });
```

Step 4 - clear the storage

```typescript
    it('clears the storage', async () => {
      const storage = TestBed.inject(Storage);
      await service.clear();
      expect(storage.remove).toHaveBeenCalledTimes(1);
      expect(storage.remove).toHaveBeenCalledWith('auth-token');
    });
```

Step 5 - emit undefined

```typescript
    it('emits empty', async () => {
      let user: User = { ...service.user };
      service.changed.subscribe(u => (user = u));
      await service.clear();
      expect(user).toBeUndefined();
    });
```

### Hookup

#### HTTP Interceptor

```bash
$ ionic g s services/http-interceptors/auth-interceptor --skipTests
```

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

import { IdentityService } from '../identity/identity.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private identity: IdentityService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.requestRequiresToken(req) && this.identity.token) {
      req = req.clone({
        setHeaders: {
          Authorization: 'Bearer ' + this.identity.token
        }
      });
    }
    return next.handle(req);
  }

  private requestRequiresToken(req: HttpRequest<any>): boolean {
    return !/\/login$/.test(req.url);
  }
}
```

```typescript
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
```

#### APP_INITIALIZER

```TypeScript
    {
      provide: APP_INITIALIZER,
      useFactory: (identity: IdentityService) => () => identity.init(),
      deps: [IdentityService],
      multi: true
    },
```

#### Centralized Navigation

**src/app/services/identity/identity.service.mock.ts**

```typescript
import { Subject } from 'rxjs';
import { User } from '@app/models';

export function createIdentityServiceMock() {
  const mock = jasmine.createSpyObj('IdentityService', {
    init: Promise.resolve(),
    set: Promise.resolve(),
    clear: Promise.resolve()
  });
  mock.changed = new Subject<User>();
  return mock;
}
```

**src/app/services/testing.ts**

```typescript
export * from './identity/identity.service.mock';
```

**tsconfig.app.json**

```typescript
  "exclude": [
    "src/**/*.mock.ts",
    "src/**/*.prod.ts",
    "src/**/*.spec.ts",
    "src/**/testing.ts",
    "src/test.ts"
  ]
```

**src/app/app.component.spec.ts**

The `describe()` is a child of the `describe('init', ...)`

```typescript
        { provide: IdentityService, useFactory: createIdentityServiceMock },
        { provide: NavController, useFactory: createNavControllerMock },
...
    describe('navigation', () => {
      let navController: NavController;
      beforeEach(async () => {
        navController = TestBed.inject(NavController);
        TestBed.createComponent(AppComponent);
        await platform.ready();
      });

      it('does not route if no identity change', () => {
        expect(navController.navigateRoot).not.toHaveBeenCalled();
      });

      it('routes to login if no user', () => {
        const identity = TestBed.inject(IdentityService);
        (identity.changed as Subject<User>).next();
        expect(navController.navigateRoot).toHaveBeenCalledTimes(1);
        expect(navController.navigateRoot).toHaveBeenCalledWith(['/', 'login']);
      });

      it('routes to root if user', () => {
        const identity = TestBed.inject(IdentityService);
        (identity.changed as Subject<User>).next({
          id: 33,
          firstName: 'Fred',
          lastName: 'Rogers',
          email: 'beautiful.day@neighborhood.com'
        });
        expect(navController.navigateRoot).toHaveBeenCalledTimes(1);
        expect(navController.navigateRoot).toHaveBeenCalledWith(['/']);
      });
    });
```

**src/app/app.component.ts**

```typescript
  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
    this.identity.changed.subscribe(u => {
      const route = u ? ['/'] : ['/', 'login'];
      this.navController.navigateRoot(route);
    });
  }
```

## Authentication Service

```bash
$ ionic g s services/authentication/authentication
```

Be sure to add it to the `src/app/services/index.ts`.

### Interface Setup

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, EMPTY } from 'rxjs';

import { IdentityService } from '../identity/identity.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  constructor(private http: HttpClient, private identity: IdentityService) {}

  login(email: string, password: string): Observable<boolean> {
    return EMPTY;
  }

  logout(): Observable<any> {
    return EMPTY;
  }
}
```

### Test Setup

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';

import { AuthenticationService } from './authentication.service';
import { IdentityService } from '../identity/identity.service';
import { createIdentityServiceMock } from '../identity/identity.service.mock';

describe('AuthenticationService', () => {
  let httpTestingController: HttpTestingController;
  let service: AuthenticationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: IdentityService, useFactory: createIdentityServiceMock }]
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AuthenticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {});

  describe('logout', () => {});
});
```

### login

```typescript
    it('POSTs the login', () => {
      service.login('thank.you@forthefish.com', 'solongDude').subscribe();
      const req = httpTestingController.expectOne(`${environment.dataService}/login`);
      expect(req.request.method).toEqual('POST');
      req.flush({});
      httpTestingController.verify();
    });
```

```typescript
    it('passes the credentials in the body', () => {
      service.login('thank.you@forthefish.com', 'solongDude').subscribe();
      const req = httpTestingController.expectOne(`${environment.dataService}/login`);
      expect(req.request.body).toEqual({
        username: 'thank.you@forthefish.com',
        password: 'solongDude'
      });
      req.flush({});
      httpTestingController.verify();
    });
```

```typescript
    describe('on success', () => {
      let response: any;
      beforeEach(() => {
        response = {
          success: true,
          token: '48499501093kf00399sg',
          user: {
            id: 42,
            firstName: 'Douglas',
            lastName: 'Adams',
            email: 'thank.you@forthefish.com'
          }
        };
      });
    });
```

```typescript
      it('resolves true', fakeAsync(() => {
        service.login('thank.you@forthefish.com', 'solongDude').subscribe(r => expect(r).toEqual(true));
        const req = httpTestingController.expectOne(`${environment.dataService}/login`);
        req.flush(response);
        tick();
        httpTestingController.verify();
      }));
```

```typescript
      it('sets the identity', () => {
        service.login('thank.you@forthefish.com', 'solongDude').subscribe();
        const req = httpTestingController.expectOne(`${environment.dataService}/login`);
        req.flush(response);
        httpTestingController.verify();
        expect(identity.set).toHaveBeenCalledTimes(1);
        expect(identity.set).toHaveBeenCalledWith(
          {
            id: 42,
            firstName: 'Douglas',
            lastName: 'Adams',
            email: 'thank.you@forthefish.com'
          },
          '48499501093kf00399sg'
        );
      });
```

```typescript
    describe('on failure', () => {
      let response: any;
      beforeEach(() => {
        response = { success: false };
      });
    });
```

```typescript
      it('resolves false', fakeAsync(() => {
        service.login('thank.you@forthefish.com', 'solongDude').subscribe(r => expect(r).toEqual(false));
        const req = httpTestingController.expectOne(`${environment.dataService}/login`);
        req.flush(response);
        tick();
        httpTestingController.verify();
      }));
```

```typescript
      it('does not set the identity', () => {
        service.login('thank.you@forthefish.com', 'solongDude').subscribe();
        const req = httpTestingController.expectOne(`${environment.dataService}/login`);
        req.flush(response);
        httpTestingController.verify();
        expect(identity.set).not.toHaveBeenCalledTimes(1);
      });
```

### logout

```typescript
    it('POSTs the logout', () => {
      service.logout().subscribe(() => ());
      const req = httpTestingController.expectOne(`${environment.dataService}/logout`);
      req.flush({});
      httpTestingController.verify();
    });
```

```typescript
    it('clears the identity', fakeAsync(() => {
      const identity = TestBed.inject(IdentityService);
      service.logout().subscribe();
      const req = httpTestingController.expectOne(`${environment.dataService}/logout`);
      req.flush({});
      tick();
      expect(identity.clear).toHaveBeenCalledTimes(1);
    }));
```

### Create a Mock Factory

```typescript
import { EMPTY } from 'rxjs';

export function createAuthenticationServiceMock() {
  return jasmine.createSpyObj('AuthenticationService', {
    login: EMPTY,
    logout: EMPTY
  });
}
```

Remember to add to `src/app/services/testing/ts`

## Hookups

### Login Page

Add a utilitly function to clean a button:

```typescript
  function click(button: HTMLIonButtonElement) {
    const event = new Event('click');
    button.dispatchEvent(event);
    fixture.detectChanges();
  }
```

```typescript
    it('performs a login on clicked', () => {
      const authenticationService = TestBed.inject(AuthenticationService);
      setInputValue(email, 'test@test.com');
      setInputValue(password, 'password');
      click(button);
      expect(authenticationService.login).toHaveBeenCalledTimes(1);
      expect(authenticationService.login).toHaveBeenCalledWith('test@test.com', 'password');
    });
```

```typescript
    it('sets an error message if the login failed', ()=>{
      const authenticationService = TestBed.inject(AuthenticationService);
      const  errorDiv: HTMLDivElement = fixture.nativeElement.querySelector('.error-message');
      (authenticationService.login as any).and.returnValue(of(false));
      click(button);
      expect(errorDiv.textContent.trim()).toEqual('Invalid e-mail address or password');
    });
```

The final code and markup should look like this:

```typescript
  signIn() {
    this.auth
      .login(this.email, this.password)
      .pipe(take(1))
      .subscribe(success => {
        if (!success) {
          this.errorMessage = 'Invalid e-mail address or password';
        }
      });
  }
```

```HTML
    <div class="error-message">

      <!-- (input related error messages are here) -->

      <div>{{ errorMessage }}</div>
    </div>
```

### Tea Page

This is a temporary change for testing. We will eventually move the logout and do more with it. We won't unit test it yet, but we will need to provide the mock to prevent our existing tests from failing.

```typescript
    TestBed.configureTestingModule({
      declarations: [TeaPage],
      imports: [IonicModule],
      providers: [{ provide: AuthenticationService, useFactory: createAuthenticationServiceMock }]
    }).compileComponents();
```

Inject the authentication service and create a simple logout method.

```typescript
  constructor(private auth: AuthenticationService) {
    this.listToMatrix();
  }

  logout() {
    this.auth
      .logout()
      .pipe(take(1))
      .subscribe();
  }
```

Have a look at the <a href="https://ionicframework.com/docs/api/toolbar" target="_blank">Ionic Toolbar</a> documentation and add a button in the `end` slot. Use the `log-out-outline` icon and hook the button up to the newly created `logout()` method.
