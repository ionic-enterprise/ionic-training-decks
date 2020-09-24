# Lab: Mock Up the Interface

In this lab, you will learn how to:

- Model data using TypeScript interfaces
- Mock up a user interface using the Ionic Framework
- Leverage responsive design to design for multiple form factors

## Overview

Let's mock up how components will be used in each page. This allows us to test out exactly how our data should look like and also allows us to concentrate on styling without worrying about other moving parts. This is a common technique used when laying out user interfaces for an application.

## Mock Up the Tea Display

### Tea Model

Make a new folder named `models` inside the `src` directory of the project. This folder will contain models that represent the shape of the data we want displayed in our application.

Inside the new folder, we'll create a new file `Tea.ts` for our tea model:

```TypeScript
export interface Tea {
  id: number;
  name: string;
  description: string;
  image: string;
}
```

#### Barrel Files

Before we move on, let's make TypeScript module importing a bit easier to deal with. Have you ever worked on a project where files have a bunch of imports that look like this?

```TypeScript
import { Bar } from '../core/bar/Bar';
import { Foo } from '../core/foo/Foo';
import { Baz } from '../models/Baz';
```

The amount of import statements are obnoxious. They're also a maintenance headache as the application scales, since you may need to add additional imports. Wouldn't it be nice if we could import multiple modules on a single line like this?

```TypeScript
import { Bar, Foo } from '../core';
import { Baz } from '../models';
```

This can be achieved by grouping like-items into "barrel" files. Let's group all of our models in a single `index.ts` file within the `models` folder.

**`src/models/index.ts`**

```TypeScript
export * from './Tea';
```

The files in our `models` folder are pretty redundant at this moment, but as the application grows this will help keep our import statements from getting out of hand.
index.

### The Tea Page

#### Rename the Home Page

Our app currently has a page called `Home`, but we want to display several types of teas on it. Let's rename that page so we can find it more easily as our application grows. This is a two part operation:

1. Move the files
2. Rename the objects

#### Move the Files

First, remove any snaphots if you have them stored under the `pages` directory. We'll regenerate them. Next, we'll move and rename our `pages` folder and it's contents:

```bash
$ mv src/pages src/tea
$ mv src/tea/Home.tsx src/tea/TeaList.tsx
$ mv src/tea/Home.css src/tea/TeaList.css
$ mv src/tea/Home.test.tsx src/tea/TeaList.test.tsx
```

Note that you don't _have_ to do this from a terminal instance; it's used here as a visual guide.

#### Rename the Objects

The TypeScript files in `src/tea` contain path references to the old `home` files, and our component is named `<Home />`. Change the component's name to `<TeaList />` and update the reference in the test file.

As an example, here is what `src/tea/TeaList.tsx` should look like when you are done:

```TypeScript
import { ... } from '@ionic/react';
import React from 'react';
import ExploreContainer from '../components/ExploreContainer';
import './TeaList.css';

const TeaList: React.FC = () => {
  return (
    ...
  );
}

export default TeaList;
```

Update `App.tsx` to replace references to our old `<Home />` component and update the routing to have a `tea` route instead of a `home` route:

```TypeScript
...
import { TeaList } from './tea/TeaList';
...
const App: React.FC = () => {
  useEffect(() => {
    ...
  });

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/tea" component={TeaList} exact={true} />
          <Route exact path="/" render={() => <Redirect to="/tea" />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
```

Finally, change the header text in `<TeaList />` to "Tea" and update the `displays the header` test in `TeaList.test.tsx`.

Run your tests again to validate that we didn't break any tests during this process. Additionally a new snapshot will be captured for our `<TeaList />` component.

#### Add Image Assets

We'll want to display images for our tea categories. Go ahead and <a href="/assets/images/images.zip">download the images</a> and unpack the contents into `/src/assets/images`, creating the subfolders along the way.

Create React App encourages to `import` assets such as CSS files and images into the TypeScript files that use them instead of adding them directly to the `public` folder. We've seen this before, as both `App.tsx` and `TeaList.tsx` have import statements for CSS files.

This mechanism provides the following benefits:

- Assets are minified and bundled together, avoiding additonal network requests
- Missing files cause compliation errors instead of 404s
- Bundled files contain content hashes to avoid stale cache

It's a mental paradigm shift that gets some getting used to. We'll see some examples of how to use the `require` keyword to import these image paths within our mock data, keeping our `import` block clean.

#### Mock the Data

We don't have a connection to a back end service to get any data for our application, so for now we will just add some data directly to our page to have something to work with. Copy and paste the following constant into the before we declare the `<TeaList />` component:

```TypeScript
export const teaData: Array<Tea> = [
  {
    id: 1,
    name: 'Green',
    image: require('../assets/images/green.jpg'),
    description:
      'Green teas have the oxidation process stopped very early on, leaving them with a very subtle flavor and ' +
      'complex undertones. These teas should be steeped at lower temperatures for shorter periods of time.',
  },
  {
    id: 2,
    name: 'Black',
    image: require('../assets/images/black.jpg'),
    description:
      'A fully oxidized tea, black teas have a dark color and a full robust and pronounced flavor. Black teas tend ' +
      'to have a higher caffeine content than other teas.',
  },
  {
    id: 3,
    name: 'Herbal',
    image: require('../assets/images/herbal.jpg'),
    description:
      'Herbal infusions are not actually "tea" but are more accurately characterized as infused beverages ' +
      'consisting of various dried herbs, spices, and fruits.',
  },
  {
    id: 4,
    name: 'Oolong',
    image: require('../assets/images/oolong.jpg'),
    description:
      'Oolong teas are partially oxidized, giving them a flavor that is not as robust as black teas but also ' +
      'not as suble as green teas. Oolong teas often have a flowery fragrance.',
  },
  {
    id: 5,
    name: 'Dark',
    image: require('../assets/images/dark.jpg'),
    description:
      'From the Hunan and Sichuan provinces of China, dark teas are flavorful aged probiotic teas that steeps ' +
      'up very smooth with slightly sweet notes.',
  },
  {
    id: 6,
    name: 'Puer',
    image: require('../assets/images/puer.jpg'),
    description:
      'An aged black tea from china. Puer teas have a strong rich flavor that could be described as "woody" or "peaty."',
  },
  {
    id: 7,
    name: 'White',
    image: require('../assets/images/white.jpg'),
    description:
      'White tea is produced using very young shoots with no oxidation process. White tea has an extremely ' +
      'delicate flavor that is sweet and fragrent. White tea should be steeped at lower temperatures for ' +
      'short periods of time.',
  },
  {
    id: 8,
    name: 'Yellow',
    image: require('../assets/images/yellow.jpg'),
    description:
      'A rare tea from China, yellow tea goes through a similar shortened oxidation process like green teas. ' +
      'Yellow teas, however, do not have the grassy flavor that green teas tend to have. The leaves often ' +
      'resemble the shoots of white teas, but are slightly oxidized.',
  },
];

const TeaList: React.FC = () => {
  ...
}

export default TeaList;
```

We haven't imported the `Tea` model into our file yet so your IDE may be showing some kind of visual cue. Let's go ahead and import it using the barrel file we created:

```TypeScript
import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { Tea } from '../models';
import ExploreContainer from '../components/ExploreContainer';

import './TeaList.css';
```

**Note:** If we were futher along, we probably would have created a separate file - perhaps a hook or a singleton - and have it return our fake data. We haven't talked about those concepts in this training yet; we'll use the quick-and-dirty method, a concept everyone is familiar with, and clean this up later.

#### Create a List of Cards

Now that we have our list of teas, we need to figure out the best way to visually showcase the data. Each item contains a title, an image, and a description -- those data-points work well with cards. Luckily for us, the Ionic Framework contains a <a href="https://ionicframework.com/docs/api/card" target="_blank">card component</a>: `<IonCard />`.

Let's see how that looks. Replace the line containing `<ExploreContainer />` with the following code:

```TypeScript
<IonList>
  {teaData.map(tea => (
    <IonItem key={tea.id} lines="none">
      <IonCard>
        <IonImg src={tea.image} />
        <IonCardHeader>
          <IonCardTitle>{tea.name}</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>{tea.description}</IonCardContent>
      </IonCard>
    </IonItem>
  ))}
</IonList>
```

That looks pretty good, at least when viewed at a phone resolution...

## Make a Responsive Grid

Our application looks good when viewed on a phone resolution but if we modify our browser to emulate some other form factor such as an iPad or iPad Pro the cards are huge; each item gets way too much real estate. It would look much nicer if we could:

1. Show a single list on a phone
2. Show two columns of cards side-by-side on an iPad
3. Show four columns on even wider screen, such as an iPad in landscape mode or a desktop

Enter the <a href="" target="_blank">responsive grid</a>! By default, the responsive grid shows rows of 12 columns each. However, we only want to show at most rows of 4 columns. Luckily there are some simple mechanisms in place that will allow us to do that, but first we should massage our data a bit.

We have a list of X number of teas (currently 8, but once we start fetching data from a backend service it could be any number); let's break that up into a matrix with 4 teas in each row.

### Test First

Create a test that for this in `TeaList.test.tsx`:

```TypeScript
describe('initialization', () => {
  it('makes a tea matrix', () => {
    const teaMatrix = [
      [teaData[0], teaData[1], teaData[2], teaData[3]],
      [teaData[4], teaData[5], teaData[6], teaData[7]],
    ];
    expect(undefined).toEqual(teaMatrix);
  });
});
```

This test will intentionally fail. It's a good way to let us know we need to implement functionality to generate a 4 column matrix.

### Then Code

We'll export a function called `listToMatrix()` in `TeaList.tsx`:

```TypeScript
export const listToMatrix = (): Array<Array<Tea>> => {
  let teaMatrix: Array<Array<Tea>> = [];

  let row: Array<Tea> = [];
  teaData.forEach(tea => {
    row.push(tea);
    if (row.length === 4) {
      teaMatrix.push(row);
      row = [];
    }
  });

  if (row.length) teaMatrix.push(row);

  return teaMatrix;
};
```

Like our mock data this piece of logic doesn't belong here, but we can refactor later on. Go ahead and update the unit test so it passes.

Now that we can generate our matrix, let's create the grid. Set up Chrome to emulate an iPad Pro in landscape mode. We know we want 4 columns on a wide screen like this, and we know that the grid by default supports 12 columns. That means for a wide screen like this each column should take up 3 columns.

Replace the existing `<IonList />` with the following code:

```TypeScript React
<IonGrid className="tea-grid">
  {listToMatrix().map((row, idx) => (
    <IonRow
      key={idx}
      className="ion-justify-content-center ion-align-items-stretch">
      {row.map(tea => (
        <IonCol size="3" key={tea.id}>
          <IonCard>
            <IonImg src={tea.image} />
            <IonCardHeader>
              <IonCardTitle>{tea.name}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>{tea.description}</IonCardContent>
          </IonCard>
        </IonCol>
      ))}
    </IonRow>
  ))}
</IonGrid>
```

This code loops through the rows of the matrix and displays a column for each tea in that row. That looks great on an iPad Pro, although the cards are all different sizes and the rows are a bit crowded. Let's fix that with some simple CSS in `TeaList.css`:

```CSS
ion-card {
  height: 100%;
}

ion-col {
  margin-bottom: 1em;
}
```

Now each card takes up the same cell height and we have some margin between the rows. Nice!

There is one last thing: our layout will always display four columns which will look very squished on a phone. The grid provides breakpoints that allow us to set the column sizes based on the size of the viewport. Let's do the following:

- Smaller Devices: column size 12 => each column will take up an entire "row"
- Large Devices: column size 6 => each column will take up half of the "row" (2 columns per "row")
- Extra Large Devices: column size 3 => each column will take up a quarter of the "row" (4 columns per "row")

Change the `IonCol` properties like so:

```TypeScript
<IonCol size="12" sizeMd="6" sizeXl="3" key={tea.id}>
```

Now as you change the type of device that is being emulated on Chrome the layout adapts accordingly.

## Cleanup

We have no further use of the `<ExploreContainer />` component that was generated when we generated our project using `ionic start`. Let's remove the statement importing it in `TeaList.tsx` and delete the `components` folder.

Additionally, don't forget to update your component's snapshot!

## Conclusion

We have learned how to mock up an interface and make our design responsive. Make sure you have a look at your app in both light and dark mode. Next we will add a login page to our application.
