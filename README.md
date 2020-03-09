# Ionic Training Decks

This material is meant to be used in conjunction with the Ionic Enterprise Training courses offered to our customers. The applications and labs contained within are some of the applications that are built during this course. This deck by no means contains all of the information provided in the course.

To run this deck on your machine:

1. `git clone https://github.com/ionic-team/ionic-training-decks.git`
1. `cd ionic-training-decks`
1. `npm install`
1. `npm start`

At this point, the training decks application should be running in your browser, allowing you to follow along with the specific labs.

This is also available online as a PWA that you can either run in the browser or install on your device: https://ionic-training-decks.firebaseapp.com

## Developer Notes

### Adding / Updating Trainings

Adding or updating trainings should not require a change to any of the source code. Here are some key points to help get started:

- All of the trainings are written as Markdown files and stored under `src/assets/data/markdown`.
- In order to provide better organization, sub-folders are used for each training.
- Simple one page trainings typically do not have their own sub-folder.
- Each training has an entry in the `src/assets/data/menu.json` file. The entry must have a `title` and `file`. It should also have an `icon`. If it is a multi-page training, it should also have a `folder` and list of `pages`. The `pages` are navigated via the navigation controls in the header of the application in the order in which they are specified.

The `menu.json` entry for a multi-page training looks like this:

```JSON
    {
      "title": "Identity Vault",
      "folder": "identity-vault-capacitor",
      "file": "intro",
      "icon": "lock-closed",
      "pages": [
        {
          "title": "The Base Application",
          "file": "base"
        },
        {
          "title": "Identity Service",
          "file": "identity-service"
        },
        {
          "title": "Make it Work in the Browser",
          "file": "browser-service"
        },
        {
          "title": "Add Biometrics to Login",
          "file": "biometrics"
        },
        {
          "title": "Customize the PIN Dialog",
          "file": "custom-pin"
        }
      ]
    },
```

The `menu.json` entry for a simple single-page training looks like this:

```JSON
    {
      "title": "A Simple git Workflow",
      "file": "simple-git-workflow",
      "icon": "git-branch"
    },
```

The trainings will be displayed in the main menu in the order in which they are specified.

Given the structure of the application, please only go one level deep with the trainings. That is, do not try and nest a list of pages on a page within a specific page on a training. That used to work in older versions of this application, but supporting it makes the UI overly complex and is a feature that was never used.

### Releasing

A `release` npm script has been created to make the release process easy. It will ask you a few basic questions and then do all of the work. There are just a few items to make sure of first:

- make sure you are on the `master` branch
- make sure all changes have been pushed to `master` and that you have all changes from `origin`
- make sure you are logged in to `firebase` as the `support@ionic.io` user

Once you have done that, type `npm run release`, answer a couple of questions, and you are off to the races.

```bash
➜  ionic-training-decks git:(master) ✗ firebase login
Already logged in as support@ionic.io
➜  ionic-training-decks git:(master) ✗ npm run release
```
