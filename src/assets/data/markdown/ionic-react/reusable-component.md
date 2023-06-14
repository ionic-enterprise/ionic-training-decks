# Lab: Create a Rating Component

In this lab you will:

- Add a reusable component
- Use the component in the details page

## The Ratings Component

We will be creating a reusable component that is used to give up to a five-star rating to a tea.

### Create the Component Skeleton

Create a `src/components/rating/Rating.tsx` file with the following contents:

```tsx
import './Rating.css';

export const Rating: React.FC = () => <div>Rating Component is Working</div>;
```

Also create an empty file `src/components/rating/Rating.css`, and `src/components/rating/Rating.test.tsx` with the following contents:

```tsx
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Rating } from './Rating';

describe('<Rating />', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders consistently', () => {
    const { asFragment } = render(<Rating />);
    expect(asFragment()).toMatchSnapshot();
  });
});
```

### Use the Component

In order to see the component as we develop it, let's start using it right away in `TeaDetailsPage`:

- Add `<Rating />` under the description
- `import { Rating } from '../../components/rating/Rating';`

Update the snapshot and navigate to the tea details page and verify that you see "Rating Component is Working" after the description for the tea.

### Build up the UI

We don't want a component that just tells us that it works; we want a series of 5 stars that show us a rating.

Import the following icons in `src/components/rating/Rating.tsx`:

```typescript
import { star, starOutline } from 'ionicons/icons';
```

Our first unit test in `src/components/rating/Rating.test.tsx` will just ensure that we get 5 outlined star icons by default.

```tsx
it('renders five empty stars', () => {
  render(<Rating />);
  const icons = screen.getAllByTestId('outline');
  expect(icons).toHaveLength(5);
});
```

This test should fail at this point. We will now start building our design in `src/components/rating/Rating.tsx`.

```tsx
<div className="rating">
  {[1, 2, 3, 4, 5].map((num, idx) => (
    <IonIcon key={idx} icon={starOutline} data-testid="outline" />
  ))}
</div>
```

If we look at a tea details page in the browser we should see five outlined stars instead of our prior "Rating Component is Working" text that we had before.

Next, let's add a way to supply a rating to the component. Define the `Props` type outside of the component definition.

```typescript
type Props = {
  rating?: number;
};
```

Next, let's make the component respect the prop. First the test:

```tsx
it('fills in the first 3 stars', () => {
  render(<Rating rating={3} />);
  const icons = screen.getAllByTestId('star');
  expect(icons).toHaveLength(3);
});
```

To get this test to pass, the icon binding in the template changes a bit:

```tsx
icon={num <= rating ? star : starOutline}
```

`rating` is an optional prop, so we need to provide a default value for it:

```typescript
export const Rating: React.FC<Props> = ({ rating = 0 }) => ( ... );
```

Change the `data-testid` such that filled-in star icons have a test ID of `star` and outlined star icons have a test ID of `outline`.

The final bit is to get the component to respond to click events:

```tsx
it('emits the change rating change event on click', () => {
  const handleRatingChange = vi.fn();
  render(<Rating rating={3} onRatingChange={handleRatingChange} />);
  const icons = screen.getAllByTestId('outline');
  fireEvent.click(icons[0]);
  expect(handleRatingChange).toHaveBeenCalledTimes(1);
  expect(handleRatingChange).toHaveBeenCalledWith(4);
});
```

Add an optional event handler to the `Prop` type:

```typescript
onRatingChange?: (rating: number) => any;
```

Set a default value in the component function signature:

```typescript
export const Rating: React.FC<Props> = ({ rating = 0, onRatingChange = () => void 0 }) => ( ... );
```

I leave it to you to wire up the `onClick` event handler in the component template.

For now, let's add some placeholder code within the component definition in `src/pages/tea-detail/TeaDetailsPage.tsx`:

```typescript
const [rating, setRating] = useState<number>(2);
```

And add some props to the `Rating` component:

```tsx
<Rating rating={rating} onRatingChange={(r) => setRating(r)} />
```

Try this out in the tea details page in the browser. You should now be able to click on the value and it will change. Neat! 🥳

### Style the Component

So far this works well, but the stars are a little small and close together, especially for people with larger hands. Let's apply a little style to make that better.

**`src/components/rating/Rating.css`**:

```css
.rating ion-icon {
  font-size: 24px;
  padding-right: 12px;
  color: gold;
}

.rating ion-icon:last-child {
  padding-right: 0px;
}
```

## Conclusion

Congratulations. You have created and consumed your first reusable component.
