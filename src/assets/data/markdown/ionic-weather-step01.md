# Lab: Generate the Application

In this lab, you will:

* generate an Ionic application
* build and run the generated application
* set up a remote git repository for your application

## `ionic start`

The first step is to create the application and connect the application to Ionic Pro. To do this you will use the `ionic start` command.

1. In a command prompt, change directory to your working folder
1. Run the following command: `ionic start ionic-weather tabs --cordova`

This process will run for a while. It will generate the application from a starter template, set up the application to use Cordova, install the required libraries via NPM, initialize the git repository for the application, and perform the initial git commit.

The output looks like this:

```bash
~/Projects/Training: ionic start ionic-weather tabs --cordova
✔ Preparing directory ./ionic-weather - done!
✔ Downloading and extracting tabs starter - done!
> ionic integrations enable cordova --quiet
[INFO] Downloading integration cordova
[INFO] Copying integrations files to project
[OK] Integration cordova added!

Installing dependencies may take several minutes.

     ✨   IONIC  DEVAPP   ✨

 Speed up development with the Ionic DevApp, our fast, on-device testing mobile app

  -  🔑   Test on iOS and Android without Native SDKs
  -  🚀   LiveReload for instant style and JS updates

 -->    Install DevApp: https://bit.ly/ionic-dev-app    <--

────────────────────────────────────────────────────────────

> npm i

>> Snipped NPM output...

> git init
Initialized empty Git repository in /Users/kensodemann/Projects/Training/ionic-weather/.git/

     🔥   IONIC  PRO   🔥

 Supercharge your Ionic development with the Ionic Pro SDK

  -  ⚠️   Track runtime errors in real-time, back to your original TypeScript
  -  📲  Push remote updates and skip the app store queue

 Learn more about Ionic Pro: https://ionicframework.com/pro

────────────────────────────────────────────────────────────

? Install the free Ionic Pro SDK and connect your app? (Y/n) 
```

Note the final message in the output. This is asking you if you would like to connect your application to Ionic Pro. You want to do this.

1. Answer **Y** (yes) to the Ionic Pro SDK question
2. You will be asked if you want to link to an existing app or create a new one
    - Choose to **Create a new app on Ionic Pro**
3. You will be asked if you would like to use the GitHub integration or Ionic Pro
    - Choose **Ionic Pro**

Your application will have been generated and you should see the following instructions:

```bash
[INFO] Next Steps:
       
       - Go to your newly created project: cd ./ionic-weather
       - Get Ionic DevApp for easy device testing: https://bit.ly/ionic-dev-app
       - Finish setting up Ionic Pro Error Monitoring: 
       https://ionicframework.com/docs/pro/monitoring/#getting-started
       - Finally, push your code to Ionic Pro to perform real-time updates, and 
       more: git push ionic master
```

## Building and Running

Let's just make sure you can build your application:

1. `cd ionic-weather`
1. `ionic serve`

You should now see your application running in your default browser.

## Remote Repositories (Optional)

After the application has finished generating and you have verified your application will run, type the following command: `git remote -vv`. You should see something like this:

```bash
~/Projects/Training/ionic-weather (master): git remote -vv
ionic	git@git.ionicjs.com:kensodemannionic/ionic-weather.git (fetch)
ionic	git@git.ionicjs.com:kensodemannionic/ionic-weather.git (push)
```

This is the remote where you push changes that you want Ionic Pro to build and deploy. You should *not* use this as your main remote repository. 

> You should either use a cloud-based git service (such as GitHub or Bitbucket) or an in-house solution (such as Bitbucket Enterprise) for your main remote repository. 

For this course, let's use one of the public cloud-based services. I will use GitHub, but the process is similar for others.
  
1. Log on to <a href="https://github.com/" target="_blank">Github</a>
1. Click the "New" (+) button and select the **New repository** option
1. Give the repository a name like `ionic-weather`
1. Leave it as a Public repository
1. Click the **Create repository** button
1. Follow the instructions to "push an existing repository from the command line"
    - `git remote add origin git@github.com:kensodemann/ionic-weather.git`
    - `git push -u origin master`

Now `git remote -vv` will show two remote repositories:

```bash
~/Projects/Training/ionic-weather (master): git remote -vv
ionic	git@git.ionicjs.com:kensodemannionic/ionic-weather.git (fetch)
ionic	git@git.ionicjs.com:kensodemannionic/ionic-weather.git (push)
origin	git@git.github.com:kensodemannionic/ionic-weather.git (fetch)
origin	git@git.github.com:kensodemannionic/ionic-weather.git (push)
```

The `origin` (Github) remote is meant to be the source of truth for your project. This is where all developers will `pull` changes from and will `push` changes to.

The `ionic` remote is meant to be pushed to when an Ionic Pro Deploy or Package build is desired and will typically be pushed to by a smaller set of developers depending on how your project is managed.