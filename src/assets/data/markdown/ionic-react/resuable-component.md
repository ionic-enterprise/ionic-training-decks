# Lab: Create a Reusable Component

In this lab you will:

- Create a reusable component
- Use the component in the details page

## Overview

It's fairly common for front-end applications to consist of parts and modules that can be applied to multiple features of an application. Shared functionality is often generalized, exposing events and hooks that each consumer is allowed to implement to their specific specification.

We're going to build a reusable ratings component. This component will allow an application user to supply a rating from 0-5 and emit an event when the action is performed. Our details page will handle the event, obtaining the rating number from the component and use it to update our tea data set.

## Shared Components Feature Folder

Start by creating a new folder in `src/shared` named `components` and add a barrel file within it. This barrel file will export any shared components to be used across the application.

## Create the Rating Component

Let's create a subfolder within `src/shared/components` called `rating`. Inside this folder, create the following files: `Rating.tsx`, `Rating.test.tsx`, and `Rating.css`.

Fill `Rating.tsx` with the following boilerplate code:

**`src/shared/components/rating/Rating.tsx`**

```TypeScript
import React from 'react';

import './Rating.css';

export const Rating: React.FC = () => {
  return <div>Rating</div>;
};
```

Now let's shell out the test file:

**`src/shared/components/rating/Rating.test.tsx`**

```TypeScript
import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { Rating } from './Rating';

describe('<Rating />', () => {
  it('renders consistently', () => {
    const { asFragment } = render(<Rating />);
    expect(asFragment()).toMatchSnapshot();
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });
});
```

We'll leave `Rating.css` alone for now, finally add your export statement to the shared components' barrel file:

**`src/shared/components/index.ts`**

```TypeScript
export * from './rating/Rating';
```

Before we do anything else, let's add our component to the tea details page:

**`src/tea/details/TeaDetailsPage.tsx`**

```TypeScript
...
import { Rating } from '../../shared/components';
...
const TeaDetailsPage: React.FC = () => {
  ...
  return (
    ...
    <div className="ion-padding">
      <div className="ion-justify-content-center">
        <IonImg src={tea?.image} />
      </div>
      <h1>{tea?.name}</h1>
      <p>{tea?.description}</p>
      <Rating />
    </div>
    ...
  );
};
export default TeaDetailsPage;
```

Confirm that your component displays under the tea description. Once it does, move onto the next section.

## Build the Rating Component

### Writing the Template

Let's update the rating component to display a row of five stars:

**`src/shared/components/rating/Rating.tsx`**

```TypeScript
import React from 'react';
import { IonIcon } from '@ionic/react';
import { star } from 'ionicons/icons';

import './Rating.css';

export const Rating: React.FC = () => {
  return (
    <div className="rating">
      {[1, 2, 3, 4, 5].map((_, idx) => (
        <IonIcon key={idx} icon={star} />
      ))}
    </div>
  );
};
```

**Challenge:** Using `useState` add a property `rating` to the component. Give it an inital value greater than zero but less than 5.

Next, change the component's markup so that the number of filled in starts matches the initial rating and the rest are outlined stars:

```TypeScript
    ...
      {[1, 2, 3, 4, 5].map((num, idx) => (
        <IonIcon key={idx} icon={num <= rating ? star : starOutline} />
      ))}
    ...
};
```

Finally, add an `onClick` handler that will change the rating when the user clicks on a star:

```TypeScript
    ...
      {[1, 2, 3, 4, 5].map((num, idx) => (
        <IonIcon
          key={idx}
          icon={num <= rating ? star : starOutline}
          onClick={() => setRating(num)}
        />
      ))}
    ...
```

Try clicking different rating values. So far so good!

### Styling the Component

The rating component works well but the stars are a _little_ small and close together, especially for people with larger hands. Let's apply a little styling to make the experience better:

**`src/shared/components/rating/Rating.css`**:

```CSS
.rating ion-icon {
  font-size: 1.5em;
  padding-right: 0.5em;
  color: var(--ion-color-primary);
}
```

Now it's much easier for users to change the rating of the tea category!

### Component Props

Visually the rating component looks good, but it's not very useful to the components consuming it. It would be great if the consumer was able to:

- Supply an initial rating value
- Run a method when the rating changes
- Allow the component to be disabled

We can achieve this by creating a set of props specific to our rating component. We've kind of done this before when building the `ProtectedRoute`. This time, we won't be extending any existing prop definition, we'll be creating our own:

**`src/shared/components/rating/Rating.tsx`**

```TypeScript
...
import './Rating.css';

interface RatingProps {
  initialRating?: number;
  disabled?: boolean;
  onRatingChange: (rating: number) => any;
}

export const Rating: React.FC<RatingProps> = ({
  initialRating = 0,
  disabled = false,
  onRatingChange
}) => {
  const [rating, setRating] = useState<number>(0);

  ...
};
```

The only prop that the consumer _needs_ to provide is `onRatingChange`. We'll supply default values for the optional props `initialRating` and `disabled`.

With our props defined, let's update the component to use them. First, we need a `useEffect()` that will update our rating when `initialRating` updates:

```TypeScript
...
useEffect(() => setRating(initialRating), [initialRating]);
...
```

Next, we'll want to establish a handler that will both update our rating state and invoke `onRatingChange()` passing in the updated rating value:

```TypeScript
...
const handleRatingChange = (rating: number) => { };

return (
    <div className="rating">
      {[1, 2, 3, 4, 5].map((num, idx) => (
        <IonIcon
          ...
          onClick={() => handleRatingChange(num)}
        />
      ))}
    </div>
  );
);
```

**Challenge:** Fill in `handleRatingChange`.

Then, we'll add an `aria-label` property to `IonIcon`. This will be helpful for accessibility:

```TypeScript
...
<IonIcon
  aria-label={`Rate ${num} stars`}
  key={idx}
  icon={num <= rating ? star : starOutline}
  onClick={() => handleRatingChange(num)}
/>
...
```

Finally, let's update the markup to accomodate the case where the component is disabled:

```JSX
...
<div className="rating" style={{ opacity: disabled ? 0.25 : 1 }}>
  {[1, 2, 3, 4, 5].map((num, idx) => (
    <IonIcon
      aria-label={`Rate ${num} stars`}
      key={idx}
      icon={num <= rating ? star : starOutline}
      onClick={() => !disabled && handleRatingChange(num)}
    />
  ))}
</div>
...
```

At this point both running processes - `ionic serve` and `npm test` - should be showing errors. In the spirit of test-driven-development, we'll fix (and add) our tests first.

### Test First

You should notice that your "renders consistently" test has a syntax error. That's OK, let's remove the entire test. In it's place we will create two different snapshot tests, one for when the component is enabled and one when it's disabled:

**`src/shared/components/rating/Rating.test.tsx`**

```TypeScript
import React from 'react';
import { ionFireEvent as fireEvent } from '@ionic/react-test-utils';
...

describe('<Rating />', () => {
  describe('when enabled', () => { });

  describe('when disabled', () => { });

  afterEach(() => {
    ...
  });
});
```

Fill out the `when enabled` describe block with the following:

```TypeScript
  ...
  describe('when enabled', () => {
    let props: any;

    beforeEach(() => (props = { onRatingChange: jest.fn() }));

    it('renders consistently', () => {
      const { asFragment } = render(<Rating {...props} />);
      expect(asFragment()).toMatchSnapshot();
    });

    it('sets the opacity to 1', () => {
      const { container } = render(<Rating {...props} />);
      const rating = container.querySelector('.rating') as HTMLDivElement;
      expect(rating.style.opacity).toEqual('1');
    });

    it('sets the rating on click', async () => {
      const { getByLabelText } = render(<Rating {...props} />);
      const fourStars = getByLabelText('Rate 4 stars');
      fireEvent.click(fourStars);
      expect(props.onRatingChange).toHaveBeenCalledWith(4);
    });

    it('calls the change handler on click', async () => {
      const { getByLabelText } = render(<Rating {...props} />);
      const fourStars = getByLabelText('Rate 4 stars');
      fireEvent.click(fourStars);
      expect(props.onRatingChange).toHaveBeenCalledTimes(1);
    });
  });
  ...
```

And the "when disabled" block:

```TypeScript
  ...
  describe('when disabled', () => {
    let props: any;

    beforeEach(() => {
      props = { onRatingChange: jest.fn(), disabled: true };
    });

    it('renders consistently', () => {
      const { asFragment } = render(<Rating {...props} />);
      expect(asFragment()).toMatchSnapshot();
    });

    it('sets the opacity to 0.25', () => {
      const { container } = render(<Rating {...props} />);
      const rating = container.querySelector('.rating') as HTMLDivElement;
      expect(rating.style.opacity).toEqual('0.25');
    });

    it('does not call the change handler on click', () => {
      const { getByLabelText } = render(<Rating {...props} />);
      const fourStars = getByLabelText('Rate 4 stars');
      fireEvent.click(fourStars);
      expect(props.onRatingChange).not.toHaveBeenCalled();
    });
  });
  ...
```

Note that `getByLabelText` can retrieve elements based on the value of their `aria-label` property. Pretty neat! All the tests should now pass.

### Then Code

To fix our `ionic serve` process, add an `onRatingChange` prop to the `<Rating />` component in `TeaDetailsPage.tsx`:

**`src/tea/details/TeaDetailsPage.tsx`**

```JSX
...
<Rating onRatingChange={() => { }}/>
...
```

## Save the Rating

We need a way to save and retrieve the rating of each tea. Our back end service does not currently support tea ratings, so we will store this data locally using the Capacitor Storage API.

To integrate the rating feature within our data set we have to:

- Add an optional `rating` property to the `Tea` model
- Modify `useTea` to get the rating
- Add a `saveRating()` method to `useTea` to set the rating

### Update the Model

The first step is easy, let's update the shared `Tea` model:

**`src/shared/models/Tea.ts`**

```TypeScript
export interface Tea {
  id: number;
  name: string;
  description: string;
  image: string;
  rating?: number;
}
```

### Get the Rating

Let's add ratings to each of the `expectedTeas` tea items in `useTea.test.tsx` like so:

**`src/tea/useTea.test.tsx`**

```TypeScript
...
{
  id: 1,
  name: 'Green',
  image: 'green.jpg',
  description: 'Green tea description.',
  rating: 4,
},
...
```

For some of the items, make the rating zero. This will be the default value for teas that do not yet have a rating.

The rating is not part of the data coming back from the back end, so the result set that we expect back from the API should not include it. Update `resultTeas` so it deletes the `rating` property like we do for `image:

```TypeScript
const resultTeas = () => {
  return expectedTeas.map((t: Tea) => {
    const tea = { ...t };
    delete tea.image;
    delete tea.rating;
    return tea;
  });
};
```

Then update the setup code in order to mock the `Storage` Capacitor API. When mocking the `get()` function, the return values will need to match however you set the ratings in the test data:

**`src/tea/useTea.test.tsx`**

```TypeScript
...
describe('useTea', () => {
   beforeEach(() => {
    (Plugins.Storage.get as any) = jest.fn(({ key }: { key: string }) => {
      switch (key) {
        case 'rating1':
          return Promise.resolve({ value: 1 });
        // Repeat for all expectedTeas with a non-zero rating.
        // The key is `rating${id}`
        default:
          return Promise.resolve();
      }
    });
  });

  describe('get all teas', () => {
    ...
  });
  ...
});
```

At this point you should have failing tests. Let's update `useTea` to make them pass. First update `fromJsonToTea` to make it asyncrhonous and have it grab the rating from storage:

**`src/tea/useTea.tsx`**

```TypeScript
  ...
  const fromJsonToTea = async (obj: any): Promise<Tea> => {
    const { Storage } = Plugins;
    const rating = await Storage.get({ key: `rating${obj.id}` });
    return {
      ...obj,
      image: require(`../assets/images/${images[obj.id - 1]}.jpg`),
      rating: parseInt(rating?.value || '0', 10),
    };
  };
  ...
```

We're not done yet; right now `getTeas()` and `getTeaById()` will return unresolved Promises as their `rating` property. Not cool. We can easily fix `getByTeaById()` by adding an `await` keyword as part of the return statement:

```TypeScript
...
const getTeaById = useCallback(async (id: number): Promise<Tea> => {
  const url = `${process.env.REACT_APP_DATA_SERVICE}/tea-categories/${id}`;
  const { data } = await apiInstance.get(url);
  return await fromJsonToTea(data);
}, []);
...
```

Fixing `getTeas()` is a bit trickier. We still need to add the `async` keyword to our return statement, but we need to asynchronize our `map()` call and place it inside `Promise.all()` so that we return resolved tea items instead of an array of pending Promises:

```TypeScript
...
const getTeas = useCallback(async (): Promise<Tea[]> => {
  const url = `${process.env.REACT_APP_DATA_SERVICE}/tea-categories`;
  const { data } = await apiInstance.get(url);
  return await Promise.all(
    data.map(async (item: any) => await fromJsonToTea(item)),
  );
}, []);
...
```

Now all our tests pass.

### Saving to Storage

Saving is pretty straightforward. Our `saveTea()` method will take a full `Tea` model but we will only save the rating, since the tea item itself is currently read-only.

Start by adding the describe block for "save tea":

**`src/tea/useTea.test.tsx`**

```TypeScript
...
describe('useTea', () => {
  ...
  describe('get a specific tea', () => {
    ...
  });

  describe('save tea', () => {
    beforeEach(() => (Plugins.Storage.set) = jest.fn());

    it('saves the rating', async () => {
      const tea = { ...expectedTeas[4] };
      tea.rating = 4
      const { result } = renderHook(() => useTea());
      await act(async () => {
        await result.current.saveTea(tea);
      });
      expect(Plugins.Storage.set).toHaveBeenCalledTimes(1);
      expect(Plugins.Storage.set).toHaveBeenCalledWith({
        key: 'rating5',
        value: '4',
      });
    });
  });
  ...
});
```

Let's make this test pass. Add a new method `saveTea()` to the `useTea` hook:

**`src/tea/useTea.tsx`**

```TypeScript
...
export const useTea = () => {
  ...
  const saveTea = async (tea: Tea): Promise<void> => {
    const { Storage } = Plugins;
    return Storage.set({
      key: `rating${tea.id}`,
      value: tea.rating?.toString() || '0',
    });
  };
  ...
  return { getTeas, getTeaById, saveTea };
};
```

---

#### Test First

Add a new describe block after the describe block for `get one`:

```TypeScript
  ...
  describe('save', () => {
    it('saves the rating', async () => {
      const tea = { ...expectedTeas[4] };
      tea.rating = 4;
      await teaCategories.save(tea);
      expect(Plugins.Storage.set).toHaveBeenCalledTimes(1);
      expect(Plugins.Storage.set).toHaveBeenCalledWith({
        key: 'rating5',
        value: '4',
      });
    });
  });
  ...
```

Now let's implement the method.

#### Then Code

Add the following method to our `TeaCategories` class:

```TypeScript
  async save(tea: Tea): Promise<void> {
    const { Storage } = Plugins;
    return Storage.set({
      key: `rating${tea.id}`,
      value: tea.rating?.toString() || '0',
    });
  }
```

Save and your test should now pass. One more step before we add it to the details page.

## Modify the Details Page

One more item before we finish the lab: we need to provide props to the `<Rating />` component in our details page. On rating change, we'll call `saveTea()` to save the rating to storage:

**`src/tea/details/TeaDetailsPage.tsx`**

```TypeScript
...
const TeaDetailsPage: React.FC = () => {
  ...
  const { getTeaById, saveTea } = useTea();
  ...
  return (
    ...
    <Rating
      initialRating={tea?.rating}
      disabled={!tea}
      onRatingChange={rating => saveTea({ ...tea!, rating })}
    />
    ...
  );
};
export default TeaDetailsPage;
```

## Conclusion

Congratulations! You have created and consumed your first (true) reusable component. Up next we will add tabbed navigation to our application.
