# Lab: Store the User Identity

In this lab you will learn how to:

- Create an Angular service
- Use the Capacitor Storage API
- Implement a Pub/Sub pattern via RxJS Subjects
- Guard routes that require a user identity

## Create the User Model

The first thing we will need the model of the user. Create a `src/app/models/user.ts` file with the following contents:

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

Update both of the files under `src/environments` to include the following property in the JSON:

```TypeScript
dataService: 'https://cs-demo-api.herokuapp.com'
```

These files define the `dev` and `prod` environments. Typically they would have different values for something like the data service, but for our app we only have a single API server. Also, you can create more environments (QA, Testing, etc), but doing so is beyond the scope of this class.

## Create the Identity Service

It is now time to get down to the main subject here and create an Angular service that will store information about the currently authenticated user.

```bash
$ ionic generate service core/identity/identity
```

Create `src/app/core/index.ts`. This is the barrel file for all of our `core` services.

```typescript
export * from './identity/identity.service';
```

### Interface Setup

The first thing we will do is define what we want the shape of our service to be. Modify the generated service to include the following properties and methods.

Notice for the "changed" subject, we are keeping the subject private and only exposing it as an observable. Exposing the subject itself is an anti-pattern that should generally be avoided. The reason exposing the subject is an anti-pattern is that doing so would allow anyone to emit it. We want this service and only this service to emit on it. Everyone else should only listen for changes.

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';

import { User } from '@app/models';

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

  async init(): Promise<void> {}

  async set(user: User, token: string): Promise<void> {}

  async clear(): Promise<void> {}
}
```

### Test Setup

Now that we have the interface for the service worked out, we can fill out a skeleton of the test.

```TypeScript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Plugins } from '@capacitor/core';

import { IdentityService } from './identity.service';

describe('IdentityService', () => {
  let service: IdentityService;
  let httpTestController: HttpTestingController;
  let originalStorage: any;

  beforeEach(() => {
    originalStorage = Plugins.Storage;
    Plugins.Storage = jasmine.createSpyObj('Storage', {
      get: Promise.resolve(),
      set: Promise.resolve(),
      remove: Promise.resolve()
    });
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(IdentityService);
    httpTestController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    Plugins.Storage = originalStorage;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('init', () => {});

  describe('set', () => {});

  describe('clear', () => {});
});
```

### Init

The following tests will all go within the `init` describe block. In the spirit of TDD, write the code to satisfy each test as we go.

The first task we have is to check storage to see if we have a stored auth token.

```typescript
it('gets the stored token', async () => {
  await service.init();
  expect(Plugins.Storage.get).toHaveBeenCalledTimes(1);
  expect(Plugins.Storage.get).toHaveBeenCalledWith({ key: 'auth-token' });
});
```

Add the code to satify this test. Check with the <a href="https://capacitorjs.com/docs/apis/storage" target="_blank">Storage API</a> docs if you get stuck.

When the token is obtained, there are two potential outcomes. Either a token exists or it does not. First let's define the behavior for when a token exists.

#### If a Token Exists

Nest the following `describe` inside of the `describe('init', ...)`:

```typescript
describe('if there is a token', () => {
  beforeEach(() => {
    (Plugins.Storage.get as any).and.returnValue(
      Promise.resolve({
        value: '3884915llf950',
      }),
    );
  });
});
```

If a token exists, it should be assigned to the property. Here is the test, place it inside the `describe()` that you just added. I will leave the coding that satisfies the test up to you.

```typescript
it('assigns the token', async () => {
  await service.init();
  expect(service.token).toEqual('3884915llf950');
});
```

Next, if we have a token, we should query the backend API and get the user associated with that token. This can be done by doing a GET of the `users/current` endpoint.

```typescript
it('gets the current user', async () => {
  await service.init();
  const req = httpTestController.expectOne(
    `${environment.dataService}/users/current`,
  );
  expect(req.request.method).toEqual('GET');
  httpTestController.verify();
});
```

Since we have not really covered using Angular's `HttpClient` service yet, I will give you the code you need here. Don't worry if you don't fully understand this code. We will cover that later.

```typescript
this.http
  .get<User>(`${environment.dataService}/users/current`)
  .pipe(take(1))
  .subscribe();
```

**Note:** In both cases, you will need to add the ES6 import for the `environment` object (`import { environment } from '@env/environment';`). You will also need to add the ES6 import for `take`. It is in `rxjs/operators`.

Finally, when the HTTP call returns, we should assign the user.

```typescript
it('assigns the user', async () => {
  await service.init();
  const req = httpTestController.expectOne(
    `${environment.dataService}/users/current`,
  );
  req.flush({
    id: 42,
    firstName: 'Joe',
    lastName: 'Tester',
    email: 'test@test.org',
  });
  expect(service.user).toEqual({
    id: 42,
    firstName: 'Joe',
    lastName: 'Tester',
    email: 'test@test.org',
  });
});
```

Again, since we have not covered the use of Angular's `HttpClient` yet, I will give you the code to make this pass. What you need to do is modify the `subscribe()` that we wrote in the prior step to look like this:

```typescript
        .subscribe(u => (this._user = u));
```

#### If a Token Does Not Exist

The tests for the case where a token is not defined are way easier. Nest the following `describe` inside of the `describe('init', ...)`:

```typescript
describe('if there is not a token', () => {
  it('does not assign a token', async () => {
    await service.init();
    expect(service.token).toBeUndefined();
  });

  it('does not get the current user', async () => {
    await service.init();
    httpTestController.verify();
    expect(service.token).toBeUndefined();
    expect(service.user).toBeUndefined();
  });
});
```

Depending on how you have written your code to this point, you may or may not have to make some modifications to get those tests to pass.

### Set

The `set()` method is called whenever a newly logged in user needs to be registered as the current user. Therefore, it has the following requirements:

- Set the user
- Set the token
- Save the token in storage
- Emit the change

I will provide the tests. In each case, add them whithin the `describe('set', ...)` section of the test. Once you have added one test, save that file and let the tests run. You should have a failing test. At that point, add the code required to get the test to pass.

#### Set the user

Here is the test that ensures that the user gets set:

```typescript
it('sets the user', () => {
  service.set(
    { id: 42, firstName: 'Joe', lastName: 'Tester', email: 'test@test.org' },
    '19940059fkkf039',
  );
  expect(service.user).toEqual({
    id: 42,
    firstName: 'Joe',
    lastName: 'Tester',
    email: 'test@test.org',
  });
});
```

The code to make this pass should be pretty straight forward. Add it to the `set()` method in the code.

#### Set the token

Once again, I will provide the test:

```typescript
it('sets the token', () => {
  service.set(
    { id: 42, firstName: 'Joe', lastName: 'Tester', email: 'test@test.org' },
    '19940059fkkf039',
  );
  expect(service.token).toEqual('19940059fkkf039');
});
```

And you will need to provide the code to satisfy the test.

#### Save the token

```typescript
it('saves the token in storage', async () => {
  await service.set(
    { id: 42, firstName: 'Joe', lastName: 'Tester', email: 'test@test.org' },
    '19940059fkkf039',
  );
  expect(Plugins.Storage.set).toHaveBeenCalledTimes(1);
  expect(Plugins.Storage.set).toHaveBeenCalledWith({
    key: 'auth-token',
    value: '19940059fkkf039',
  });
});
```

Check with the <a href="https://capacitorjs.com/docs/apis/storage" target="_blank">Storage API</a> docs if you get stuck.

#### Emits the change

```typescript
it('emits the change', async () => {
  let user: User;
  service.changed.subscribe(u => (user = u));
  await service.set(
    { id: 42, firstName: 'Joe', lastName: 'Tester', email: 'test@test.org' },
    '19940059fkkf039',
  );
  expect(user).toEqual({
    id: 42,
    firstName: 'Joe',
    lastName: 'Tester',
    email: 'test@test.org',
  });
});
```

Check with the <a href="https://rxjs-dev.firebaseapp.com/guide/subject" target="_blank">RxJS Subject</a> docs if you get stuck.

### Clear

The `clear()` method is called whenever a user logs out. Its requirements are the opposite of those for the `set()` method:

- Clear the user
- Clear the token
- Remove the token from storage
- Emit the change

I will provide the tests. In each case, add them whithin the `describe('clear', ...)` section of the test. Once you have added one test, save that file and let the tests run. You should have a failing test. At that point, add the code required to get the test to pass.

First, though, some test setup. Since this routine is called when a user logs out, it makes sense for us to start in the state the system would be in with a logged in user. Thus, before each test we will set a user.

```typescript
describe('clear', () => {
  beforeEach(async () => {
    await service.set(
      { id: 42, firstName: 'Joe', lastName: 'Tester', email: 'test@test.org' },
      '19940059fkkf039',
    );
  });
});
```

#### Clear the User

```typescript
it('clears the user', () => {
  service.clear();
  expect(service.user).toBeUndefined();
});
```

#### Clear the Token

```typescript
it('clears the token', () => {
  service.clear();
  expect(service.token).toBeUndefined();
});
```

#### Clear the Storage

```typescript
it('clears the storage', async () => {
  await service.clear();
  expect(Plugins.Storage.remove).toHaveBeenCalledTimes(1);
  expect(Plugins.Storage.remove).toHaveBeenCalledWith({ key: 'auth-token' });
});
```

#### Emit Undefined

```typescript
it('emits empty', async () => {
  let user: User = { ...service.user };
  service.changed.subscribe(u => (user = u));
  await service.clear();
  expect(user).toBeUndefined();
});
```

## Centralized Navigation (Pub/Sub)

### Identity Service Mock Factory

Add a `src/app/core/identity/identity.service.mock.ts` file and inside of it create a factory used to build mock IdentityService objects for testing.

```typescript
import { Subject } from 'rxjs';
import { User } from '@app/models';

export function createIdentityServiceMock() {
  const mock = jasmine.createSpyObj('IdentityService', {
    init: Promise.resolve(),
    set: Promise.resolve(),
    clear: Promise.resolve(),
  });
  mock.changed = new Subject<User>();
  return mock;
}
```

Also create a `testing` barrel file called `src/app/core/testing.ts` that will eventually contain all of the `core` mock factories.

```typescript
export * from './identity/identity.service.mock';
```

The `tsconfig.app.json` will also need to be updated to ignore that file in the app builds.

```typescript
  "exclude": [
    "src/**/environment.prod.ts",
    "src/**/*.mock.ts",
    "src/**/*.spec.ts",
    "src/**/testing.ts",
    "src/test.ts"
  ]
```

### Write the Tests

Update the `src/app/app.component.spec.ts` file by adding the following tests. The requirements we are testing are:

- If there is no identity change, no action
- If there is an identity change with a user, navigate to the root path
- If there is an identity change without a user, navigate to the login page

The first items in the code below are added to the `providers` array where the `TestBed` is configured.

```typescript
        { provide: IdentityService, useFactory: createIdentityServiceMock },
        { provide: NavController, useFactory: createNavControllerMock },
...
  describe('navigation', () => {
    let navController: NavController;
    let platform: Platform;
    beforeEach(async () => {
      navController = TestBed.inject(NavController);
      platform = TestBed.inject(Platform);
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

**Note:** You will need to update the ES6 imports, but you should be well versed at that by now. If you have any questions or issues though, please ask.

### Write the Code

Update the `src/app/app.component.ts` file. One way to accomplish this is the following:

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

**Note:** You will need to inject the `IdentityService` and `NavController`. Doing so is left as an exercise for the reader, but please ask if you have any issues doing this.

## Conclusion

You have created a service that will store the information about the currently logged in user, but we have not provided a way for the user to actually authenticate with the API. That is what we will talk about next.
