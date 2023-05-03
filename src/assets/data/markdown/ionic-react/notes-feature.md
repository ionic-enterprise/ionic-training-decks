# Lab: Add the Notes Feature

In this lab, we will take what we have learned so far and add a whole new feature to our application. Specifically, we will add the "Tasting Notes" feature. In addition to exercising some skills we have already learned, we will also use some framework components we have not seen yet. These will include:

- The modal overlay
- Various form elements
- The sliding `IonItem`

## Preliminary Items

There are a couple of preliminary items that we need to get out of the way first.

- Create a data model
- Create a hook that performs HTTP requests

Up to this point we've managed data within our application by tying a React Context and hook together so state and functionality can be shared between components. In the case of the tasting notes feature, we won't need to share state, so we are only going to build a hook.

### The `TastingNotes` Model

Add the following model in `src/models/TastingNote.ts` and make sure to update `src/models/index.ts` accordingly:

```typescript
export interface TastingNote {
  id?: number;
  brand: string;
  name: string;
  notes: string;
  rating: number;
  teaCategoryId: number;
}
```

### The `useTastingNotes` hook

This is a review of skills we have already learned. As such, the next steps provide you with enough information to get started, but expect you to do the heavy lifting. Let's get started. Here is the starting point for both the test and the code.

**`src/tasting-notes/useTastingNotes.test.tsx`**

```typescript
import { vi, Mock } from 'vitest';
import { render, renderHook, waitFor } from '@testing-library/react';
import { client } from '../api/backend-api';
import { TastingNote } from '../models';
import { useTastingNotes } from './useTastingNotes';

vi.mock('../api/backend-api');

describe('useTastingNotes', () => {
  let tastingNotes: TastingNote[];

  const initializeTestData = () => {
    tastingNotes = [
      {
        id: 1,
        brand: 'Lipton',
        name: 'Green',
        notes: 'Bland and dull, but better than their standard tea',
        rating: 2,
        teaCategoryId: 1,
      },
      {
        id: 3,
        brand: 'Rishi',
        name: 'Puer Tuo Cha',
        notes: 'Earthy with a bold a full flavor',
        rating: 5,
        teaCategoryId: 6,
      },
      {
        id: 42,
        brand: 'Rishi',
        name: 'Elderberry Healer',
        notes: 'Elderberry and ginger. Strong and healthy.',
        rating: 4,
        teaCategoryId: 7,
      },
    ];
  };

  beforeEach(() => {
    initializeTestData();
    vi.resetAllMocks();
    (client.get as Mock).mockResolvedValue({ data: tastingNotes });
  });

  describe('refresh', () => {
    it('gets the user tasting notes', async () => {});

    it('sets the notes data', async () => {});
  });

  describe('merge', () => {
    describe('a new note', () => {
      let note: TastingNote = {
        brand: 'Lipton',
        name: 'Yellow Label',
        notes: 'Overly acidic, highly tannic flavor',
        rating: 1,
        teaCategoryId: 3,
      };
    });

    describe('an existing note', () => {
      let note: TastingNote = {
        id: 1,
        brand: 'Lipton',
        name: 'Green Tea',
        notes: 'Kinda like Lite beer. Dull, but well executed.',
        rating: 3,
        teaCategoryId: 1,
      };
    });

    describe('remove', () => {
      it('deletes the new note', async () => {
        const { result } = renderHook(() => useTastingNotes());
        await waitFor(() => result.current.refresh());
      });

      it('removes the note from the notes list', async () => {
        const { result } = renderHook(() => useTastingNotes());
        await waitFor(() => result.current.refresh());
      });
    });
  });
});
```

**`src/tasting-notes/useTastingNotes.tsx`**

```typescript
import { useState } from 'react';
import { client } from '../api/backend-api';
import { TastingNote } from '../models';

export const useTastingNotes = () => {
  const [notes, setNotes] = useState<TastingNote[]>([]);

  const merge = async (note: TastingNote): Promise<TastingNote> => {
    return note;
  };

  const refresh = async (): Promise<void> => {};

  const remove = async (note: TastingNote): Promise<void> => {};

  return { notes, merge, refresh, remove };
};
```

**`src/tasting-notes/__mocks__/useTastingNotes.tsx`**

```typescript
import { vi } from 'vitest';

const merge = vi.fn().mockResolvedValue(undefined);
const refresh = vi.fn().mockResolvedValue(undefined);
const remove = vi.fn().mockResolvedValue(undefined);

export const useTastingNotes = vi.fn(() => ({ notes: [], merge, refresh, remove }));
```

#### `refresh`

We have done something functionally similar to `refresh` in the `TeaProvider`, in the `loadTeas` function. The main difference here is that we will not be using a `useEffect` to automatically load our notes. Look at the tests and code for `loadTeas` and implement the tests and function.

For the `refresh` function, the proper endpoint is `/user-tasting-notes`. THere is no need to transform the data, only to make sure `setNotes` is called to assign the data returned to `notes`.

The code to satisfy the tests should be straight forward, but feel free to use the `src/tea/TeaProvider.tsx` code to help guide you.

#### `merge`

The `merge()` will either add a new note or update an existing note. This is determined by the existence or absence of an ID on the note object.

When adding a new note, we need to:

- Post to the `/user-tasting-notes` endpoint with a payload of the note.
- That endpoint will return the posted object with the ID added. As such, we need to:
  - Add that object to the `notes` array using `setNotes`.
  - Return the new object.

Add the following tests within the `describe('a new note')` section:

```typescript
beforeEach(() => (client.post as Mock).mockResolvedValue({ data: { id: 73, ...note } }));

it('posts the new note', async () => {
  const { result } = renderHook(() => useTastingNotes());
  await waitFor(() => result.current.merge(note));
  expect(client.post).toHaveBeenCalledTimes(1);
  expect(client.post).toHaveBeenCalledWith('/user-tasting-notes', note);
});

it('resolves the saved note', async () => {
  const { result } = renderHook(() => useTastingNotes());
  const data = await waitFor(() => result.current.merge(note));
  expect(data).toEqual({ id: 73, ...note });
});

it('adds the note to the notes list', async () => {
  const { result } = renderHook(() => useTastingNotes());
  await waitFor(() => result.current.refresh());
  await waitFor(() => result.current.merge(note));
  expect(result.current.notes).toHaveLength(4);
  expect(result.current.notes[3]).toEqual({ id: 73, ...note });
});
```

Write the code in the `merge()` function to support that.

Updating a note is very similar:

- POST to the `/user-tasting-notes/:id` endpoint with a payload of the note, where `:id` is the `note.id`.
- That endpoint will return the posted object as save by the backend. As such, we need to:
  - Update that object within the `notes` array (find the index of it by ID, then replace the object).
  - Update the `notes` array to the updated array value by calling `setNotes()`.
  - Return the new object.

**Code Challenge:** your task is to:

1. Using the `describe('a new note')` tests as a model, create a set of tests for the "update" requirements within `describe('an existing note')`.
   1. The `beforeEach` sets up the mock to resolve to `{ data: note }`
   1. The POST test posts to the `/user-tasting-notes/1` endpoint
   1. The "resolves" test makes sure the `merge(note)` resolves to the `note`
   1. The "adds a note" test becomes an "updates the note" test, so no note is added (the length of `notes.value` is still 3), but the proper note has been modified
1. Update the `merge()` code accordingly.

#### `remove`

In order to remove a tasting note, we need to:

- send a DELETE to the `/user-tasting-notes/:id` endpoint, where `:id` is the `note.id`. There is no payload for this.
- Remove the note from the `notes.value` array.

**Code Challenge:** your task is to:

1. Add a `delete()` method to the `client` in the `backend-api.ts` mock file (Axios already supports this, we never had it in our mock because we did not need it yet).
1. Fill out the tests for the `remove()` function.
1. Add the code to the `remove()` function to satisfy these requirements

## Create the Editor Component

Now we are getting into newer territory. Namely creating a form component that will be used inside of an `IonModal`. As such, more details are provided here.

Let's create a composite component that we can use to create new tasting notes or update existing notes. Create a file called `src/tasting-notes/TastingNoteEditor.tsx` with the following contents:

```tsx
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/react';

type Props = { onDismiss: () => void };

export const TastingNoteEditor: React.FC<Props> = ({ onDismiss }) => {
  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tasting Note Editor</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <p>Hello!!!</p>
      </IonContent>
    </>
  );
};
```

Also create a `src/tasting-notes/TastingNoteEditor.test.tsx` file with the following contents:

```typescript
import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { TastingNoteEditor } from './TastingNoteEditor';

describe('<TastingNoteEditor />', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders without crashing', () => {
    const { baseElement } = render(<TastingNoteEditor onDismiss={() => vi.fn()} />);
    expect(baseElement).toBeDefined();
  });

  it('renders consistently', () => {
    const { asFragment } = render(<TastingNoteEditor onDismiss={() => vi.fn()} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
```

### Hookup the Modal

The first thing we need to do is get a modal overlay hooked up for the "add a new note" case. This will allow us to test out the component for the modal as we develop it. This will also get the infrastructure for the rest of our modifications in place. We will launch the modal for the "add a new note" scenario from a <a href="https://ionicframework.com/docs/api/fab" target="_blank">floating action button</a> on the `TastingNotesPage`.

First we need to set up the test for the `TastingNotesPage` view (`src/tasting-notes/TastingNotesPage.test.tsx`).

Add the following _outside_ of describe block:

```typescript
const present = vi.fn();
vi.mock('@ionic/react', async (getOriginal) => {
  const original: any = await getOriginal();
  return { ...original, useIonModal: vi.fn(() => [present, vi.fn()]) };
});
```

Next, add a `beforeEach` block within the `describe('<TastingNotesPage />')` block:

```typescript
beforeEach(() => vi.clearAllMocks());
```

Then add a describe block after the "renders consistently" test to testing when a new note is added:

```tsx
describe('adding a new note', () => {
  it('displays the modal', async () => {
    render(<TastingNotesPage />);
    fireEvent.click(screen.getByTestId('add-note-button'));
    await waitFor(() => expect(present).toHaveBeenCalledTimes(1));
  });
});
```

From here, the code and the markup in `src/tasting-notes/TastingNotesPage.tsx` are pretty easy:

```tsx
import {
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonModal,
} from '@ionic/react';
import { TastingNoteEditor } from './TastingNoteEditor';
import { add } from 'ionicons/icons';

const TastingNotesPage: React.FC = () => {
  const [present, dismiss] = useIonModal(TastingNoteEditor, { onDismiss: () => dismiss() });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tasting Notes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => present()} data-testid="add-note-button">
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};
export default TastingNotesPage;
```

### Basic Layout

Now that we can click on the FAB button and see the modal, let's return our attention to the `src/tasting-notes/TastingNoteEditor.tsx` file and start laying out the basics of our form. We already have title and a content section. We know we will need a button in the header that will allow the dialog to be cancelled. We will also need a button on the bottom that will be used for saving and dismissing.

- Add the `IonButtons` section within the `IonHeader>IonToolbar`.
- Add the `ion-text-center` class to the `IonTitle` element.
- Update the component imports.
- Define a stub function called `cancel`.
- Define a stub function called `submit`.

Here is the `IonButtons` markup for within the `IonHeader>IonToolbar`:

```tsx
<IonButtons slot="start">
  <IonButton data-testid="cancel-button" onClick={() => cancel()}>
    Cancel
  </IonButton>
</IonButtons>
<IonButtons slot="end">
  <IonButton strong={true} data-testid="submit-button" onClick={handleSubmit(() => submit())}>
    Add
  </IonButton>
</IonButtons>
```

The rest is left up to you. You should have several code samples to use at this point to determine how to update the imports and create the stubs.

**Note:** I generally just "console.log" from the stub functions to avoid linting errors and to prove my bindings are working.

Let's start filling out the form. We already have one simple form, the `LoginPage`. On that page we used a list of inputs. We will need something like that within this editor, so let's use that as a model for the first couple of input fields. All of the following items will go inside the `IonContent` component. Now is a good time to start filling out the validations as well.

Here is validation function:

```typescript
const validationSchema = yup.object({
  brand: yup.string().required().label('Brand'),
  name: yup.string().required().label('Name'),
});
```

The code for the component:

```typescript
const {
  handleSubmit,
  control,
  formState: { errors, isValid, touchedFields, dirtyFields },
} = useForm<TastingNote>({ mode: 'onTouched', resolver: yupResolver(validationSchema) });

const getClassNames = (field: keyof TastingNote) =>
  [
    errors[field] ? 'ion-invalid' : 'ion-valid',
    touchedFields[field] ? 'ion-touched' : 'ion-untouched',
    dirtyFields[field] ? 'ion-dirty' : 'ion-pristine',
  ].join(' ');

const cancel = () => onDismiss();
const submit = () => onDismiss();
```

And the template code to replace the `p` tag with:

```tsx
<form>
  <IonList lines="none">
    <IonItem>
      <Controller
        name="brand"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <IonInput
            label="Brand"
            labelPlacement="floating"
            value={value}
            onIonBlur={onBlur}
            onIonInput={(e) => onChange(e.detail.value!)}
            errorText={errors.brand?.message}
            className={getClassNames('brand')}
          />
        )}
      />
    </IonItem>
    <IonItem>
      <Controller
        name="name"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <IonInput
            label="Name"
            labelPlacement="floating"
            value={value}
            onIonBlur={onBlur}
            onIonInput={(e) => onChange(e.detail.value!)}
            errorText={errors.name?.message}
            className={getClassNames('name')}
          />
        )}
      />
    </IonItem>
  </IonList>
</form>
```

We need a way to select the type of tea that we have.

**Important!** `IonModal` components attach themselves to the `IonApp` component. This becomes troublesome in our case, because that means `TastingNoteEditor` can't access the list of teas:

(Ignore the missing bits, this is only intended for illustrative purposes)

```diff
  <IonApp>
+   <TastingNoteEditor />
    <Route path="/tabs">
      <TeaProvider>
        <Tabs />
      </TeaProvider>
    </Route>
  </IonApp>
```

To get around this restriction, let's pass the list of teas into `TastingNoteEditor` as a prop.

**`src/tasting-notes/TastingNotesPage.tsx`**

```diff
+ const { teas } = useTea();
  const [present, dismiss] = useIonModal(TastingNoteEditor, { onDismiss: () => dismiss(), teas });
```

**`src/tasting-notes/TastingNotesPage.test.tsx`**

```diff
  const present = vi.fn();
  vi.mock('@ionic/react', async (getOriginal) => {
    const original: any = await getOriginal();
    return { ...original, useIonModal: vi.fn(() => [present, vi.fn()]) };
  });
+ vi.mock('../tea/TeaProvider');
```

**`src/tasting-notes/TastingNoteEditor.tsx`**

```diff
type Props = {
  onDismiss: () => void;
+ teas: Tea[]
};
```

Let's add a `props` constant to `src/tasting-notes/TastingNoteEditor.test.tsx` (outside the describe block):

```typescript
const props = {
  onDismiss: vi.fn(),
  teas: [
    {
      id: 1,
      name: 'Green',
      image: '/assets/images/green.jpg',
      description:
        'Green teas have the oxidation process stopped very early on, leaving them with a very subtle flavor and ' +
        'complex undertones. These teas should be steeped at lower temperatures for shorter periods of time.',
      rating: 0,
    },
    {
      id: 2,
      name: 'Black',
      image: '/assets/images/black.jpg',
      description:
        'A fully oxidized tea, black teas have a dark color and a full robust and pronounced flavor. Black teas tend ' +
        'to have a higher caffeine content than other teas.',
      rating: 1,
    },
    {
      id: 3,
      name: 'Herbal',
      image: '/assets/images/herbal.jpg',
      description:
        'Herbal infusions are not actually "tea" but are more accurately characterized as infused beverages ' +
        'consisting of various dried herbs, spices, and fruits.',
      rating: 2,
    },
  ],
};
```

And adjust how we `render` the component in our tests:

```diff
- render(<TastingNoteEditor onDismiss={() => void 0}>);
+ render(<TastingNoteEditor {...props} >);
```

With this settled, we can now create a test to make sure that we map the teas to populate an `IonSelect`.

```tsx
it('binds the teas in the select', () => {
  render(<TastingNoteEditor {...props} />);
  const opts = screen.getByTestId('tea-categories');
  expect(opts).toHaveTextContent('Green');
  expect(opts).toHaveTextContent('Black');
  expect(opts).toHaveTextContent('Herbal');
});
```

Then we can switch back to `src/tasting-notes/TastingNoteEditor.tsx` and add the select data with the mapped state.

```tsx
<IonItem>
  <Controller
    name="teaCategoryId"
    control={control}
    render={({ field: { onChange, value } }) => (
      <IonSelect
        data-testid="tea-categories"
        label="Type"
        labelPlacement="floating"
        onIonChange={(e) => onChange(e.detail.value!)}
        value={value}
      >
        {teas.map((tea: Tea) => (
          <IonSelectOption key={tea.id} value={tea.id}>
            {tea.name}
          </IonSelectOption>
        ))}
      </IonSelect>
    )}
  />
</IonItem>
```

Update the validation schema to make `teaCategoryId` required:

```typescript
const validationSchema = yup.object({
  brand: yup.string().required().label('Brand'),
  name: yup.string().required().label('Name'),
  teaCategoryId: yup.number().required().label('Type of Tea'),
});
```

Add a rating:

```tsx
<IonItem>
  <IonLabel>Rating</IonLabel>
  <Controller
    name="rating"
    control={control}
    render={({ field: { onChange, value } }) => <Rating onRatingChange={onChange} rating={value} />}
  />
</IonItem>
```

```diff
const validationSchema = yup.object({
  brand: yup.string().required().label('Brand'),
  name: yup.string().required().label('Name'),
  teaCategoryId: yup.number().required().label('Type of Tea'),
+ rating: yup.number().required().label('Rating'),
});
```

And finally, add a text area for some free-form notes on the tea we just tasted:

```tsx
<IonItem>
  <Controller
    name="notes"
    control={control}
    render={({ field: { onChange, value } }) => (
      <IonTextarea
        label="Notes"
        labelPlacement="floating"
        rows={4}
        value={value}
        onIonInput={(e) => onChange(e.detail.value!)}
      />
    )}
  />
</IonItem>
```

Add a notes text validation. Make it required like `brand` and `name`.

That looks pretty good so far!

### Validation Tests

We have built up the validations as we went. Let's just add a simple test to verify some of the messages:

```typescript
it('displays messages as the user enters invalid data', async () => {
  render(<TastingNoteEditor {...props} />);
  const name = await waitFor(() => screen.getByLabelText('Name'));
  const brand = await waitFor(() => screen.getByLabelText('Brand'));
  const notes = await waitFor(() => screen.getByLabelText('Notes'));
  await waitFor(() => fireEvent.input(name, { target: { value: '' } }));
  await waitFor(() => fireEvent.blur(name));
  await waitFor(() => expect(screen.getByText(/Name is a required field/)).toBeInTheDocument());
  await waitFor(() => fireEvent.input(brand, { target: { value: '' } }));
  await waitFor(() => fireEvent.blur(brand));
  await waitFor(() => expect(screen.getByText(/Brand is a required field/)).toBeInTheDocument());
  await waitFor(() => fireEvent.input(notes, { target: { value: '' } }));
  await waitFor(() => fireEvent.blur(notes));
  await waitFor(() => expect(screen.getByText(/Notes is a required field/)).toBeInTheDocument());
});
```

That should all pass if we have coded everything correctly.

### Disable / Enable Button

The submit button at the top of the modal should be disabled until valid data is entered.

Test:

```typescript
describe('submit button', () => {
  it('is disabled until valid data is entered', async () => {
    const ionChangeEvent = new CustomEvent('ionChange', { detail: { value: '2' } });
    render(<TastingNoteEditor {...props} />);
    const button = screen.getByTestId('submit-button') as HTMLIonButtonElement;

    await waitFor(() => fireEvent.input(screen.getByLabelText('Brand'), { target: { value: 'foobar' } }));
    await waitFor(() => expect(button.disabled).toBeTruthy());

    await waitFor(() => fireEvent.input(screen.getByLabelText('Name'), { target: { value: 'mytea' } }));
    await waitFor(() => expect(button.disabled).toBeTruthy());

    await waitFor(() => fireEvent(screen.getByTestId('tea-categories'), ionChangeEvent));
    await waitFor(() => expect(button.disabled).toBeTruthy());

    await waitFor(() => fireEvent.click(screen.getAllByTestId('outline')[2]));
    await waitFor(() => expect(button.disabled).toBeTruthy());

    await waitFor(() => fireEvent.input(screen.getByLabelText('Notes'), { target: { value: 'Meh. It is ok.' } }));
    await waitFor(() => expect(button.disabled).toBeFalsy());
  });
});
```

The markup to enable this is super simple. We had already snuck in the `isValid` property earlier, so it is just a matter of binding it to the "Add" button's `disabled` property, just like we did in the login page before.

```tsx
disabled={!isValid}
```

### Save and Close

There are two buttons on the modal. One is the `submit-button` which is labelled "Add", and is not _really_ a submit button in that it does not submit the form, but we have given it that ID as it best describes the role the button will functionally fill. The other button is the `cancel-button`.

The `submit-button` needs to merge the tasting note. Both buttons need to close the dialog.

#### Modifications to the Test

Add the following to the top of the `src/components/__tests__/AppTastingNoteEditor.spec.ts` file:

```typescript
import { useTastingNotes } from './useTastingNotes';

vi.mock('./useTastingNotes');
```

Within the "submit button" describe block we will add another group of tests for when the button click is triggered:

```typescript
describe('on click', () => {
  beforeEach(async () => {
    const ionChangeEvent = new CustomEvent('ionChange', { detail: { value: '2' } });
    render(<TastingNoteEditor {...props} />);
    await waitFor(() => fireEvent.input(screen.getByLabelText('Brand'), { target: { value: 'foobar' } }));
    await waitFor(() => fireEvent.input(screen.getByLabelText('Name'), { target: { value: 'mytea' } }));
    await waitFor(() => fireEvent(screen.getByTestId('tea-categories'), ionChangeEvent));
    await waitFor(() => fireEvent.click(screen.getAllByTestId('outline')[2]));
    await waitFor(() => fireEvent.input(screen.getByLabelText('Notes'), { target: { value: 'Meh. It is ok.' } }));
  });

  it('merges the tasting note', async () => {
    const { merge } = useTastingNotes();
    const button = screen.getByTestId('submit-button') as HTMLIonButtonElement;
    fireEvent.click(button);
    await waitFor(() => expect(merge).toHaveBeenCalledTimes(1));
    expect(merge).toHaveBeenCalledWith({
      brand: 'foobar',
      name: 'mytea',
      rating: 3,
      teaCategoryId: 2,
      notes: 'Meh. It is ok.',
    });
  });

  it('closes the modal', async () => {
    const button = screen.getByTestId('submit-button') as HTMLIonButtonElement;
    fireEvent.click(button);
    await waitFor(() => expect(props.onDismiss).toHaveBeenCalledTimes(1));
  });
});
```

The cancel button tests will be similar, but with no data setup. We also will expect that the merge does not take place.

```typescript
describe('cancel button', () => {
  it('does not merge', async () => {
    const { merge } = useTastingNotes();
    render(<TastingNoteEditor {...props} />);
    const button = screen.getByTestId('cancel-button');
    fireEvent.click(button);
    await waitFor(() => expect(merge).not.toHaveBeenCalled());
  });

  it('closes the modal', async () => {
    render(<TastingNoteEditor {...props} />);
    const button = screen.getByTestId('cancel-button');
    fireEvent.click(button);
    await waitFor(() => expect(props.onDismiss).toHaveBeenCalledTimes(1));
  });
});
```

#### Modifications to the Code

The component already contains stubs for the `submit()` and `cancel()` functions. Here is the implementation for `submit()`. Filling out the `cancel()` function is left as an exercise to you:

```typescript
const submit = async (data: TastingNote) => {
  await merge(data);
  onDismiss();
};
```

## Listing the Tasting Notes

We can now theoretically add tasting notes, but we don't really know since we cannot see them. So now would be a good time to update the tasting notes page view to display the notes that we have in the store.

First, let's update the test (`src/tasting-notes/TastingNotesPage.test.tsx`) to include some notes.

Import and mock the `useTastingNotes` hook:

```typescript
...
import { useTastingNotes } from './useTastingNotes';
...
vi.mock('./useTastingNotes');
```

Update the main `beforeEach()` block, defining some tasting notes data:

```typescript
beforeEach(() => {
  (useTastingNotes as Mock).mockReturnValue({
    notes: [
      {
        id: 42,
        brand: 'Lipton',
        name: 'Green Tea',
        teaCategoryId: 3,
        rating: 3,
        notes: 'A basic green tea, very passable but nothing special',
      },
      {
        id: 314159,
        brand: 'Lipton',
        name: 'Yellow Label',
        teaCategoryId: 2,
        rating: 1,
        notes: 'Very acidic, even as dark teas go, OK for iced tea, horrible for any other application',
      },
      {
        id: 73,
        brand: 'Rishi',
        name: 'Puer Cake',
        teaCategoryId: 6,
        rating: 5,
        notes: 'Smooth and peaty, the king of puer teas',
      },
    ],
    refresh: vi.fn(),
  });
  vi.clearAllMocks();
});
```

We will need to load that data upon entering the page. That means that the page will need to call the `refresh()` function from `useTastingNotes()`. Let's create a test for that:

```tsx
it('refreshes the tasting notes data', async () => {
  const { refresh } = useTastingNotes();
  render(<TastingNotesPage />);
  await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
});
```

Now add the code to do this in `src/tasting-notes/TastingNotesPage.tsx`:

```diff
+ const { notes, refresh } = useTastingNotes();
  const { teas } = useTea();
  const [present, dismiss] = useIonModal(TastingNoteEditor, { onDismiss: () => dismiss(), teas });

+ useEffect(() => {
+   refresh();
+ }, []);
```

Our requirements are that if a note exists for this tea, we display it in the list, and that we display the `name` and the `brand` fields in the list. Let's test that now.

```typescript
it('displays the notes', () => {
  render(<TastingNotesPage />);
  expect(screen.getAllByText('Lipton')).toHaveLength(2);
  expect(screen.getAllByText('Green Tea')).toHaveLength(1);
  expect(screen.getAllByText('Yellow Label')).toHaveLength(1);
  expect(screen.getAllByText('Rishi')).toHaveLength(1);
  expect(screen.getAllByText('Puer Cake')).toHaveLength(1);
});
```

The key parts for all of this to work together is the following markup:

```tsx
<IonList>
  {notes
    .sort((a, b) => a.id! - b.id!)
    .map((note) => (
      <IonItem key={note.id}>
        <IonLabel>
          <div>{note.brand}</div>
          <div>{note.name}</div>
        </IonLabel>
      </IonItem>
    ))}
</IonList>
```

One final change is required here, and that is to refresh the list of notes after the modal has been dismissed. Update the usage of `useIonModal()` like so:

```typescript
const [present, dismiss] = useIonModal(TastingNoteEditor, { onDismiss: () => refresh().then(dismiss), teas });
```

**Note:** Typically we prefer to use the `async/await` syntax over `then/catch`, but in this case it allows us to keep all of the code above on one line in a neat and readable manner.

As you can see, the heavy lifting is all being done by our hook. Try adding a note, and you will see that the list is automatically updated.

## Update Notes

We can add notes, but it would also be good if we could update them.

### Modify the Editor

The editor component currently only handles creating new tasting notes. We also need to handle the case where we need to edit an existing tasting note. Add the following prop to the `Props` type of our `TastingNoteEditor` component:

```typescript
type Props = { onDismiss: () => void; teas: Tea[]; note?: TastingNote };
```

Let's add a mock tasting note outside of the `describe('<TastingNoteEditor />')` block:

```typescript
const note: TastingNote = {
  id: 73,
  brand: 'Rishi',
  name: 'Puer Cake',
  teaCategoryId: 6,
  rating: 5,
  notes: 'Smooth and peaty, the king of puer teas',
};
```

With that in place we can now start building out the changes to the editor and we can visually see the results as we go. Let's get started.

#### The Title

First, we should modify the title based on whether we are doing an add or an update.

```typescript
it('displays an appropriate title', () => {
  render(<TastingNoteEditor {...props} />);
  expect(screen.getByText('Add New Tasting Note')).toBeInTheDocument();
  cleanup();
  render(<TastingNoteEditor {...props} note={note} />);
  expect(screen.getByText('Update Tasting Note')).toBeInTheDocument();
});
```

So the add case has "Add New Tasting Note" where the update case just says "Update Tasting Note". Let's implement that in the code.

```tsx
<IonTitle className="ion-text-center">{note ? 'Update' : 'Add New'} Tasting Note</IonTitle>
```

#### The Button Label

**Challenge:** write a very similar test and computed property for the `submit-button`. It should have a label of "Add" when we are adding a new note and a label of "Update" when we are updating an existing note.

#### Load the Note

If we have a note when the editor is created, we need to use it as default values for the form:

```tsx
it('populates the data when editing a note', async () => {
  const { baseElement } = render(<TastingNoteEditor {...props} note={note} />);
  expect((baseElement.querySelector('[label="Brand"]') as HTMLInputElement).value).toBe('Rishi');
  expect((baseElement.querySelector('[label="Name"]') as HTMLInputElement).value).toBe('Puer Cake');
  expect((baseElement.querySelector('[label="Type"]') as HTMLInputElement).value).toBe(6);
  expect(screen.getAllByTestId('star')).toHaveLength(5);
  expect((baseElement.querySelector('[label="Notes"') as HTMLInputElement).value).toBe(
    'Smooth and peaty, the king of puer teas'
  );
});
```

We can then leverage the `reset()` method from React Hook Form to populate the form with the note data.

```diff
  const {
    handleSubmit,
    control,
    formState: { errors, isValid, touchedFields, dirtyFields },
+   reset,
  } = useForm<TastingNote>({ mode: 'onTouched', resolver: yupResolver(validationSchema) });

+ useEffect(() => {
+   note && reset(note);
+ }, [note]);
```

#### Save the Note

When saving the note, the value passed to the `merge()` should include the ID. Here is the test. Place this right after the existing "merges the tasting note" test.

```typescript
it('includes the ID when editing a note', async () => {
  cleanup();
  const { merge } = useTastingNotes();
  render(<TastingNoteEditor {...props} note={note} />);
  const button = screen.getByTestId('submit-button') as HTMLIonButtonElement;
  fireEvent.click(button);
  await waitFor(() => expect(merge).toHaveBeenCalledTimes(1));
  expect(merge).toHaveBeenCalledWith({
    id: 73,
    brand: 'Rishi',
    name: 'Puer Cake',
    teaCategoryId: 6,
    rating: 5,
    notes: 'Smooth and peaty, the king of puer teas',
  });
});
```

### Hookup the Editor

We can then modify the `TastingNotesPage` to pass along the `note` when a user clicks on the note in the list.

This requires a few minor edits. The first of which is to add a state variable to hold an optional `TastingNote` to pass as a prop to `TastingNoteEditor`:

```diff
  const { notes, refresh } = useTastingNotes();
+ const [note, setNote] = useState<TastingNote | undefined>(undefined);
  const { teas } = useTea();
  const [present, dismiss] = useIonModal(TastingNoteEditor, {
    onDismiss: () => refresh().then(dismiss),
    teas,
+   note
  });
```

Next, add some helper functions to `setNote` and `present` the modal, depending on the scenario.

```typescript
const handleAddNote = () => {
  setNote(undefined);
  present();
};

const handleUpdateNote = (note: TastingNote) => {
  setNote(note);
  present();
};
```

Then, modify the `onClick` handler of the `IonFabButton` like so:

```tsx
<IonFabButton onClick={() => handleAddNote()} data-testid="add-note-button">
```

Finally, adjust the `IonItem`:

```tsx
<IonItem key={note.id} button onClick={() => handleUpdateNote(note)}>
```

Now go add and edit some tasting notes to make sure everything still works when using the app.

## Delete a Note

The final feature we will add is the ability to delete a note. We will keep this one simple and make it somewhat hidden so that it isn't too easy for a user to delete a note.

We will use a construct called a <a href="https://ionicframework.com/docs/api/item-sliding" target="_blank">item sliding</a> to essentially "hide" the delete button behind the item. That way the user has to slide the item over in order to expose the button and do a delete.

Using this results in a little bit of rework in how the item is rendered and bound on the `TastingNotesPage`:

```tsx
<IonItemSliding key={note.id}>
  <IonItem button onClick={() => handleUpdateNote(note)}>
    <IonLabel>
      <div>{note.brand}</div>
      <div>{note.name}</div>
    </IonLabel>
  </IonItem>
  <IonItemOptions>
    <IonItemOption color="danger" onClick={() => remove(note)}>
      Delete
    </IonItemOption>
  </IonItemOptions>
</IonItemSliding>
```

For now, all you need to do in the code is grab the `remove` from `useTastingNotes()`:

```typescript
const { notes, refresh, remove } = useTastingNotes();
```

Play around with this in the browser and make sure everything is working.

## Final Cleanup

Let's put the browser in iPhone emulation mode and reload the app to make sure we are getting the iOS styling. Notice on the tea listing page we have what is called a <a href="https://ionicframework.com/docs/api/title#collapsible-large-titles">Collapsible Large Title</a>. On the tasting notes page, we do not have this, but we probably should because we essentially have a scrollable list. So let's add that.

First we'll add a "displays the title" test in `src/tasting-notes/TastingNotesPage.test.ts`.

```tsx
it('displays the title', () => {
  render(<TastingNotesPage />);
  const titleElements = screen.getAllByText('Tasting Notes');
  expect(titleElements).toHaveLength(2);
});
```

We then need to update the component template in `src/tasting-notes/TastingNotesPage.tsx`. Here is a synopsis of the changes:

- Add `translucent={true}` to the `IonHeader`.
- Add `fullscreen` to the `IonContent`.
- Add an `IonHeader` at the top of the `IonContent`. Its contents will be similar to the existing `IonHeader` with the following differences:
  - Instead of `translucent={true}`, set `collapse="condense"`.
  - On the `IonTitle`, set `size="large"`.
  - If you had anything else in the toolbar other than the title (which we do not in this case), remove it.

Have a look at `src/tea/TeaListPage.tsx` if you need a model for your changes.

## Conclusion

Congratulations. You have used what we have learned to this point to add a whole new feature to your app. Along the way, you also exercised a few Framework components you had not used before. We are almost done with this app.
