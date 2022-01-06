# Lab: Mock Up the Interface

It is often desirable to lay out the user interface without worrying about how to get the data that will be displayed. This allows us to concentrate solely on how the application will look and feel in order to get that worked out early in the process.

In this lab, you will learn how to:

- Install assets that can be used by your application
- Model the data
- Mock up the user interface

## Install the Images

In an Angular application, any items installed under `src/assets` will automatically be copied by the build process such that they are available for our application to use. There are several images we would like to display for our teas, but these assets to do not exist yet. <a download href="/assets/packages/ionic-angular/img.zip">Download the images</a> and unpack the zip file under `src/assets`, creating an `img` folder with the images in them.

**Note:** the specifics on doing this depends on the type of machine you are using. On a Mac:

1. Drag and drop the `img.zip` from `Downloads` into `src/assets`
1. Double click the `img.zip` file in `src/assets`, which creates an `img` folder
1. Remove the `img.zip` file
1. Find the favicon.png file and move it into `src/assets/icon`

## Mock Up the Tea Display

Let's mock up how the Ionic components will be used in the tea page. This allows us to test out exactly what our data should look like and also allows us to concentrate on the styling without worrying about other moving parts. This is a common technique used when laying out the interface for an application.

### Tea Model

TypeScript gives us the ability to model the shape of our data and enforce consistent data models throughout our system. Create a model to define the data for a given tea.

- Create a `src/app/models` folder
- Add a `src/app/models/tea.ts` file

```TypeScript
export interface Tea {
  id: number;
  name: string;
  description: string;
  image: string;
}
```

### Path Mapping and Barrel Files

Before we get into the next section, let's make TypeScript module resolution a bit easier to deal with. If we don't do this, we could end up with a lot of code that looks like this:

```TypeScript
import { BarService } from '../../core/bar/bar.service';
import { FooService } from '../../core/foo/foo.service';
import { Tea } from '../../models/tea';
import { environment } from '../../../environments/environment';
```

The relative paths are obnoxious. They are also a maintenance headache as the application grows since you may need to adjust them as services and components are reorganized into different subdirectories over time. It would be better if our code could look like this:

```TypeScript
import { BarService, FooService } from '@app/core';
import { Tea } from '@app/models';
import { environment } from '@env/environment';
```

This can be achieved by creating TypeScript path mappings and by grouping like items into "barrel" files.

#### Barrel Files

We will group all of our models in a single `index.ts` file within the `models` folder.

**`src/app/models/index.ts`**

```TypeScript
export * from './tea';
```

The files are very redundant right now, but as the app grows this will keep our import statements from getting out of hand.

#### Path Mapping

Open the `tsconfig.json` file and add the following lines under the `baseUrl` setting:

```json
    "paths": {
      "@app/*": ["src/app/*"],
      "@env/*": ["src/environments/*"],
      "@test/*": ["test/*"]
    },
```

This tells TypeScript exactly which directory, relative to the `baseUrl`, to use when it finds one of the mappings in an `import` statement.

### The Tea Page

#### Replacing the Home Page

Our app currently has a page called `home`, but we want to display several types of teas on it. Let's replace that page so we can find it more easily as this application grows. This is a three part operation:

1. create the tea page
1. fix the routing
1. remove the home page (delayed for later)

##### Create the Tea Page

The Ionic CLI can be used to generate the new page for us. It will create all of the files we need as well as create a default route for the new page.

```bash
ionic generate page tea
```

##### Fix the Routing

We no longer need the "home" route, so remove it, leaving only the "tea" route. The root path redirect will also need to change. When you are done, the `src/app/app-routing.module.ts` file should look something like this:

```typescript
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'tea',
    pathMatch: 'full'
  },
  {
    path: 'tea',
    loadChildren: () => import('./tea/tea.module').then( m => m.TeaPageModule)
  },
];
...
```

#### Mock the Data

We do not have a connection to a back end service to get any data for our application. So for now we will just add some data directly to our page so we have something to work with. Just copy-paste the following into your `TeaPage` class.

```TypeScript
  teaData: Array<Tea> = [
    {
      id: 1,
      name: 'Green',
      image: 'assets/img/green.jpg',
      description:
        'Green teas have the oxidation process stopped very early on, leaving them with a very subtle flavor and ' +
        'complex undertones. These teas should be steeped at lower temperatures for shorter periods of time.'
    },
    {
      id: 2,
      name: 'Black',
      image: 'assets/img/black.jpg',
      description:
        'A fully oxidized tea, black teas have a dark color and a full robust and pronounced flavor. Black teas tend ' +
        'to have a higher caffeine content than other teas.'
    },
    {
      id: 3,
      name: 'Herbal',
      image: 'assets/img/herbal.jpg',
      description:
        'Herbal infusions are not actually "tea" but are more accurately characterized as infused beverages ' +
        'consisting of various dried herbs, spices, and fruits.'
    },
    {
      id: 4,
      name: 'Oolong',
      image: 'assets/img/oolong.jpg',
      description:
        'Oolong teas are partially oxidized, giving them a flavor that is not as robust as black teas but also ' +
        'not as subtle as green teas. Oolong teas often have a flowery fragrance.'
    },
    {
      id: 5,
      name: 'Dark',
      image: 'assets/img/dark.jpg',
      description:
        'From the Hunan and Sichuan provinces of China, dark teas are flavorful aged pro-biotic teas that steeps ' +
        'up very smooth with slightly sweet notes.'
    },
    {
      id: 6,
      name: 'Puer',
      image: 'assets/img/puer.jpg',
      description:
        'An aged black tea from china. Puer teas have a strong rich flavor that could be described as "woody" or "peaty."'
    },
    {
      id: 7,
      name: 'White',
      image: 'assets/img/white.jpg',
      description:
        'White tea is produced using very young shoots with no oxidation process. White tea has an extremely ' +
        'delicate flavor that is sweet and fragrent. White tea should be steeped at lower temperatures for ' +
        'short periods of time.'
    },
  ];
```

You will also need to import the `Tea` model that we created:

```typescript
import { Tea } from '@app/models';
```

**Note:** If we were further along, we probably would have created a thing called a "service" and had it return fake data using the same sort of interface it would use to return real data, but we haven't talked about services yet in this training.

#### Create a List of Cards

Now that we have a list of teas, we need to figure out how to display this information. One component that seems natural is to use a <a href="https://ionicframework.com/docs/api/card" target="_blank">card</a> to display each tea in the list. Let's see how that looks.

Before doing this, use your browser's dev-tools to emulate an iPhone.

In `src/app/tea/tea.page.html` place the following inside of the `ion-content`:

```html
<ion-list>
  <ion-item *ngFor="let tea of teaData">
    <ion-card>
      <ion-img [src]="tea.image"></ion-img>
      <ion-card-header>
        <ion-card-title>{{tea.name}}</ion-card-title>
      </ion-card-header>
      <ion-card-content>{{tea.description}}</ion-card-content>
    </ion-card>
  </ion-item>
</ion-list>
```

This creates a list of cards. Angular's `ngFor` structural directive is used to render the sample template for each item in the `teaData` collection. That looks pretty good, at least when viewed at a phone resolution, but what about other form factors? Those do not look quite as nice. We will fix that shortly, but first go back to an iPhone form factor.

If you look closely, though, we lost the "Large Title" scrolling effect we had on the "Home" page. Have a look at the HTML for the "Home" page. There are a few key items we need to bring over:

- the `[translucent]="true"` property binding in the `ion-header`
- the `[fullscreen]="true"` property binding in the `ion-content`
- the second `ion-header` embedded in the `ion-content`

Copy all of that over to the tea page, and change the titles as needed. When you are done, your markup should look something like this:

```html
<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-title>Teas</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true">
  <ion-header collapse="condense">
    <ion-toolbar>
      <ion-title size="large">Teas</ion-title>
    </ion-toolbar>
  </ion-header>
  ...
</ion-content>
```

Now the "Large Title" scrolling effect for iOS should have returned. Give it a try. Note that if you switch to an Android device and reload so you are using Material Design styling that you no longer have the effect. That is because this is not part of the Material Design specification. This is an example of the adaptive styling that you can have for each platform with the Ionic UI Framework. The app adapts and looks correct on each platform.

Let's also copy over a slightly modified version of the test for the title:

```TypeScript
...
import { By } from '@angular/platform-browser';
...
  it('has the proper title', () => {
    const titles = fixture.debugElement.queryAll(By.css('ion-title'));
    expect(titles.length).toBe(2);
    expect(titles[0].nativeElement.textContent.trim()).toBe('Teas');
    expect(titles[1].nativeElement.textContent.trim()).toBe('Teas');
  });
```

## Make a Responsive Grid

Our app looks good when viewed at a phone resolution, but if we modify Chrome to emulate some other form factor such as an iPad or iPad Pro, then it looks a little weird. The Cards are huge. It would be better if we could:

1. Show a single list on a phone.
1. Show two columns of tea cards side by side on an iPad.
1. Expand the columns to four on even wider screens, such as an iPad in landscape mode or our desktop.

Enter the <a href="https://ionicframework.com/docs/layout/grid" target="_blank">responsive grid</a>. By default, the responsive grid shows rows of 12 columns each. However, we want to show at most four columns per row. Luckily, there are some simple mechanisms in place that will allow us to do that, but first let's massage our data a little.

We currently have a list of X number of teas (currently 7, but once we start getting data from a backend service it could really be any number). Let's begin by breaking that up into a matrix with a maximum of 4 teas in each row. That means we will have two rows, the first with four columns and the second with three.

First let's set up the test data in `src/app/tea/tea.page.spec.ts`:

```TypeScript
...
import { Tea } from '@app/models';

describe('TeaPage', () => {
  let component: TeaPage;
  let fixture: ComponentFixture<TeaPage>;
  let teas: Array<Tea>;

  beforeEach(
    waitForAsync(() => {
      initializeTestData();
      ...
  });
  ...
  const initializeTestData = () => {
    teas = [
      // Remember those tea records we hard coded into the page?
      // Copy those records here and assign them to the "teas" array.
    ];
  }
});
```

**Note:** The duplication of the data is annoying, but it is short-term. In the future, we will get the data from or backend, but we will still need the data in the test to feed our mock.

There are two ways that we could go with the test for this:

1. Figure out what the class needs to do to the data to produce a matrix of teas for the grid and test that.
1. Test that the component renders the grid properly.

The first set of tests would be testing an implementation detail, and therefor is not ideal. The second test more accurately reflects the requirement for the page from the user's perspective, and that is what is important. As such, we will write the test from that perspective. This also has the advantage of being a more robust test since the implementation details may change but the requirements for what we display to the user will likely stay the same.

```TypeScript
...
import { DebugElement } from '@angular/core';
...
  describe('a grid of seven teas', () => {
    let grid: DebugElement;
    beforeEach(() => {
      grid = fixture.debugElement.query(By.css('ion-grid'));
    });

    it('contains two rows', () => {
      const rows = grid.queryAll(By.css('ion-row'));
      expect(rows.length).toBe(2);
    });

    it('has four columns in the first row', () => {
      const rows = grid.queryAll(By.css('ion-row'));
      const cols = rows[0].queryAll(By.css('ion-col'));
      expect(cols.length).toBe(4);
    });

    it('has three columns in the second row', () => {
      const rows = grid.queryAll(By.css('ion-row'));
      const cols = rows[1].queryAll(By.css('ion-col'));
      expect(cols.length).toBe(3);
    });

    it('binds the card title to the tea name', () => {
      const cols = grid.queryAll(By.css('ion-col'));
      expect(cols.length).toBe(7);
      cols.forEach((col, idx) => {
        const title = col.query(By.css('ion-card-title'));
        expect(title.nativeElement.textContent.trim()).toBe(teas[idx].name);
      });
    });

    it('binds the card content to the tea description', () => {
      const cols = grid.queryAll(By.css('ion-col'));
      expect(cols.length).toBe(7);
      cols.forEach((col, idx) => {
        const title = col.query(By.css('ion-card-content'));
        expect(title.nativeElement.textContent.trim()).toBe(teas[idx].description);
      });
    });
  });
```

Turning our attention away from the test and back to the code, we can modify the page class by adding a "getter" that transforms our tea list into a matrix:

```TypeScript
  get teaMatrix(): Array<Array<Tea>> {
    return this.toMatrix(this.teaData);
  }

...

  private toMatrix(tea: Array<Tea>): Array<Array<Tea>> {
    const matrix: Array<Array<Tea>> = [];
    let row = [];
    tea.forEach(t => {
      row.push(t);
      if (row.length === 4) {
        matrix.push(row);
        row = [];
      }
    });

    if (row.length) {
      matrix.push(row);
    }

    return matrix;
  }
```

Now that we have our matrix, let's create the grid in our page's HTML template file. **Set up Chrome to emulate an iPad Pro in landscape**. We know we want four columns on a wide screen like this, and that the grid by default supports 12 columns. That means that for a wide screen such as this, each column should take up three place. So let's lay that out in the markup. Replace the list in `src/app/tea/tea.page.html` with this:

```html
<ion-grid>
  <ion-row *ngFor="let teaRow of teaMatrix" class="ion-align-items-stretch">
    <ion-col *ngFor="let tea of teaRow" size="3">
      <ion-card>
        <ion-img [src]="tea.image"></ion-img>
        <ion-card-header>
          <ion-card-title>{{tea.name}}</ion-card-title>
        </ion-card-header>
        <ion-card-content> {{tea.description}} </ion-card-content>
      </ion-card>
    </ion-col>
  </ion-row>
</ion-grid>
```

This loops through the rows and for each row displays a column for each tea in that row. That looks great on a iPad Pro, though the cards are all different sizes and look a little crowded. We can fix that with some simple CSS in `app/src/tea/tea.page.scss`:

```scss
ion-card {
  height: 100%;
}

ion-col {
  margin-bottom: 1em;
}
```

Now each card takes up its full cell height, and there is some margin between the rows. Nice!

But there is one last thing. This will always display four columns, which will look very squished on a phone. The grid provides breakpoints that allow us to set the column sizes based on the size of the screen. Let's do the following:

- smaller devices: column size 12 -> each column takes up the whole "row"
- large devices: column size 6 -> each column takes up half of the "row" (2 columns per "row")
- extra large devices: column size 3 -> each column takes up a quarter of the "row" (4 columns per "row")

Change the `ion-col` properties as such:

```html
<ion-col *ngFor="let tea of teaRow" size="12" size-md="6" size-xl="3"> ... </ion-col>
```

Now as you change the type of device that is being emulated, the layout adapts accordingly.

## Final Cleanup - Remove the Home Page

We no longer have any routes pointing to the home page. We should get rid of it.

```bash
$ rm -rf src/app/home
```

Or "right-click | Delete" from your IDE if you are using the Windows Command Prompt and not a unix-style shell.

## Conclusion

In this lab you learned how to mock up the UI to ensure it looks the way you want it to look. Give it a try emulating various form factors and make sure it looks right. Then turn off the device emulation and see how it will look and behave in a desktop browser. Nice!!

Make sure you have a look at your app in both light and dark mode.

Next we will look at getting an authentication workflow in place so we can connect to our backend service and start using real data.
