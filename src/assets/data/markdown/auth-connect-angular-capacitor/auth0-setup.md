# Lab: Auth0 Project Setup

## Determine an `Auth_URL_Scheme`

The Auth URL Scheme is a custom scheme that is used to call into your application from a browser window on a device. It can be thought of like the `https://` on a normal web address. This can be anything you want it to be, though it must all lowercase and be globally unique. A good suggestion for this scheme is to use your bundle ID from your application. In our case this is `com.ionic.actraining`. 

> Avoid using dash (`-`) or underscore (`_`) characters in this url scheme as they can cause issues on Android devices.

## Create and Configure a Project in Auth0

> If you already have a project configured in Auth0, then you can skip this step in the lab.

Log in or Create an account with Auth0 to begin. Once you are in the system, click on the `Create Application` button on the dashboard. Add a name for your application and then select `Native` for the application type. Click `Create` to finalize the process.

Open the `Settings` tab on the page and note the `ClientID` and `Domain` properties. We will use both of these fields in our auth configuration.

Scrolling down on this settings page, there are 2 additional boxes that we need to fill out.

1. `Allowed Callback URLs` - Here we need to configure the URLs where Auth0 will send the user when they successfully login. For our application we will use our `Auth_URL_Scheme` together with the page we want to navigate to. `com.ionic.actraining://login`
2. `Allowed Logout URLs` - Here we need to configure the URLs where Auth0 will send the user when they successfully logout. As before, we will use our `Auth_URL_Scheme` together with the page we want to navigate to. `com.ionic.actrainig://logout`

Scroll down and save the changes to the application.