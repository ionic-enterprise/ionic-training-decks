# Lab: Mock Up the Interface

In this lab, you will learn how to:

- Model data using TypeScript interfaces
- Mock up a user interface using the Ionic Framework
- Install assets that can be used by your application
- Leverage responsive design to design for multiple form factors

## Overview

It is often desirable to lay out the user interface without worrying about how to get the data to be displayed. This allows us to concentrate solely on how the application will look and feel in order to get that worked out early in the process.

## Install the Images

We'll want to display images for the tea data we will be mocking up, but these assets do not exist yet. <a href="/assets/packages/ionic-react/img.zip">Download the images</a> and unpack the zip file. Follow these steps to place them in the correct locations:

1. Create a folder `src/assets`
2. Within `src/assets` create two sub folders, `images` and `icon`
3. Move all files with the `.jpg` extension into `src/assets/images`
4. Move `favicon.png` into `src/assets/icon`

## Feature Folders

One way to organize project files is to create folders by feature, opposed to file "type". A feature folder structure is easier to maintain over the lifetime of an application as new requirements and features are scheduled to be added. This training will utilize a feature folder approach.

In addition to folders by feature, it's typical to have folders for `core` and `shared` functionality: bits of code that are used across features. Create the following folders:

- `src/core`
- `src/shared`

## Mock Up the Tea Display

Let's mock how components will be used in our page. This allows us to test our exactly what our data should look like and also allows us to concentrate on the styling without worrying about other moving parts. This is a common technique used when laying out the interface for an application.

### Tea Model

Create a data model to define the data for a given tea.

- Create a `src/shared/models` folder
- Add a `src/shared/models/Tea.ts` file

**`src/shared/models/Tea.ts`**

```TypeScript
export interface Tea {
  id: number;
  name: string;
  description: string;
  image: string;
}
```

### Barrel Files

Before moving onto the next section let's make TypeScript module importing a bit easier to deal with. Have you ever worked on a project where files have a bunch of imports that look like this?

```TypeScript
import { Bar } from '../core/bar/Bar';
import { Foo } from '../core/foo/Foo';
import { Baz } from '../models/Baz';
```

The amount of import statements are obnoxious. They are also a maintenance headache as the application grows. Wouldn't it be nice if we could import multiple modules on a single line like this?

```TypeScript
import { Bar, Foo } from '../core';
import { Baz } from '../shared/models';
```

This can be achieved by grouping like items into "barrel" files. Let's group all our of models into a single `index.ts` file within the `models` folder:

**`src/shared/models/index.ts`**

```TypeScript
export * from './Tea';
```

### The Tea Page

#### Rename the Home Page

Our app currently has a page called `Home`, but we want to display several types of teas on it. Let's rename that page so we can find it more easily as our application grows. This is a two part operation:

1. Move the files
2. Rename the objects

##### Move the Files

```bash
$ git mv src/pages src/tea
$ git mv src/tea/Home.tsx src/tea/TeaPage.tsx
$ git mv src/tea/Home.css src/tea/TeaPage.css
$ git mv src/tea/Home.test.tsx src/tea/TeaPage.test.tsx
$ git mv src/tea/__snapshots__/Home.test.tsx.snap src/tea/__snapshots__/TeaPage.test.tsx.snap
```

Using `git mv` to move the file ensures they are tracked properly in `git`. You could also do the renaming via your IDE; do whatever works best for you.

##### Rename the Objects

All of the TypeScript files in `src/tea` contain path references to the old `home` files. They also contain object names such as `Home`. Fix the file path references and change the object names to be `TeaPage`.

Then, update `App.tsx` to replace references to the old home page and update the routing to have a `tea` route instead of a `home` route:

**`src/App.tsx`**

```TypeScript
...
import TeaPage from './tea/TeaPage';
...
const App: React.FC = () => {
  useEffect(() => {
    ...
  });

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/tea">
            <TeaPage />
          </Route>
          <Route exact path="/">
            <Redirect to="/tea" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
```

**Challenge:** Replace the header text "Blank" with "Tea" and fix any failing tests.

During this training, your snapshot tests will periodically fail as we update components. That's OK and makes sense - we are modifying our components so they shouldn't be matching existing snapshots. Remember to update your snapshots whenever the snapshot tests fail by pressing `u` in the terminal hosting `npm test`.

#### Mock the Data

We don't have a connection to a back end service to get any data for our application. For now we will just add some data directly to our page so we have something to work with.

Just copy-paste the following into your `TeaPage` file, above the component declaration:

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
      'not as subtle as green teas. Oolong teas often have a flowery fragrance.',
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
      'delicate flavor that is sweet and fragrant. White tea should be steeped at lower temperatures for ' +
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
```

We haven't imported the `Tea` model into our file yet so your IDE may be showing some kind of visual cue. Let's go ahead and import it using the barrel file we created:

```TypeScript
import ExploreContainer from '../components/ExploreContainer';
import { Tea } from '../shared/models';
import './TeaPage.css';
...
```

#### Create a List of Cards

Now that we have a list of teas, we need to figure out the best component to visually showcase the data. Each item contains a title, an image, and a description -- those data-points work well with <a href="https://ionicframework.com/docs/api/card" target="_blank">cards</a>.

Let's see how that looks. Replace the line containing `<ExploreContainer />` with the following code:

**`src/tea/TeaPage.tsx`**

```JSX
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

That looks pretty good, at least when viewed at a phone resolution but what about other form factors?

## Make a Responsive Grid

Our application looks good when viewed on a phone resolution but if we modify our browser to emulate some other form factor such as an iPad or iPad Pro the cards are huge; each item gets way too much real estate. It would look much nicer if we could:

1. Show a single list on a phone
2. Show two columns of cards side-by-side on an iPad
3. Show four columns on even wider screen, such as an iPad in landscape mode or a desktop

Enter the <a href="https://ionicframework.com/docs/layout/grid" target="_blank">responsive grid</a>! By default, the responsive grid shows rows of 12 columns each. However, we only want to show at most rows of 4 columns. Luckily there are some simple mechanisms in place that will allow us to do that, but first we should massage our data a bit.

### Setup a Data Matrix

We have a list of X number of teas (currently 8, but once we start fetching data from a back end service it could be any number); let's break that up into a matrix with 4 teas in each row.

Create a test for this in `TeaPage.test.tsx`:

```TypeScript
...
import TeaPage, { teaData } from './TeaPage.tsx';

describe('<TeaPage />', () => {
  ...
  describe('initialization', () => {
    it('makes a tea matrix', () => {
      const teaMatrix = [
        [teaData[0], teaData[1], teaData[2], teaData[3]],
        [teaData[4], teaData[5], teaData[6], teaData[7]],
      ];
      expect(undefined).toEqual(teaMatrix);
    });
  });
});
```

This test shows the single array being expanded into an array of two child arrays, each of which are four teas long. Let's create the code to do that.

Export a function called `listToMatrix()` in `TeaPage.tsx`:

**`src/tea/TeaPage.tsx`**:

```TypeScript
...
export const listToMatrix = (): Tea[][] => {
  let teaMatrix: Tea[][] = [];
  let row: Tea[] = [];

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
...
```

**Challenge:** Go ahead and update the unit test so it passes.

### Style the Grid

Now that we have our matrix, let's create the grid. **Set up Chrome to emulate an iPad Pro in landscape mode.** We know we want 4 columns on a wide screen like this, and we know that the grid by default supports 12 columns. That means for a wide screen like this each column should take up 3 columns.

Replace the existing `<IonList />` with the following code:

**`src/tea/TeaPage.tsx`**

```JSX
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

This code loops through the rows of the matrix and displays a column for each tea in that row. That looks great on an iPad Pro, although the cards are all different sizes and the rows are a bit crowded. Let's fix that with some simple CSS in `TeaPage.css`:

**`src/tea/TeaPage.css`**

```CSS
.tea-grid ion-card {
  height: 100%;
}

.tea-grid ion-col {
  margin-bottom: 1em;
}

```

Now each card takes up the same cell height and we have some margin between the rows. Nice!

There is one last thing: our layout will always display four columns which will look very squished on a phone. The grid provides breakpoints that allow us to set the column sizes based on the size of the viewport. Let's do the following:

- Smaller Devices: column size 12 => each column will take up an entire "row"
- Large Devices: column size 6 => each column will take up half of the "row" (2 columns per "row")
- Extra Large Devices: column size 3 => each column will take up a quarter of the "row" (4 columns per "row")

Change the `IonCol` properties like so:

**`src/tea/TeaPage.tsx`**

```TypeScript
...
<IonCol size="12" sizeMd="6" sizeXl="3" key={tea.id}>
...
```

Now as you change the type of device that is being emulated on Chrome the layout adapts accordingly.

## Cleanup

We have no further use of the `<ExploreContainer />` component that was generated when we generated our project using `ionic start`. Let's remove the statement importing it in `TeaPage.tsx` and delete the `components` folder.

Additionally, don't forget to update your component's snapshot!

## Conclusion

We have learned how to mock up an interface and make our design responsive. Make sure you have a look at your app in both light and dark mode. Next we will add a login page to our application.
