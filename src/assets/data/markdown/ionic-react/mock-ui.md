# Lab: Mock Up the Interface

In this lab, you will learn how to:

- Model data using TypeScript interfaces
- Mock up a user interface using the Ionic Framework
- Install assets that can be used by your application
- Leverage responsive design to design for multiple form factors

## Overview

It is often desirable to lay out the user interface before worrying how to get data to be displayed. Doing so allows us to concentrate solely on how the application will look and feel in order to get that worked out early in the development process.

## Install the Images

We'll want to display images for the tea data we will be mocking up, but these assets do not exist yet. <a href="/assets/packages/ionic-react/img.zip">Download the images</a> and unpack the zip file. Follow these steps to place them in the correct locations:

1. Create a folder `public/assets/images`
2. Move all files with the `.jpg` extension into `public/assets/images`
3. Move `favicon.png` into `public`

If you are running the application in the browser, you should notice that the icon in the browser tab has no changed. However, the tab still says _Ionic App_. To change that, edit `index.html` and change the `title`.

## Model the Data

Before we mock up te UI for the main page, let's define the data model for our teas:

- Create a `src/models` folder
- Add a `src/models/Tea.ts` file

```typescript
export interface Tea {
  id: number;
  name: string;
  description: string;
  image: string;
}
```

We will also create a barrel file for our models. This seems a little redundant right now, but it will make our lives easier later. Create `src/models/index.ts` and export the `Tea` model there.

```typescript
export * from './Tea';
```

## Rename the Home Page

We've done some work already with the Home page. Rather than start over, let's just rename that to be our tea listing page.

This is a multi-part process:

1. Create a subfolder named `src/pages/tea`.
2. Move the existing files in `src/pages` within the `src/pages/tea` subfolder.
3. Replace `Home` with `TeaListPage` for all filenames within `src/pages/tea`.
   - For example, `src/pages/tea/Home.test.tsx` becomes `src/pages/tea/TeaListPage.test.tsx`.
4. Rename the `Home` component to `TeaListPage`.
5. Fix the routing.
6. Fix the tests.
7. Make minor updates to the code.

### Fix the Routing

Application routing is defined in `src/App.tsx`, so we need to replace the reference to `<Home />` here. While we're at it, let's give the route a more descriptive path:

```tsx
...
const App: React.FC = () => (
  <IonApp>
    <SplashContainer>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/tea">
            <TeaListPage />
          </Route>
          <Route exact path="/">
            <Redirect to="/tea" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </SplashContainer>
  </IonApp>
);
...
```

### Fix the Tests

We need to replace the reference to `<Home />` within `src/pages/tea/TeaListPage.test.tsx` as well.

```tsx
describe('<TeaListPage />', () => {
  it('renders consistently', () => {
    const { asFragment } = render(<TeaListPage />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('displays the title', () => {
    render(<TeaListPage />);
    const titleElements = screen.getAllByText('Blank');
    expect(titleElements).toHaveLength(2);
  });
}
```

At this point, our tests and the continuous build for our development server should both be working. Please reach out to your instructor if you get stuck.

### Coding Challenge

Now that we've renamed the Home page and fixed up the routes, I have a coding challenge for you. Change the tea listing page to have a title of "Teas" instead of "Blank".

This will be a two step process:

1. Update the test to grab elements with the text "Teas" rather than "Blank". This should break your test.
2. Update and fix the code accordingly.

During this training, your snapshot tests will periodically fail as we update components. That's OK and makes sense - we are modifying our components so they shouldn't be matching existing snapshots. Remember to update your snapshots whenever the snapshot tests fail by pressing `u` in the terminal hosting `npm run test.unit`.

## Mock Up the Tea Display

Let's mock up how Ionic components will be used in the tea listing page. This allows us to test out exactly what our data should look like and also allows us to concentrate on the styling without worrying about other moving parts.

### Mock the Data

We don't have a connection to a back end service to get any data for our application. For now we will just add some data directly to our page so we have something to work with.

Just copy-paste the following into your `TeaListPage` component file, above the component definition:

```typescript
export const teaData: Tea[] = [
  {
    id: 1,
    name: 'Green',
    image: '/assets/images/green.jpg',
    description:
      'Green teas have the oxidation process stopped very early on, leaving them with a very subtle flavor and ' +
      'complex undertones. These teas should be steeped at lower temperatures for shorter periods of time.',
  },
  {
    id: 2,
    name: 'Black',
    image: '/assets/images/black.jpg',
    description:
      'A fully oxidized tea, black teas have a dark color and a full robust and pronounced flavor. Black teas tend ' +
      'to have a higher caffeine content than other teas.',
  },
  {
    id: 3,
    name: 'Herbal',
    image: '/assets/images/herbal.jpg',
    description:
      'Herbal infusions are not actually "tea" but are more accurately characterized as infused beverages ' +
      'consisting of various dried herbs, spices, and fruits.',
  },
  {
    id: 4,
    name: 'Oolong',
    image: '/assets/images/oolong.jpg',
    description:
      'Oolong teas are partially oxidized, giving them a flavor that is not as robust as black teas but also ' +
      'not as subtle as green teas. Oolong teas often have a flowery fragrance.',
  },
  {
    id: 5,
    name: 'Dark',
    image: '/assets/images/dark.jpg',
    description:
      'From the Hunan and Sichuan provinces of China, dark teas are flavorful aged probiotic teas that steeps ' +
      'up very smooth with slightly sweet notes.',
  },
  {
    id: 6,
    name: 'Puer',
    image: '/assets/images/puer.jpg',
    description:
      'An aged black tea from china. Puer teas have a strong rich flavor that could be described as "woody" or "peaty."',
  },
  {
    id: 7,
    name: 'White',
    image: '/assets/images/white.jpg',
    description:
      'White tea is produced using very young shoots with no oxidation process. White tea has an extremely ' +
      'delicate flavor that is sweet and fragrant. White tea should be steeped at lower temperatures for ' +
      'short periods of time.',
  },
];
```

We haven't imported the `Tea` model into our file yet so your IDE may be showing some kind of visual cue. Let's go ahead and import it using the barrel file we created:

```typescript
import { Tea } from '../models';
```

### Experiment with a List

Now that we have a list of teas, we need to figure out how to display this information. One design that seems natural to use is a <a href="https://ionicframework.com/docs/api/card" target="_blank">card</a> per tea in the list. Let's see how that looks. Before doing this, use your browser's DevTools to emulate an iPhone.

Replace the line containing `<ExploreContainer />` with the following code:

```tsx
<IonList>
  {teaData.map((tea) => (
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

This looks nice on an iPhone form factor, but try some others. Try an iPad Pro, for example. Toggle device emulation off in the DevTools and look at it as a web page with desktop resolution. In both of these cases, the cards just look "big". Clearly a more responsive design is called for.

Leave device emulation off in the DevTools. Let's just worry about the desktop sized layout for now.

### Use a Responsive Grid

We _could_ just limit the size of the cards so they would not get so big, but that would just be a waste of screen space on larger devices. Clearly we are not going to go with a list, so let's remove the markup we just added.

What we really need is a way to do the following:

1. Show a single list on a phone
2. Show two columns of tea cards side by side on an iPad
3. Expand the columns to four on even wider screens, such as an iPad in landscape mode or a desktop

Enter the <a href="https://ionicframework.com/docs/layout/grid" target="_blank">responsive grid</a>. By default, the responsive grid shows rows containing 12 columns. Elements within the rows can be contained either within a single column or spread across multiple columns allowing for a very flexible layout within each row.

In our case, we want to show at most four columns of cards per row for high resolution devices. As the form factor changes, we want the number of columns to change. On lower resolution devices we would like to display only two columns per row, and on phone resolutions we would like just a single column of cards. Luckily, there are some simple mechanisms in place that will allow us to do that. First, let's think about how we want the grid to work at the highest resolutions and then express that in some tests.

We no longer need the test that expects the default text, so remove that test case.

Let's lay out our tests for our current mock data (which has seven teas), and our highest resolution, which will have four teas per row. In this case, our page is expected to render two rows; the first with four columns and the second with three.

We need tests like this in `src/pages/tea/TeaListPage.test.tsx`:

```tsx
describe('<TeaListPage />', () => {
...
  describe('with seven teas', () => {
    it('displays two rows', () => {});
    it('displays four columns in the first row', () => {});
    it('displays three columns in the second row', () => {});
  });
...
});
```

Let's fill out the first test:

```tsx
it('displays two rows', () => {
  const { baseElement } = render(<TeaListPage />);
  const rows = baseElement.querySelectorAll('ion-grid ion-row');
  expect(rows).toHaveLength(2);
});
```

In order to satisfy this requirement, it will be easiest if we convert our list of teas to a matrix. Let's write a method that does just that. Add the following function to `src/pages/tea/TeaListPage.tsx`, above the component definition, like we did for the mock tea data:

```typescript
const listToMatrix = (): Tea[][] => {
  let teaMatrix: Tea[][] = [];
  let row: Tea[] = [];

  teaData.forEach((tea) => {
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

We can now update the template accordingly. Add the following template code either directly above or below the `IonList` we previously added:

```tsx
<IonGrid className="tea-grid">
  {listToMatrix().map((row, idx) => (
    <IonRow key={idx} className="ion-align-items-stretch"></IonRow>
  ))}
</IonGrid>
```

**Hint:** remember to import new components as you use them.

Also, if you are wondering about the `ion-align-items-stretch` class, you can read more about it <a href="https://ionicframework.com/docs/layout/css-utilities#flex-container-properties" target="_blank">in our documentation</a>.

Now let's display the columns properly, first updating the tests:

```tsx
it('displays four columns in the first row', () => {
  const { baseElement } = render(<TeaListPage />);
  const rows = baseElement.querySelectorAll('ion-grid ion-row');
  const cols = rows[0].querySelectorAll('ion-col');
  expect(cols).toHaveLength(4);
});

it('displays three columns in the second row', () => {
  // Using the above test as a model, write your own test here...
});
```

Verify that we have two failing tests. Now we can update the template by mapping each row into columns:

```tsx
<IonGrid className="tea-grid">
  {listToMatrix().map((row, idx) => (
    <IonRow key={idx} className="ion-align-items-stretch">
      {row.map((tea) => (
        <IonCol key={tea.id} size="3"></IonCol>
      ))}
    </IonRow>
  ))}
</IonGrid>
```

**Note:** `size="3"` tells the column component to take up three column positions in the row. Remember that each row contains 12 column positions and that `IonCol` components in the row can be spread across multiple column positions. We only want at most four columns per row. Thus, each `IonCol` component we supply should be spread across three of the column positions in the row.

Now that we have the grid laid out, we can add our card template. We will just use the card template from our `IonList` that we had added above. First let's add the tests to the `describe('with seven teas)` block.

```tsx
it('displays the name in the title', () => {
  const { baseElement } = render(<TeaListPage />);
  const cols = baseElement.querySelectorAll('ion-col');
  cols.forEach((c, idx) => {
    const title = c.querySelector('ion-card ion-card-header ion-card-title');
    expect(title).toHaveTextContent(teaData[idx].name);
  });
});

it('displays the description in the content', () => {
  const { baseElement } = render(<TeaListPage />);
  const cols = baseElement.querySelectorAll('ion-col');
  cols.forEach((c, idx) => {
    const title = c.querySelector('ion-card ion-card-content');
    expect(title).toHaveTextContent(teaData[idx].description);
  });
});
```

Don't forget to update your import from `./TeaListPage.tsx`:

```typescript
import TeaListPage, { teaData } from './TeaListPage';
```

With the test in place, we can make the following modifications to the view:

- Move the `IonCard` layout from the `IonList` to be a child of the `IonCol` in our grid
- Remove the rest of the `IonList`

The component now loops through the rows. For each row it displays a column for each tea in that row. That looks great on a large device such as an iPad Pro or standard web browser. However, the cards are all different sizes and look a little crowded. We can fix that with a little styling in the view.

Let's fix that with some simple CSS in `TeaListPage.css`:

```css
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

```tsx
<IonCol size="12" sizeMd="6" sizeXl="3" key={tea.id}>
```

Now as you change the type of device that is being emulated on Chrome the layout adapts accordingly.

## Cleanup

We have no further use of the `<ExploreContainer />` component that was generated when we generated our project using `ionic start`. Let's remove the statement importing it in `TeaListPage.tsx` and delete the files from the `components` folder.

Additionally, don't forget to update your component's snapshot!

## Conclusion

We have learned how to mock up an interface and make our design responsive. Make sure you have a look at your app in both light and dark mode. Next we will add a login page to our application.
