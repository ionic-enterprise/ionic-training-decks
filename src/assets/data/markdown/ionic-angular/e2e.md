# Lab: End to End Testing

In this lab, you will learn how to:

- Run the end-to-end tests
- Configure the testing environment
- Create page objects
- Write end-to-end tests

## Running End-to-end Tests

The end-to-end tests run as their own stand-alone application. By default, this application uses the same port that is used when running the application in dev mode via `npm start`.

- Make sure you are not running the application via `npm start`
- Use `npm run e2e` to run the end-to-end tests

The tests should fail with the following error:

```
1) new App should display welcome message
  - Expected 'Current Weather' to contain 'Tab One'.
```

This is because we have changed the application but have not updated the default end-to-end test that was generated when we created our project. Let's fix this now.

- Open `e2e/src/app.e2e-spec.ts`
- Change 'Tab One' to 'Current Weather'
- Save the change and re-run the end-to-end tests

## Configuring End-to-end Tests

End-to-end tests do not test the code in isolation like unit tests do. For this reason, it is best to set up a controlled environment in which to run the tests. This environment will typically consist of controlled test versions of any backend APIs that the application uses. This ensures that consistent data is used for the tests, and allows you to handle various other operations safely.

Once the test environment is set up, the NPM script that is used to launch the test needs to be modified to always use the test environment.

### Set Up a Test API Server

- `npm i -g json-server`
- get the JSON file (maybe this will be part of the template?)
- `json-server e2e/data/db.json`

### Set Up Environments

#### Create a `src/environments/environment.e2e.ts`

This environment files will contain the base URL that will be used when retrieving data for the end-to-end tests

#### Update `angular.json`

### Run Tests

Now that the environment has been created, the NPM scripts need to be updated to use the new testing configuration. Make the following change to the `e2e` script in your `package.json` file:

```
"e2e": "ng e2e --configuration=test",
```

## Create Page Objects

## Create Tests
