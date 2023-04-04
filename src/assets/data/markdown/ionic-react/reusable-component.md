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

Inside `src/shared/components`, create the following files: `Rating.tsx`, `Rating.test.tsx`, and `Rating.css`.

Fill `Rating.tsx` with the following boilerplate code:

**`src/shared/components/rating/Rating.tsx`**

```typescript
import './Rating.css';

export const Rating: React.FC = () => {
  return <div>Rating</div>;
};
```

Now let's shell out the test file:

**`src/shared/components/rating/Rating.test.tsx`**

```tsx
import { render } from '@testing-library/react';
import { Rating } from './Rating';

describe('<Rating />', () => {
  it('renders consistently', () => {
    const { asFragment } = render(<Rating />);
    expect(asFragment()).toMatchSnapshot();
  });

  afterEach(() => jest.restoreAllMocks());
});
```

We'll leave `Rating.css` alone for now, finally add your export statement to the shared components' barrel file:

**`src/shared/components/index.ts`**

```typescript
export * from './rating/Rating';
```

Before we do anything else, let's add our component to the tea details page:

**`src/tea/details/TeaDetailsPage.tsx`**

```tsx
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

Update the rating component to display a row of five stars:

**`src/shared/components/rating/Rating.tsx`**

```tsx
import { IonIcon } from '@ionic/react';
import { star } from 'ionicons/icons';

import './Rating.css';

export const Rating: React.FC = () => {
  return (
    <div className="rating" data-testid="rating">>
      {[1, 2, 3, 4, 5].map((num, idx) => (
        <IonIcon data-testid={`Rate ${num} stars`} key={idx} icon={star} />
      ))}
    </div>
  );
};
```

**Challenge:** Using `useState` add a property `rating` to the component. Give it an initial value greater than zero but less than 5.

Change the component's markup so that the number of filled in starts matches the initial rating and the rest are outlined stars:

```tsx
 <div className="rating" data-testid="rating">>
  {[1, 2, 3, 4, 5].map((num, idx) => (
    <IonIcon data-testid={`Rate ${num} stars`} key={idx} icon={num <= rating ? star : starOutline} />
  ))}
</div>
```

Add an `onClick` handler that will change the rating when the user clicks on a star:

```tsx
 <div className="rating" data-testid="rating">>
  {[1, 2, 3, 4, 5].map((num, idx) => (
    <IonIcon
      data-testid={`Rate ${num} stars`}
      key={idx}
      icon={num <= rating ? star : starOutline}
      onClick={() => setRating(num)}
    />
  ))}
</div>
```

Try clicking different rating values. So far so good!

### Styling the Component

The rating component works well but the stars are a _little_ small and close together, especially for people with larger hands. Let's apply a little styling to make the experience better:

**`src/shared/components/rating/Rating.css`**:

```css
.rating ion-icon {
  font-size: 1.5em;
  padding-right: 0.5em;
  color: var(--ion-color-primary);
}

.rating ion-icon:last-child {
  padding-right: 0px;
}
```

Now it's much easier for users to change the rating of the tea category!

### Component Props

Visually the rating component looks good, but it's not very useful to the components consuming it. It would be great if the consumer of this component could:

- Supply an initial rating value
- Run a method when the rating changes
- Allow the component to be disabled

This can be achieved by creating a set of props specific to the rating component.

**`src/shared/components/rating/Rating.tsx`**

```typescript
...
import './Rating.css';

interface RatingProps {
  initialRating?: number;
  disabled?: boolean;
  onRatingChange: (rating: number) => any;
}
...
```

The only prop that the consumer _needs_ to provide is `onRatingChange`. Default values for the optional props `initialRating` and `disabled` are provided.

Update the component to use `RatingProps`:

```tsx
import { useEffect, useState } from 'react';
...

export const Rating: React.FC<RatingProps> = ({ initialRating = 0, disabled = false, onRatingChange }) => {
  const [rating, setRating] = useState<number>(1);

  useEffect(() => setRating(initialRating), [initialRating]);

  const handleRatingChange = (rating: number) => {
    setRating(rating);
    onRatingChange(rating);
  };

  return (
    <div className="rating" style={{ opacity: disabled ? 0.25 : 1 }} data-testid="rating">
      {[1, 2, 3, 4, 5].map((num, idx) => (
        <IonIcon
          data-testid={`Rate ${num} stars`}
          key={idx}
          icon={num <= rating ? star : starOutline}
          onClick={() => !disabled && handleRatingChange(num)}
        />
      ))}
    </div>
  );
};
```

The tests for the rating component are failing. Let's replace the existing tests in favor for two separate `describe()` blocks for when the component is enabled and when the component is disabled.

**`src/shared/components/rating/Rating.test.tsx`**

```typescript
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

```tsx
...
  describe('when enabled', () => {
    let props: any;

    beforeEach(() => (props = { onRatingChange: jest.fn() }));

    it('renders consistently', () => {
      const { asFragment } = render(<Rating {...props} />);
      expect(asFragment()).toMatchSnapshot();
    });

    it('sets the opacity to 1', () => {
      render(<Rating {...props} />);
      const rating = screen.getByTestId(/rating/) as HTMLDivElement;
      expect(rating.style.opacity).toEqual('1');
    });

    it('sets the rating on click', async () => {
      render(<Rating {...props} />);
      const fourStars = screen.getByTestId(/Rate 4 stars/);
      fireEvent.click(fourStars);
      await waitFor(() => expect(props.onRatingChange).toHaveBeenCalledTimes(1));
      expect(props.onRatingChange).toBeCalledWith(4);
    });
  });
...
```

Then the "when disabled" block:

```tsx
...
  describe('when disabled', () => {
    let props: any;
    beforeEach(() => (props = { onRatingChange: jest.fn(), disabled: true }));

    it('renders consistently', () => {
      const { asFragment } = render(<Rating {...props} />);
      expect(asFragment()).toMatchSnapshot();
    });

    it('sets the opacity to 0.25', () => {
      render(<Rating {...props} />);
      const rating = screen.getByTestId(/rating/) as HTMLDivElement;
      expect(rating.style.opacity).toEqual('0.25');
    });
  });
...
```

## Saving the Rating

We need a way to save and retrieve the rating of each tea supplied by the user. Our backend data service does not currently support saving/storing tea ratings so we will store this data locally using the Capacitor Preferences API.

### Update the Tea Model

First, update the `Tea` model to optionally contain a `rating`.

**`src/shared/models/Tea.ts`**

```typescript
export interface Tea {
  id: number;
  name: string;
  description: string;
  image: string;
  rating?: number;
}
```

### Get the Rating

Add ratings to each of the `expectedTeas` items in `src/tea/__fixtures__/mockTea.ts`.

**Example:**

```typescript
{
  id: 1,
  name: 'Green',
  image: require(`../../assets/images/green.jpg`),
  description: 'Green tea description.',
  rating: 4,
}
```

For some of the items, make the rating zero. This will be the default value for teas that do not yet have a rating.

The rating is not part of the data coming back from the back end, so the result set that we expect back from the API should not include it. Update `resultTeas` so it deletes the `rating` property like we do for `image`:

```typescript
const resultTeas = () => {
  return expectedTeas.map((t: Tea) => {
    const tea = { ...t };
    // @ts-ignore
    delete tea.image;
    delete tea.rating;
    return tea;
  });
};
```

Then update the setup code in order to mock the `Preferences` Capacitor API. When mocking the `get()` function, the return values will need to match however you set the ratings in the test data:

**`src/tea/TeaProvider.test.tsx`**

```typescript
...
jest.mock('@capacitor/preferences');
...
describe('useTea()', () => {
  beforeEach(() => (Preferences.get = jest.fn(async ({ key }) => {
    switch (key) {
      case 'rating1':
        return { value: '1' };
        // Repeat for all expectedTeas with a non-zero rating.
        // The key is `rating${id}`
      default:
        return { value: '0' };
    }
  })));

  describe('get all teas', () => { ... });
  ...
});
```

The unit tests for `useTea` now fail. We will update the hook to make them pass.

First update `fromJsonToTea()`:

**`src/tea/TeaProvider.tsx`**

```typescript
const fromJsonToTea = async (obj: any): Promise<Tea> => {
  const rating = await Preferences.get({ key: `rating${obj.id}` });
  return {
    ...obj,
    image: require(`../assets/images/${images[obj.id - 1]}.jpg`),
    rating: parseInt(rating?.value || '0', 10),
  };
};
```

Then update `getTeas()`:

```typescript
const getTeas = useCallback(async () => {
  const { data } = await api.get('/tea-categories');
  const teas = await Promise.all(data.map(async (item: any) => await fromJsonToTea(item)));
  setTeas(teas);
}, [api]);
```

Now all our tests pass.

### Saving to Preferences

Saving is pretty straightforward. Our `saveTea()` method will take a full `Tea` model but we will only save the rating, since the tea item itself is currently read-only.

Start by adding the describe block for "save tea":

**`src/tea/TeaProvider.test.tsx`**

```typescript
...
describe('useTea', () => {
  ...
  describe('get a specific tea', () => {
    ...
  });

  describe('save tea', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: resultTeas() });
      Preferences.set = jest.fn();
    });

    it('saves the rating', async () => {
      const tea = { ...expectedTeas[4], rating: 1 };
      const { result, waitForNextUpdate } = renderHook(() => useTea(), { wrapper });
      await waitForNextUpdate();
      await act(async () => await result.current.saveTea(tea));
      expect(Preferences.set).toHaveBeenCalledTimes(1);
      expect(Preferences.set).toHaveBeenCalledWith({ key: 'rating5', value: '1' });
      expect(result.current.teas.find((t) => t.id === tea.id)?.rating).toEqual(1);
    });
  });
  ...
});
```

To make this test pass, first we need to update `TeaContext`:

**`src/tea/TeaProvider.tsx`**

```typescript
export const TeaContext = createContext<{
  teas: Tea[];
  getTeas: () => Promise<void>;
  saveTea: (tea: Tea) => Promise<void>;
}>({
  teas: [],
  getTeas: () => {
    throw new Error('Method not implemented');
  },
  saveTea: () => {
    throw new Error('Method not implemented');
  },
});
```

Then, we need to add and export the `saveTea()` function within `<TeaProvider />`:

```typescript
const saveTea = async (tea: Tea): Promise<void> => {
  const rating = tea.rating?.toString() || '0';
  Preferences.set({ key: `rating${tea.id}`, value: rating });
  const idx = teas.findIndex((t) => t.id === tea.id);
  teas[idx] = tea;
  setTeas(teas);
};
```

Finally, we need to destructure then return this function within the `useTea()` hook.

**Challenge:** Make the test pass by updating the `useTea()` hook.

## Update the Details Page

The tea details page needs to be adjusted to account for the changes made to the `<Rating />` component:

1. It should be supplied an initial rating value
2. It should be disabled if no tea item is available
3. An event handler should save the tea when the rating is changed

Go ahead and make the following changes to the tea details page.

**`src/tea/details/TeaDetailsPage.tsx`**

```tsx
...
const TeaDetailsPage: React.FC = () => {
  ...
  const { teas, saveTea } = useTea();
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

Go ahead and test this functionality out. Add ratings to a couple of the tea items, reload (or refresh) the application and see that their values persist!

## Conclusion

Components are the fundamental building block of React, so it's important to understand how to compose and test reusable components. Next we will add tabbed navigation to our application.
