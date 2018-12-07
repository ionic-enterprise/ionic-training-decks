# Lab: Running Tests

In this lab, you will:

* run the starter unit tests
* run the starter end-to-end tests

## Unit Tests

Unit tests are used to test individual objects in isolation. Each component, directive, page, pipe, and service in the project will have its own unit test file. To run unit tests, type `npm test` at the command line. The application will build and the tests will run. The test process will watch for changes and re-run whenever changes are made. As a general rule, unit tests should be continuously run during development in order to detect changes that break existing functionallity. This also ties in with the use of Test Driven Development.

## End-to-end Tests

End to end tests are intended to test the appication as a whole rather than testing individual objects in isolation. End to end tests tend to focus on "user stories" or "tasks", testing that a particular operation works as expected from start to finish. For this reason, rather than the test files existing next to any particular object's source, the test files exist in their own folder.

To run the end-to-end tests, type `npm run e2e`. Notice that unlike the unit tests, where the intent is that they will run as development is ongoing, the end-to-end tests run and exit. As a general rule, end-to-end tests should be run at key moments in the development of a feature or fix rather than continuously during development,.