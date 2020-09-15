# Walkthrough: Converting a Cordova App to Capacitor

Converting a Cordova application to a Capacitor application is a multi-step process, but each step is relatively small and the bulk of the work is scripted, which means you just need to run a few commands to be off and running.

There are two main phases of any conversion from Cordova to Capacitor: Basic Configuration and Project Cleanup.

## Phase 1: Basic Configuration

The goal of this phase is to get Capacitor installed in your project and the native projects created and building. This phase generally takes 15 minutes or less to complete, and often results in a fully functional application. Here are the full steps to this phase:

```bash
# Step 1
# Always work in a dedicated branch, NEVER work directly in the main branch of your application
$ git checkout -b feature/convertToCapacitor

# Step 2
$ ionic integration enable capacitor

# Step 3
edit capacitor.config.json

# Step 4
# Note: if you have never built your project, do "npm run build" first
$ ionic cap add ios
$ ionic cap add android

# Step 5
$ cordova-res ios --skip-config --copy
$ cordova-res android --skip-config --copy

# Step 6
$ ionic cap open ios
$ ionic cap open android
```

At the end of this process, many apps will already be working fine. Other apps may require minor tweaks due to issues with plugin configuration, but those will be addressed in the "Cleanup" section.

## Phase 2: Project Cleanup

Phase 2 has three main goals:

- Configure remaining Cordova plugins where needed
- Replace Cordova plugins with Capacitor Plugins or APIs where possible
- Remove the Cordova configuration and any plugins that are no longer being used

This step takes about 15-30 minutes for simple projects but can take significantly longer depending on the complexity of native interactions within the application being converted. As is always the rule, the fewer the plugins that your application uses, the better. For most well balanced applications, this step will most likely take an hour or less.

We will dive into this step in more detail in its own section of this walkthrough.

**Important:** A project may run just fine after the first phase, but you should still have a look at the second phase. There are important steps here that will allow you to take full advantage of using Capacitor as your native layer.

## About the Tutorial

For this tutorial, we will:

- Create a very simple Cordova application
- Install and Configure Capacitor in the simple Cordova application
- Perform the project cleanup

We suggest that you follow this process once just to get your bearings before trying this with your own application.

Use the navigation items in the header to see each of these phases in detail.
