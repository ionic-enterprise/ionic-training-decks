# Lab: Mock Up the Interface

It is often desirable to lay out the user interface without worrying about how to get the data that will be displayed. This allows us to concentrate solely on how the application will look at feel, and to get that worked out early in the process.

In this lab, you will learn how to:

- Install assets that can be used by your application
- Model the data
- Mock up the user interface

## Install the Images

The service we just created references several image assets, but these assets to do not exist yet. <a download href="/assets/images/images.zip">Download the images</a> and unpack the zip file under `src/assets`, creating an `images` folder with the images in them.

**Note:** the specifics on doing this depends on the type of machine you are using. On a Mac:

1. Drag and drop the `images.zip` from `Downloads` into `src/assets`
1. Double click the `images.zip` file in `src/assets`, which creates an `images` folder
1. Remove the `images.zip` file
1. Find the favicon.png file and move it into `src/assets/icon`

## Mock Up the Tea Display 

Let's mock up how the components will be used in each page. This allows us to test out exactly what our data should look like and also allows us to concentrate on the styling without worrying about other moving parts. This is a common technique used when laying out the interface for an application.

### Tea Model

Create a model to define the data for a given tea. Create a `src/app/models` folder with a `src/app/models/tea.ts` file.

```TypeScript
export interface Weather {
  id: number;
  name: string;
  description: string;
  image: string;
}
```

### Path Mapping and Barrel Files

Before we get into the next section, let's make TypeScript module resolution a bit easier to deal with. If we don't do this, we could end up with a lot of code that looks like this:

```TypeScript
import { BarService } from '../../services/bar/bar.service';
import { FooService } from '../../services/foo/foo.service';
import { Tea } from '../../models/tea';
import { environment } from '../../../environments/environment';
```

The relative paths are obnoxious. They are also a maintenance headache as the application grows since you may need to adjust them as services and components are reorganized into different subdirectories over time. It would be better if our code could look like this:

```TypeScript
import { BarService, FooService } from '@app/services';
import { Tea } from '@app/models';
import { environment } from '@env/environment';
```

This can be achieved by creating TypeScript path mappings and by grouping like items into "barrel" files.

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

#### Barrel Files

We will group all of our models in a single `index.ts` file within the `models` folder.

**`src/app/models/index.ts`**

```TypeScript
export * from './tea';
```

The files are very redundant right now, but as the app grows this will keep our import statements from getting out of hand.

### The Tea Page

#### Rename the Home Page

Our app currently has a page called `home`, but we want to display several types of teas on it. Let's rename that page so we can find it more easily as this application grows. This is a two part operation:

1. move the files
1. rename the objects

##### Move the Files

```bash
$ mv src/app/home src/app/tea
$ mv src/app/tea/home.page.ts src/app/tea/tea.page.ts
$ etc...
```

##### Rename the Objects

All of the TypeScript files in `src/app/tea` contain path references to the old `home` files. They also contain object names such as `HomePage`, `HomePageModule`, and `HomePageRoutingModule`. Fix the file path references and change the objects names to be `TeaPage`, `TeaPageModule`, and `TeaPageRoutingModule`.

As an example, here is what the `src/app/tea/tea.page.ts` file should look like when you are done:

```TypeScript
import { Component } from '@angular/core';

@Component({
  selector: 'app-tea',
  templateUrl: 'tea.page.html',
  styleUrls: ['tea.page.scss']
})
export class TeaPage {
  constructor() {}
}
```

Finally, change the main routing module to have a `tea` route instead of a `home` route.

```typescript
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'tea',
    loadChildren: () => import('./tea/tea.module').then( m => m.TeaPageModule)
  },
  {
    path: '',
    redirectTo: 'tea',
    pathMatch: 'full'
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
        'A fully oxidized tea, black teas have a dark color and a full robust and pronounced flavor. Blad teas tend ' +
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
        'not as suble as green teas. Oolong teas often have a flowery fragrance.'
    },
    {
      id: 5,
      name: 'Dark',
      image: 'assets/img/dark.jpg',
      description:
        'From the Hunan and Sichuan provinces of China, dark teas are flavorful aged probiotic teas that steeps ' +
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
    {
      id: 8,
      name: 'Yellow',
      image: 'assets/img/yellow.jpg',
      description:
        'A rare tea from China, yellow tea goes through a similar shortened oxidation process like green teas. ' +
        'Yellow teas, however, do not have the grassy flavor that green teas tend to have. The leaves often ' +
        'resemble the shoots of white teas, but are slightly oxidized.'
    }
  ];
```

**Note:** If we were further along, we probably would have created a thing called a "service" and had it return fake data using the same sort of interface it would use to return real data, but we haven't talked about services yet in this class.

#### Create a List of Cards

Now that we have a list of teas, we need to figure out how to display this information. One component that seems natural is to use a <a href="https://ionicframework.com/docs/api/card" target="_blank">card</a> to display each tea in the list. Let's see how that looks.

Add the folllowing mark-up to the `ion-content` section of `src/app/tea/tea.page.html`:

```html
 16   <ion-list>
 17     <ion-item *ngFor="let tea of teaData">
 18       <ion-card>
 19         <ion-img [src]="tea.image"></ion-img>
 20         <ion-card-header>
 21           <ion-card-title>{{tea.name}}</ion-card-title>
 22         </ion-card-header>
 23         <ion-card-content>
 24           {{tea.description}}
 25         </ion-card-content>
 26       </ion-card>
 27     </ion-item>
 28   </ion-list>
```

This creates a list of cards. Angular's `ngFor` structural directive to render the sample template for each item in the `teaData` collection. That looks pretty good, at least when viewed at a phone resolution.

## Make a Responsive Grid

Our app looks good when viewed at a phone resolution, but if we modify Chrome to emulate some other form factor such as an iPad or iPad Pro, then it looks a little weird. The Cards are huge. It would be better if we could:

1. show a single list on a phone
1. show two columns of tea cards side by side on an iPad
1. expand the columns to four on even wider screens, such as an iPad in landscape mode or our desktop

Enter the <a href="https://ionicframework.com/docs/layout/grid" target="_blank">responsive grid</a>. By default, the resonsive grid shows rows of 12 columns each. However, we want to show at most rows of four columns. Luckily, there are some simple mechanisms in place that will allow us to do that, but first let's message our data a little.

We currently have a list of X number of teas (currently 8, but once we start getting data from a backend service it could really be any number). Let's begin by breaking that up into a matrix with 4 teas in each row.

First create a test for this in `src/app/tea/tea.page.spec.ts`:

```TypeScript
  describe('initializetion', () => {
    it('makes a tea matrix', () => {
      expect(component.teaMatrix).toEqual([
        [
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
              'A fully oxidized tea, black teas have a dark color and a full robust and pronounced flavor. Blad teas tend ' +
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
              'not as suble as green teas. Oolong teas often have a flowery fragrance.'
          }
        ], [
          {
            id: 5,
            name: 'Dark',
            image: 'assets/img/dark.jpg',
            description:
              'From the Hunan and Sichuan provinces of China, dark teas are flavorful aged probiotic teas that steeps ' +
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
          {
            id: 8,
            name: 'Yellow',
            image: 'assets/img/yellow.jpg',
            description:
              'A rare tea from China, yellow tea goes through a similar shortened oxidation process like green teas. ' +
              'Yellow teas, however, do not have the grassy flavor that green teas tend to have. The leaves often ' +
              'resemble the shoots of white teas, but are slightly oxidized.'
          }
        ]
      ]);
    });
  });
```

This test shows the single array being expanded into an array of two child arrays, each of which are four teas long. Let's create the code to do that in `src/app/tea/tea.page.ts`:

```TypeScript
  teaMatrix: Array<Array<Tea>> = [];

  constructor() {
    this.listToMatrix();
  }

  private listToMatrix() {
    let row = [];
    this.teaData.forEach(t => {
      row.push(t);
      if (row.length === 4) {
        this.teaMatrix.push(row);
        row = [];
      }
    });

    if (row.length) {
      this.teaMatrix.push(row);
    }
  }
```

**Note:** this is quick and dirty. It also does not belong here. It belongs in a reusable service. But we have not learned about that yet. We can refactor later.

Now that we have our matrix, let's create the grid. Let's set up Chrome to emulate an iPad Pro in landscape. We know we want four columns on a wide screen like this, and that the grid by default supports 12 columns. That means that for a wide screen such as this, each column should take up three place. So let's lay that out in the markup.  Replace the list in `src/app/tea/tea.page.html` with this:

```html
  <ion-grid>
    <ion-row *ngFor="let teaRow of teaMatrix" class="ion-justify-content-center ion-align-items-stretch">
      <ion-col *ngFor="let tea of teaRow" size="3">
        <ion-card>
          <ion-img [src]="tea.image"></ion-img>
          <ion-card-header>
            <ion-card-title>{{tea.name}}</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            {{tea.description}}
          </ion-card-content>
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
      <ion-col *ngFor="let tea of teaRow" size="12" size-md="6" size-xl="3">
```

Now as you change the type of device that is being emulated, the layout adapts accordingly.

## Conclusion

In this lab you learned how to mock up the UI to ensure it looks the way you want it to look. Make sure you have a look at your app in both light and dark mode. Next we will look at how to get real data.

