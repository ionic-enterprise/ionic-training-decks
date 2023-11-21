# Lab: Authenticate the User

In this lab you will add learn how to:

- Use Angular's HttpClient service to POST data to an API
- Test code that relies on HTTP calls

## Set up the Environment

Update both of the files under `src/environments` to include the following property:

```typescript
dataService: 'https://cs-demo-api.herokuapp.com',
```

These files define the `dev` and `prod` environments. Typically they would have different values for something like the data service, but for our app we only have a single API server. Also, you can create more environments (QA, Testing, etc), but doing so is beyond the scope of this training.

## Authentication Service

In the last lab, we created a service that stores session. But how do we get that session in the first place? That is where the authentication service comes in. Just like with any other service, the first thing we need to do is generate it:

```bash
ionic g s core/authentication/authentication
```

Be sure to add it to the `src/app/core/index.ts`.

### Interface Setup

Just like when we created the session vault service, we will start the actual coding by figuring out the initial shape of our API. Update `src/app/core/authentication/authentication.service.ts` to contain the following methods:

**`src/app/core/authentication/authentication.service.ts`**

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, EMPTY } from 'rxjs';

import { Session } from '@app/models';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<Session | undefined> {
    return EMPTY;
  }

  logout(): Observable<any> {
    return EMPTY;
  }
}
```

### Test Setup

With the initial shape of our API in place, we are better informed in how to set up our unit test. Let's do that now. Update `src/app/core/authentication/authentication.service.spec.ts` as follows:

**`src/app/core/authentication/authentication.service.spec.ts`**

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthenticationService } from './authentication.service';

describe('AuthenticationService', () => {
  let httpTestingController: HttpTestingController;
  let service: AuthenticationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AuthenticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // describe('login', () => {});

  // describe('logout', () => {});
});
```

**Note:** This is just a template to get you started. As you go through this, you will need to do some things on your own, such as importing various objects and functions from the appropriate libraries (often `@angular/core/testing` or `rxjs`). You can use your editor's automatic import feature or you can manually add the import. You will not be told by the labs when you need them, but your editor will let you know.

### login

Let's build up the login on step at a time following TDD. With each step, two code blocks are given. The first code block is the test case for a requirement, and it belongs within the `describe('login', ...)` block of your newly created test file. The second code block is the code that satisfies the requirement, and it belongs in the `login()` method in your new service class.

This exercise demonstrates how code is built up baby-step by baby-step using TDD. It may seem tedious at first, but the advantages of this process are:

- You only need to concentrate on one small piece of logic at a time.
- As a result, the resulting code tends to be easier to understand.
- You end up with a full set of tests for the code.
- As a result, it is easier to refactor the resulting code as needed to make it more readable and maintainable.

Readability and maintainability are far more important than initial development time when it comes to the long-term costs associated with a project. Following TDD is one way to help keep the long-term costs of the project in check.

#### Step 1 - POST the Login

##### Test

```typescript
it('POSTs the login', () => {
  service.login('thank.you@forthefish.com', 'solongDude').subscribe();
  const req = httpTestingController.expectOne(`${environment.dataService}/login`);
  expect(req.request.method).toEqual('POST');
  req.flush({});
  httpTestingController.verify();
});
```

##### Code

```typescript
return this.http.post<Session>(`${environment.dataService}/login`, {});
```

#### Step 2 - Pass the Credentials

##### Test

```typescript
it('passes the credentials in the body', () => {
  service.login('thank.you@forthefish.com', 'solongDude').subscribe();
  const req = httpTestingController.expectOne(`${environment.dataService}/login`);
  expect(req.request.body).toEqual({
    username: 'thank.you@forthefish.com',
    password: 'solongDude',
  });
  req.flush({});
  httpTestingController.verify();
});
```

##### Code

```typescript
return this.http.post<Session>(`${environment.dataService}/login`, {
  username: email,
  password,
});
```

#### Step 3 - Handle a Successful Login

Remember that it is very common to nest `describe()` calls. In this case we want to test functionality that will only apply when the login is a success. The following `describe()` should thus be nested within the `describe('login', ...)`.

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
        email: 'thank.you@forthefish.com',
      },
    };
  });
});
```

The following `3.1` step should then be nested within the `describe()` that was just created.

##### Step 3.1 - Emit the Session

###### Test

```typescript
it('emits the session', fakeAsync(() => {
  let session: Session | undefined;
  service.login('thank.you@forthefish.com', 'solongDude').subscribe((r) => (session = r));
  const req = httpTestingController.expectOne(`${environment.dataService}/login`);
  req.flush(response);
  tick();
  httpTestingController.verify();
  expect(session).toEqual({
    token: '48499501093kf00399sg',
    user: {
      id: 42,
      firstName: 'Douglas',
      lastName: 'Adams',
      email: 'thank.you@forthefish.com',
    },
  });
}));
```

###### Code

For this one, it would be best to create a local type definition. So create the following in `src/app/core/authentication/authentication.service.ts` right after the ES6 imports.

```typescript
interface LoginResponse extends Session {
  success: boolean;
}
```

This is the _actual_ shape of the data returned from the API, so change the type on the `post()` and `map()` the return data to remove the `success` flag.

```typescript
return this.http
  .post<LoginResponse>(`${environment.dataService}/login`, {
    username: email,
    password,
  })
  .pipe(
    map((res: LoginResponse) => {
      const { success, ...session } = res;
      return session;
    }),
  );
```

#### Step 4 - Handle a Login Failure

Testing a login failure will be similar. We will nest a `describe()` within the `describe('login', ...)` and then nest the test cases within it.

```typescript
describe('on failure', () => {
  let response: any;
  beforeEach(() => {
    response = { success: false };
  });
});
```

##### Step 4.1 - Emit Undefined

###### Test

```typescript
it('emits undefined', fakeAsync(() => {
  service.login('thank.you@forthefish.com', 'solongDude').subscribe((r) => expect(r).toEqual(undefined));
  const req = httpTestingController.expectOne(`${environment.dataService}/login`);
  req.flush(response);
  tick();
  httpTestingController.verify();
}));
```

###### Code

That just takes one minor tweak in the `map()`:

```typescript
map((res: LoginResponse) => {
  const { success, ...session } = res;
  return success ? session : undefined;
});
```

In case you got lost at any step, here is the complete code so far:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, EMPTY } from 'rxjs';
import { map } from 'rxjs/operators';

import { Session } from '@app/models';
import { environment } from '@env/environment';

interface LoginResponse extends Session {
  success: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<Session | undefined> {
    return this.http
      .post<LoginResponse>(`${environment.dataService}/login`, {
        username: email,
        password,
      })
      .pipe(
        map((res: LoginResponse) => {
          const { success, ...session } = res;
          return success ? session : undefined;
        }),
      );
  }

  logout(): Observable<any> {
    return EMPTY;
  }
}
```

### logout

The logout is easier, and now you have a model for the code. So I will provide the tests that should be nested within the `describe('logout'...)`. I leave the coding to you.

#### Step 1 - POST the Logout

##### Test

```typescript
it('POSTs the logout', () => {
  service.logout().subscribe();
  const req = httpTestingController.expectOne(`${environment.dataService}/logout`);
  req.flush({});
  httpTestingController.verify();
  expect(true).toBe(true); // Prevents Jasmine warning
});
```

Well, that's really the only step...

**Challenge:** go write the code for that requirement. When you are done making this test pass, `EMPTY` should be marked as unused in your imports section. Be sure to remove it.

### Create a Mock Factory

We will want to use the `AuthenticationService` when we update the store logic and thus will need to mock it in tests. Create a factory for that now.

```typescript
import { EMPTY } from 'rxjs';
import { AuthenticationService } from './authentication.service';

export const createAuthenticationServiceMock = () =>
  jasmine.createSpyObj<AuthenticationService>('AuthenticationService', {
    login: EMPTY,
    logout: EMPTY,
  });
```

Remember to add to `src/app/core/testing.ts`

## Conclusion

With the last two labs, we have created services to manage our session state and to handle the authentication logic. In the next section we will begin to assemble the pieces created here to develop our authentication flow.
