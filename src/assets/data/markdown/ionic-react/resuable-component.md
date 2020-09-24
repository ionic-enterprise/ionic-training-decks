# Lab: Create a Reusable Component

In this lab you will:

- Create a shared feature folder
- Add a reusable component to the feature folder
- Use the component in the details page

## Overview

It's fairly common for front-end applications to consist of parts and modules that can be applied to multiple features of an application. Shared functionality is often generalized, exposing events and hooks that each consumer is required to implement to their specific specification.

We're going to build a reusable ratings component. This component will allow an application user to supply a rating from 0-5 and emit an event when the action is performed. Our details page will handle the event, obtaining the rating number from the component and using it to update our tea categories data set.

## Shared Components Feature Folder

Start by creating a new folder in `src/` named `components` and add a file named `index.ts` inside of it.Create a subfolder inside called `components`. This barrel file will export any shared components created while developing the application.

## Create `<Rating />` Component

Create a new subfolder `src/components/rating`. Inside this folder, create and scaffold the following files:

- `Rating.tsx` - do the minimum required to export a `<Rating />` component; **do not** create a default export
- `Rating.test.tsx` - create the initial describe block for the component and add a snapshot test to ensure it `renders consistently`
- `Rating.css` - just create this file, no action needed yet

Add the `<Rating />` component under the description paragraph in `<TeaDetails />`:

```TypeScript
...
import { Rating } from '../../components';
...
const TeaDetails: React.FC<TeaDetailsProps> = ({ match }) => {
  ...
  return (
    ...
    <p>{teaCategory?.description}</p>
    <Rating />
    ...
  );
};
export default TeaDetails;
```

Confirm that your component displays under the tea category description. It's not very interactive at this point; let's fix that.

## Build `<Rating />` Component

### Build the Template

Return to `src/components/rating/Rating.tsx` and let's update the template to display a row of five stars:

```TypeScript
import React from 'react';
import { IonIcon } from '@ionic/react';
import { star } from 'ionicons/icons';

import

export const Rating: React.FC = () => {
  return (
    <div className="rating">
      {[1, 2, 3, 4, 5].map((n, idx) => (
        <IonIcon key={idx} icon={star} />
      ))}
    </div>
  );
};
```

Next, add a stateful property named `rating` to the component and give it an initial value greater than zero but less than 5. Change the component markup so that the number of filled in stars matches the initial rating and the rest are outlined stars:

```TypeScript
    ...
      {[1, 2, 3, 4, 5].map((n, idx) => (
        <IonIcon key={idx} icon={n <= rating ? star : starOutline} />
      ))}
    ...
};
```

Finally, add an `onClick` handler that will change the rating when the user clicks on a star:

```TypeScript
    ...
      {[1, 2, 3, 4, 5].map((n, idx) => (
        <IonIcon
          key={idx}
          icon={n <= rating ? star : starOutline}
          onClick={() => setRating(n)}
        />
      ))}
    ...
```

Try clicking different rating values. So far so good!

### Styling the Component

The rating component works well but the stars are a _little_ small and close together, especially for people with larger hands. Let's apply a little styling to make the experience better.

Add the following to `src/components/rating/Rating.css`:

```CSS
.rating ion-icon {
  font-size: 1.5em;
  padding-right: 0.5em;
  color: var(--ion-color-primary);
}
```

Now it's much easier for users to change the rating of the tea category!

### Component Props

The `<Rating />` component visually looks good, but it's not very useful for components that want to use it (such as `<TeaDetails />`). It would be great if the consumer had the following capabilities:

- Supply an initial rating value
- Run a method when the rating changes
- Determine if the component is enabled/disabled

Component props were touched upon building the `TeaDetailsProps` interface. We will leverage component props to enhance the rating component's functionality.

Update `src/components/rating/Rating.tsx` to match the following:

```TypeScript
import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { star, starOutline } from 'ionicons/icons';

import './Rating.css';

interface RatingProps {
  initialRating?: number;
  disabled?: boolean;
  onRatingChange: (rating: number) => any;
}

export const Rating: React.FC<RatingProps> = ({
  initialRating = 0,
  disabled = false,
  onRatingChange,
}) => {
  const [rating, setRating] = useState<number>(0);

  useEffect(() => setRating(initialRating), [initialRating]);

  const handleRatingChange = (rating: number) => {
    //TODO: Fill this in
  };

  return (
    <div className="rating">
      {[1, 2, 3, 4, 5].map((n, idx) => (
        <IonIcon
          aria-label={`Rate ${n} stars`}
          key={idx}
          icon={n <= rating ? star : starOutline}
          onClick={() => handleRatingChange(n)}
        />
      ))}
    </div>
  );
};
```

Let's break down the updated code for the `<Rating />` component:

- We declared an interface for the component named `RatingProps`. For a better development experience, we only require the consumer to supply a function for `onRatingChange`.
- If `initialRating` and/or `disabled` is not provided as part of the props, we default them to `0` and `false` respectively.
- Each `IonIcon` is given an `aria-label`. This will be helpful for accessibility (screen readers).
- When the user clicks on a rating icon, we call `handleRatingChange`. Eventually this will call the `onRatingChange` prop.

Now we need to write some unit tests before we complete the implementation of the code.

#### Test First

Open up `src/components/rating/Rating.test.tsx`. You should notice that your `renders consistently` test has an error. That's OK, let's remove the entire test. Instead, we will create two different snapshot tests, one for when the `<Rating />` component is enabled, and one when it's disabled. Replace your existing code file with the following contents:

```TypeScript
import React from 'react';
import { render } from '@testing-library/react';
import { ionFireEvent as fireEvent } from '@ionic/react-test-utils';
import { Rating } from './Rating';

describe('<Rating />', () => {

  describe('when enabled', () => { });

  describe('when disabled', () => { });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });
});
```

Go ahead and fill the `when enabled` describe block with the following:

```TypeScript
  ...
  describe('when enabled', () => {
    let props: any;

    beforeEach(() => {
      props = { onRatingChange: jest.fn() };
    });

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

Go ahead and fill in the `when disabled` block:

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

Note that `getByLabelText` can retrieve elements based on the value of their `aria-label` property. Pretty neat! You should also take a look in `src/components/rating/__snapshots__/Rating.test.tsx.snap` to see the two separate snapshots written.

#### Then Code

In order to get these tests to pass, add the following changes to `Rating.tsx`:

First, fill in `handleRatingChange()`:

```TypeScript
  ...
  const handleRatingChange = (rating: number) => {
    setRating(rating);
    onRatingChange(rating);
  };
  ...
```

Then, update the component template:

```TypeScript
    ...
    <div className="rating" style={{ opacity: disabled ? 0.25 : 1 }}>
      {[1, 2, 3, 4, 5].map((n, idx) => (
        <IonIcon
          aria-label={`Rate ${n} stars`}
          key={idx}
          icon={n <= rating ? star : starOutline}
          onClick={() => !disabled && handleRatingChange(n)}
        />
      ))}
    </div>
    ...
```

All the tests should now pass and our shared component is ready for use!

## Save the Rating

We need to modify the tea category data service to both save and retrieve the rating for each tea category. Our backend API does not currently support the rating on a tea, so we will store this data locally using the Capacitor Storage API.

Our tasks to solution this will include:

- Adding an optional `rating` property to the `Tea` model
- Modifying the data service to get the rating
- Adding a `save()` method to the data service that will save the rating
- Adding a `saveRating()` method to the `useTeaCategories` hook for our components

### Update the Model

Update `src/models/Tea.ts` and add the following property:

```TypeScript
  rating?: number;
```

### Get the Rating

#### Test First

Open up `src/tea/TeaCategories.test.ts`. In the `expectedTeas` array, add a rating to each like so:

```TypeScript
  {
    id: 1,
    name: 'Green',
    image: 'green.jpg',
    description: 'Green tea description.',
    rating: 4
  },
```

For some of them, use zero. This will be the default value for tea categories that do not yet have a rating.

The rating is not part of the data coming back from our API, so the result set that we expect back from the API should not include it. Update `resultTeas` so it deletes the `rating` like is done for `image`:

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

Then update the setup and teardown code in order to mock the `Storage` Capacitor API. When mocking the `get()` function, the return values will need to match however you set the ratings in the test data:

```TypeScript
  ...
  beforeEach(() => {
    ...
      (Plugins.Storage.get as any) = jest.fn(({ key }: { key: string }) => {
      switch (key) {
        case 'rating1':
          return Promise.resolve({ value: 4 });
        // Repeat for all expectedTeas with a non-zero rating.
        // The key is `rating${id}`
        default:
          return Promise.resolve();
      }
    });
    (Plugins.Storage.set as any) = jest.fn();
  });
  ...
  afterEach(() => jest.restoreAllMocks());
  ...
```

#### Then Code

At this point you should have two failing tests. We need to update the code in `src/tea/TeaCategories.ts` to make them pass.

The first step is to make our private method `fromJsonToTea` asyncrhonous and have it grab the rating from storage:

```TypeScript
  ...
  private async fromJsonToTea(obj: any): Promise<Tea> {
    const { Storage } = Plugins;
    const rating = await Storage.get({ key: `rating${obj.id}` });
    return {
      ...obj,
      image: require(`../assets/images/${this.images[obj.id - 1]}.jpg`),
      rating: parseInt(rating?.value || '0', 10),
    };
  }
  ...
```

But this makes `getAll()` and `get()` unhappy. The `get()` method can be easily fixed by placing an `await` keyword as part of the return statement:

```TypeScript
    return await this.fromJsonToTea(body);
```

Fixing `getAll()` is a bit trickier. We still need to add the `async` keyword to our return statement, but we need to asynchronous our `map()` call and place it inside `Promise.all()` so that we return resolved tea items instead of an array of pending Promises:

```TypeScript
    return await Promise.all(
      body.map(async (item: any) => await this.fromJsonToTea(item)),
    );
```

Here is the full code for each of the methods:

```TypeScript
  async getAll(token: string): Promise<Array<Tea>> {
    const url = `${process.env.REACT_APP_DATA_SERVICE}/tea-categories`;
    const body = await this.request(url, token);
    return await Promise.all(
      body.map(async (item: any) => await this.fromJsonToTea(item)),
    );
  }

  async get(id: number, token: string): Promise<Tea | undefined> {
    const url = `${process.env.REACT_APP_DATA_SERVICE}/tea-categories/${id}`;
    const body = await this.request(url, token);
    return await this.fromJsonToTea(body);
  }
```

Your tests should now pass!

### Saving to Storage

Saving is pretty straightforward. Our `save()` method will take a full `Tea` model but we will only save the rating, since the tea category itself is currently read-only.

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

### Update the Hook

Recall that we have a custom React Hook named `useTeaCategories` where we place all of our tea data service logic. We'll be adding a new method called `save()` to this hook.

#### Test First

Let's go ahead and write a describe block for our new hook functionality. Open `src/tea/useTeaCategories.test.ts` and modify the test suite to include a describe block for saving a tea category:

```TypeScript
  ...
  describe('saves a tea category', () => {
    it('stores a rating for a specific tea category', async () => {
      const tea = {
        id: 1,
        name: 'Green',
        description: '',
        image: '',
        rating: 2,
      };
      teaCategories.save = jest.fn(() => Promise.resolve());
      const { result } = renderHook(() => useTeaCategories());
      await act(async () => {
        await result.current.save(tea);
      });
      expect(teaCategories.save).toHaveBeenCalledTimes(1);
    });
  });
  ...
  afterEach(() => {
    ...
  });
```

#### Then Code

Update `src/tea/useTeaCategories.ts` so that it has a `save` function and return it along with the other properties already returned by the hook:

```TypeScript
...
export const useTeaCategories = () => {
  ...
  const save = async (tea: Tea): Promise<void> => {
    return await teaCategories.save(tea);
  };

  return { error, getCategories, getCategory, save };
};
```

Now we can add it to our detail page!

## Details Page Modifications

Head back over to `src/tea/details/TeaDetails.tsx`. In this file we'll add `save` to our list of variables destructured from `useTeaCategories()` and add props to where we render the `<Rating />` component:

```TypeScript
...
const TeaDetails: React.FC<TeaDetailsProps> = ({ match }) => {
  const { getCategory, save } = useTeaCategories();
  ...
  return (
    ...
    <Rating
      onRatingChange={rating => save({ ...teaCategory!, rating })}
      initialRating={teaCategory?.rating}
      disabled={!teaCategory}
    />
    ...
  );
};
export default TeaDetails;
```

## Conclusion

Congratulations! You have created and consumed your first reusable component. Up next we will add tabbed navigation to our application.
