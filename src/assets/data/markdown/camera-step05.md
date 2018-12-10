# Lab: Take a Picture

In this lab, you will:

* add a button to the page
* handle the click event
* use the camera to take a picture

## Add a Button

*Note:* This step demonstrates how to add a button to the page using Ionic Studio. If you do not have Ionic Studio or would rather use an editor like VS Code you can still perform this step but will need to edit the HTML directly.

1. in Ionic Studio, select "Design" mode and make sure the "Home" page is selected
1. drag a "Fab" component onto the "Content" area of the page
1. make sure the "Fab" is selected in the compnent tree for the Home page then set the following properties on the right:
   1. Horizontal: center
   1. Vertical: bottom
1. expand the "Fab" in the component tree until you find the Icon for it (it should go Fab > Fab Button > Icon)
1. chage the Icon Name to "camera"
1. select the Text and Paragraph items that are in the tree and delete them

The markup generated for the page should now look something like this:

```HTML
<ion-header>
  <ion-toolbar>
    <ion-title>
      Ionic Blank
    </ion-title>
  </ion-toolbar>
</ion-header>

<ion-content padding>
  <ion-fab slot horizontal="center" vertical="bottom">
    <ion-fab-button>
      <ion-icon name="camera"></ion-icon>
    </ion-fab-button>
  </ion-fab>
</ion-content>
```

Verify this by switching back to the "Code" view.

## Handle the Click Event

When the button is clicked the application should perform an action. In order to facilitate that, a click event handler must be added to the button.

1. in Ionic Studio, select "Design" mode and make sure the "Home" page is selected
1. select the Fab in the component tree for the page
1. on the right, select the On Click dropdown then choose "Add New..."
1. type "takePicture" in the "Method name" prompt at the bottom of Ionic Studio

In "Code" view, notice that a click event has been added: ` <ion-fab slot horizontal="center" vertical="bottom" (click)="takePicture()">`

Open the `home.page.ts` file. As of the time of this writing, Ionic Studio does not add a stub for the method, so we will crate one ourself as such:

```TypeScript
  takePicture() {
    console.log('take my picture!!');
  }
```

## Use the Camera API

Capacitor has a camera API that we can use to take the picture.
