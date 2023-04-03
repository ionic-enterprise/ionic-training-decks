# Lab: Add the Notes Feature

In this lab you will:

- Take what you have learned so far and add a whole new feature
- Use some Ionic Framework components we have not seen yet, including:
- The modal overlay, various form elements, and the sliding IonItem

## Overview

Let's take what we've learned so far to add a whole new feature to our application. Specifically, we will add the "Tasting Notes" feature. In addition to exercising some skills we have already learned such as creating models, hooks, components, and pages, we will also use some Ionic Framework components we have not seen yet.

## Preliminary Items

Before we move onto new stuff, there are a couple of preliminary items that we need to get out of the way first:

- Create a data model
- Create a hook that interacts with our back end service

These are a couple things we have done multiple times now, so I will just give you the code to move things along. If you are still unsure on these items though, please review the code that is provided here.

### The `TastingNote` Model

Add the following shared model `TastingNote` and make sure to update the barrel file accordingly:

**`src/shared/models/TastingNote.ts`**

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

### Add Mock Data

Create a new folder `src/tasting-notes/__fixtures__` with a file `mockNotes.ts` within it.

**`src/tasting-notes/__fixtures__/mockNotes.ts`**

```typescript
import { TastingNote } from '../../shared/models';

export const mockNotes: TastingNote[] = [
  {
    id: 4,
    brand: 'Lipton',
    name: 'Yellow Label',
    notes: 'Overly acidic, highly tannic flavor',
    rating: 4,
    teaCategoryId: 1,
  },
  {
    id: 73,
    brand: 'Bently',
    name: 'Brown Label',
    notes: 'Essentially OK',
    rating: 3,
    teaCategoryId: 2,
  },
  {
    id: 42,
    brand: 'Lipton',
    name: 'Yellow Label',
    notes: 'Overly acidic, highly tannic flavor',
    rating: 1,
    teaCategoryId: 3,
  },
];
```

### `<TastingNotesProvider />` Provider and Hook

Add two files to `src/tasting-notes` - `TastingNotesProvider.tsx` and `TastingNotesProvider.test.tsx`.

**`src/tasting-notes/TastingNotesProvider.test.tsx`**

```tsx
import axios from 'axios';
import { renderHook, act } from '@testing-library/react-hooks';
import { TastingNotesProvider, useTastingNotes } from './TastingNotesProvider';
import { mockNotes } from './__fixtures__/mockNotes';

jest.mock('axios');
var mockedAxios = axios as jest.Mocked<typeof axios>;
jest.mock('../core/session/AuthInterceptorProvider', () => ({
  useAuthInterceptor: () => ({ api: mockedAxios }),
}));

const wrapper = ({ children }: any) => <TastingNotesProvider>{children}</TastingNotesProvider>;

describe('useTastingNotes()', () => {
  describe('gets all notes', () => {
    beforeEach(() => mockedAxios.get.mockResolvedValue({ data: mockNotes }));

    it('GETs tasting notes from the backend', async () => {
      const { result } = renderHook(() => useTastingNotes(), { wrapper });
      await act(async () => await result.current.getNotes());
      expect(mockedAxios.get).toHaveBeenCalledWith('/user-tasting-notes');
    });

    it('sets notes state', async () => {
      const { result } = renderHook(() => useTastingNotes(), { wrapper });
      await act(async () => await result.current.getNotes());
      expect(result.current.notes).toEqual(mockNotes.reverse());
    });
  });

  describe('delete a note', () => {
    beforeEach(() => mockedAxios.delete.mockResolvedValue({}));

    it('DELETEs a single note', async () => {
      const { result } = renderHook(() => useTastingNotes(), { wrapper });
      await act(async () => await result.current.deleteNote(4));
      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith('/user-tasting-notes/4');
    });
  });

  describe('save a note', () => {
    beforeEach(() => mockedAxios.post.mockResolvedValue({}));

    it('POSTs a single note', async () => {
      const { result } = renderHook(() => useTastingNotes(), { wrapper });
      await act(async () => await result.current.saveNote(mockNotes[0]));
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith('/user-tasting-notes/42', mockNotes[0]);
    });
  });

  afterEach(() => jest.restoreAllMocks());
});
```

**`src/tasting-notes/TastingNotesProvider.tsx`**

```tsx
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuthInterceptor, useSession } from '../core/session';
import { TastingNote } from '../shared/models';

export const TastingNotesContext = createContext<{
  notes: TastingNote[];
  getNotes: () => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
  saveNote: (note: TastingNote) => Promise<void>;
}>({
  notes: [],
  getNotes: () => {
    throw new Error('Method not implemented');
  },
  deleteNote: () => {
    throw new Error('Method not implemented');
  },
  saveNote: () => {
    throw new Error('Method not implemented');
  },
});

export const TastingNotesProvider: React.FC = ({ children }) => {
  const { session } = useSession();
  const { api } = useAuthInterceptor();
  const [notes, setNotes] = useState<TastingNote[]>([]);

  useEffect(() => {
    session === undefined && setNotes([]);
  }, [session]);

  const getNotes = useCallback(async () => {
    const { data } = await api.get('/user-tasting-notes');
    setNotes(data.reverse());
  }, [api]);

  const deleteNote = async (id: number): Promise<void> => {
    await api.delete(`/user-tasting-note/${id}`);
  };

  const saveNote = async (note: TastingNote) => {
    let url = `/user-tasting-notes`;
    if (note.id) url += `/${note.id}`;
    await api.post(url, note);
  };

  return (
    <TastingNotesContext.Provider value={{ notes, getNotes, deleteNote, saveNote }}>
      {children}
    </TastingNotesContext.Provider>
  );
};

export const useTastingNotes = () => {
  const { notes, getNotes, deleteNote, saveNote } = useContext(TastingNotesContext);

  if (notes === undefined) {
    throw new Error('useTastingNotes must be used within a TastingNotesProvider');
  }

  return { notes, getNotes, deleteNote, saveNote };
};
```

Finally, wrap the `<TastingNotesPage />` component with the provider in `Tabs.tsx`:

**`src/Tabs.tsx`**

```tsx
<Route exact path={`${url}/tasting-notes`}>
  <TastingNotesProvider>
    <TastingNotesPage />
  </TastingNotesProvider>
</Route>
```

## Create the Editor Component

Now we are getting into the new stuff. Back to the usual format. 🤓

Let's create a composite component that we can use to both create new tasting notes or update existing notes. This component will be created in the tasting notes feature folder since it is going to be specific to that feature of the application.

Create a new folder inside of `src/tasting-notes` named `editor`. Create the following files in `src/tasting-notes/editor`: `TastingNoteEditor.tsx` and `TastingNoteEditor.test.tsx`.

**`src/tasting-notes/editor/TastingNoteEditor.test.tsx`**

```tsx
import { render } from '@testing-library/react';
import TastingNoteEditor from './TastingNoteEditor';

describe('<TastingNoteEditor />', () => {
  it('renders consistently', () => {
    const { asFragment } = render(<TastingNoteEditor />);
    expect(asFragment).toMatchSnapshot();
  });

  afterEach(() => jest.restoreAllMocks());
});
```

**`src/tasting-notes/editor/TastingNoteEditor.tsx`**

```tsx
import { IonContent, IonFooter, IonHeader, IonTitle, IonToolbar } from '@ionic/react';

const TastingNoteEditor: React.FC = () => {
  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Add New Tasting Note</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent></IonContent>
      <IonFooter></IonFooter>
    </>
  );
};
export default TastingNoteEditor;
```

### Editor Props

The tasting note editor will need to a couple of inputs:

- A callback letting the parent component know that the user is ready to dismiss the editor
- An optional `TastingNote` to fit the use-case where the user wants to edit an existing note

Go ahead and add these props to our `TastingNoteEditor` component:

**`src/tasting-notes/editor/TastingNoteEditor.tsx`**

```tsx
...
import { TastingNote } from '../../shared/models';

export interface TastingNoteEditorProps {
  onDismiss: () => void;
  note?: TastingNote;
}

const TastingNoteEditor: React.FC<TastingNoteEditorProps> = ({ onDismiss, note = undefined }) => {
  return (
    <>
      ...
    </>
  );
};
export default TastingNoteEditor;
```

Since we have an optional prop, we should update our test file so that it contains describe blocks for both the "new note" and "edit note" scenarios:

**`src/tasting-note/editor/TastingNoteEditor.test.tsx`**

```tsx
/* eslint-disable testing-library/no-wait-for-snapshot */
import { render, screen, waitFor } from '@testing-library/react';
import TastingNoteEditor from './TastingNoteEditor';
import { mockNotes } from '../__fixtures__/mockNotes';

describe('<TastingNoteEditor />', () => {
  let component: any;
  let mockDismiss = jest.fn();

  describe('save', () => {
    beforeEach(() => (component = <TastingNoteEditor onDismiss={mockDismiss} />));

    it('renders consistently', async () => {
      const { asFragment } = render(component);
      await waitFor(() => expect(asFragment()).toMatchSnapshot());
    });
  });

  describe('update', () => {
    beforeEach(() => (component = <TastingNoteEditor onDismiss={mockDismiss} note={mockNotes[0]} />));

    it('renders consistently', async () => {
      const { asFragment } = render(component);
      await waitFor(() => expect(asFragment()).toMatchSnapshot());
    });
  });

  afterEach(() => jest.restoreAllMocks());
});
```

Your test output is going to note that you need

### Hooking Up the Modal

Before we get any deeper into building the editor let's get a modal overlay hooked up in `TastingNotesPage` so we can view the component as we develop it.

The modal will be launched when a floating action button is pressed:

**`src/tasting-notes/TastingNotesPage.tsx`**

```tsx
import { useState } from 'react';
...
import { add } from 'ionicons/icons';
import TastingNoteEditor from './editor/TastingNoteEditor';

const TastingNotesPage: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleOnDismiss = () => {
    setIsOpen(false);
  };

  return (
    <IonPage>
      <IonContent>
        <IonHeader collapse="condense">
          ...
        </IonHeader>

         <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setIsOpen(true)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>


        <IonModal ref={modal} trigger="add-note">
          <TastingNoteEditor onDismiss={handleOnDismiss} />
        </IonModal>

      </IonContent>
    </IonPage>
  );
};
export default TastingNotesPage;
```

### Mock the Editor Component

#### Basic Layout

Let's lay down some basics of the form's UI.

First we're going to tackle the cancel button. Since this action behaves the same whether the user is adding a new note or updating an existing one, we'll place tests for it within it's own describe block:

**`src/tasting-notes/editor/TastingNoteEditor.test.tsx`**

```tsx
import { ionFireEvent as fireEvent } from '@ionic/react-test-utils';
...
  describe('cancel button', () => {
    it('calls the dismiss function', () => {
      render(<TastingNoteEditor onDismiss={mockDismiss} />);
      const button = (await screen.findByTestId(/cancel-button/)) as HTMLIonButtonElement;
      fireEvent.click(button);
      expect(mockDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('save', () => {
    ...
  });
...
```

The cancel button will be part of the editor's header:

**`src/tasting-note/editor/TastingNoteEditor.tsx`**

```tsx
<IonHeader>
  <IonToolbar>
    <IonTitle>Add New Tasting Note</IonTitle>
    <IonButtons slot="primary">
      <IonButton data-testid="cancel-button" onClick={() => onDismiss()}>
        <IonIcon slot="icon-only" icon={close} />
      </IonButton>
    </IonButtons>
  </IonToolbar>
</IonHeader>
```

Populate the `<IonFooter />` component with an `<IonToolbar />` and "add" button:

```tsx
<IonFooter>
  <IonToolbar>
    <IonButton expand="full">Add</IonButton>
  </IonToolbar>
</IonFooter>
```

#### Inputs

Start by adding some plumbing for React Hook Form:

**`src/tasting-notes/editor/TastingNoteEditor.tsx`**

```typescript
const {
  handleSubmit,
  control,
  formState: { isValid },
} = useForm<TastingNote>({ mode: 'onChange' });
```

Add an `<IonList />` component within the `<IonContent>` tags:

**`src/tasting-notes/editor/TastingNoteEditor.tsx`**

```tsx
<IonContent>
  <IonList></IonList>
</IonContent>
```

Let's adjust the footer button so it calls `handleSubmit()`:

```tsx
<IonFooter>
<IonToolbar>
  <IonButton data-testid="submit-button" expand="full" onClick={handleSubmit(() => {})}>
    Add
  </IonButton>
</IonToolbar>
```

Let's start adding input fields. These fields will be added within the `<IonList>` components.

```tsx
<IonItem>
  <IonLabel position="floating">Brand</IonLabel>
  <Controller
    render={({ field: { onChange, value } }) => (
      <IonInput
        data-testid="brand-input"
        onIonChange={e => onChange(e.detail.value!)}
        value={value}
      />
    )}
    control={control}
    name="brand"
    rules={{ required: true, minLength: 1 }}
    defaultValue={note?.brand || ''}
  />
</IonItem>
<IonItem>
  <IonLabel position="floating">Name</IonLabel>
  <Controller
    render={({ field: { onChange, value } }) => (
      <IonInput
        data-testid="name-input"
        onIonChange={e => onChange(e.detail.value!)}
        value={value}
      />
    )}
    control={control}
    name="name"
    rules={{ required: true, minLength: 1 }}
    defaultValue={note?.name || ''}
  />
</IonItem>
```

We need a way to select the category of tea that we have. Add the following mock to `TastingNoteEditor.test.tsx`:

**`src/tasting-notes/editor/TastingNoteEditor.test.tsx`**

```typescript
const mockTeas = expectedTeas;
jest.mock('../../tea/TeaProvider', () => ({
  useTea: () => ({ teas: mockTeas }),
}));
```

Next, add the list of teas from the `useTea()` hook:

**`src/tasting-notes/editor/TastingNoteEditor.tsx`**

```typescript
const TastingNoteEditor: React.FC<TastingNoteEditorProps> = ({ onDismiss, note = undefined }) => {
  ...
  const { teas } = useTea();
  ...
};
export default TastingNoteEditor;
```

Then add the following `<IonItem />` after the "name" field:

```tsx
<IonItem>
  <IonLabel>Category</IonLabel>
  <Controller
    render={({ field: { onChange, value } }) => (
      <IonSelect onIonChange={(e) => onChange(e.detail.value!)} value={value}>
        {teas.map((tea: Tea) => (
          <IonSelectOption key={tea.id} value={tea.id}>
            {tea.name}
          </IonSelectOption>
        ))}
      </IonSelect>
    )}
    control={control}
    name="teaCategoryId"
    defaultValue={note?.teaCategoryId || 1}
  />
</IonItem>
```

Under the category field, let's add a field for rating:

```tsx
<IonItem>
  <IonLabel>Rating</IonLabel>
  <Controller
    render={({ field: { onChange, value } }) => <Rating onRatingChange={onChange} initialRating={value} />}
    control={control}
    name="rating"
    rules={{ required: true }}
    defaultValue={note?.rating || 0}
  />
</IonItem>
```

We're reusing the `Rating` component we built here, pretty neat!

Finally, we'll add a text area for some free-form notes on the tea tasted:

```tsx
<IonItem>
  <IonLabel position="floating">Notes</IonLabel>
  <Controller
    render={({ field: { onChange, value } }) => (
      <IonTextarea data-testid="notes-input" onIonChange={(e) => onChange(e.detail.value!)} rows={5} value={value} />
    )}
    control={control}
    name="notes"
    rules={{ required: true, minLength: 1 }}
    defaultValue={note?.notes || ''}
  />
</IonItem>
```

### Wiring up the Form

We will now turn our attention to wiring the form up to submit tasting notes to the backend data service.

#### Perform the Add

To add a new note is relatively simple. Take the form data, call `saveNote()`, and dismiss the modal.

Add the following mock to `src/tasting-notes/editor/TastingNoteEditor.test.tsx`:

```typescript
let mockSaveNote = jest.fn(() => Promise.resolve());
jest.mock('../TastingNotesProvider', () => ({
  useTastingNotes: () => ({
    saveNote: mockSaveNote,
  }),
}));
```

Add the following unit test into the 'save' `describe()` block:

```typescript
it('saves the note', async () => {
  const { id, ...expected } = mockNotes[0];
  render(component);
  const brand = (await screen.findByTestId(/brand-input/)) as HTMLIonInputElement;
  const name = (await screen.findByTestId(/name-input/)) as HTMLIonInputElement;
  const rating = await screen.findByTestId(/Rate 4 stars/);
  const notes = (await screen.findByTestId(/notes-input/)) as HTMLIonTextareaElement;
  const submit = (await screen.findByTestId(/submit-button/)) as HTMLIonButtonElement;

  fireEvent.ionChange(brand, mockNotes[0].brand);
  fireEvent.ionChange(name, mockNotes[0].name);
  fireEvent.click(rating);
  fireEvent.ionChange(notes, mockNotes[0].notes);
  fireEvent.click(submit);

  await waitFor(() => expect(mockSaveNote).toHaveBeenCalledTimes(1));
  expect(mockSaveNote).toHaveBeenCalledWith(expected);
});
```

As we go back to implement the save in the component's code file, let's make these additional changes to the button in the footer:

- Set it's `type` to `submit`
- Disable the button if the form is invalid or dirty

**`src/tasting-notes/editor/TastingNoteEditor.tsx`**

```tsx
const TastingNoteEditor: React.FC<TastingNoteEditorProps> = ({ ... }) => {
  ...
  const { saveNote } = useTastingNotes();
  ...

  const save = async (data: TastingNote) => {
    await saveNote(data);
    onDismiss();
  };

  return (
    <>
      ...
      <IonFooter>
        <IonToolbar>
          <IonButton
            data-testid="submit-button"
            type="submit"
            disabled={!isValid}
            expand="full"
            onClick={handleSubmit(data => save(data))}
          >
            Add
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </>
  );
};
export default TastingNoteEditor;
```

Our tests pass, and if you are serving the application you'll see the modal dismisses after a new tasting note is added. Nice!

## List the Tasting Notes

We can add notes all day long, but we cannot see them. Let's shift back to the tasting notes page and do a little work. When we come into the page, we want to display the existing notes in a simple list.

### Mocks and Test Data

Do some pre-work to provide the appropriate mocks and test data for the tasting notes page's test file.

**`src/tasting-notes/TastingNotesPage.test.tsx`**

```typescript
...
import { mockNotes } from './__fixtures__/mockNotes';

let mockGetNotes = jest.fn(() => Promise.resolve());
jest.mock('./TastingNotesProvider', () => ({
  useTastingNotes: () => ({
    getNotes: mockGetNotes,
    notes: mockNotes,
  }),
}));
```

### Fetching Tasting Notes

Create a `describe()` block for the initialization of the page. It will be a sibling to the 'add a new note' `describe()` block.

```tsx
describe('initialization', () => {
  it('gets all of the notes', async () => {
    render(<TastingNotesPage />);
    await waitFor(() => expect(mockGetNotes).toHaveBeenCalledTimes(1));
  });

  it('displays the notes', () => {
    render(<TastingNotesPage />);
    expect(screen.getByText(/Bently/)).toBeInTheDocument();
  });
});
```

We have initialized components a few times now. I will outline the changes to make to `TastingNotesPage` below.

**`src/tasting-notes/TastingNotesPage.tsx`**

```tsx
...
import { useTastingNotes } from './useTastingNotes';
import { TastingNote } from '../shared/models';

const TastingNotesPage: React.FC = () => {
  const { notes, getNotes } = useTastingNotes();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    getNotes();
  }, [getNotes]);

   const handleOnDismiss = () => {
    setIsOpen(false);
  };

  return (
    <IonPage>
      ...
      <IonContent>
        {/* Place before the IonFab component */}
        <IonList>
          {notes.map((note, idx) => (
            <IonItem key={idx}>
              <IonLabel>
                <div>{note.brand}</div>
                <div>{note.name}</div>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
        ...
      </IonContent>
    </IonPage>
  );
};
export default TastingNotesPage;
```

## Refreshing Tasting Notes

The existing notes stored in the backend data service show up but when we add a new note it does not. Let's update the page such that when a new tasting note has been added we refresh the list of tasting notes.

Start by updating the `onDismiss` property in `TastingNoteEditor`. When the modal is dismissed, we will notify the consuming component if a refresh is required.

**`src/tasting-notes/editor/TastingNoteEditor.tsx`**

```typescript
interface TastingNoteEditorProps {
  onDismiss: (opts: { refresh: boolean }) => void;
  note?: TastingNote;
}
```

Update the `save` method and the close button accordingly.

Start by adding the `reset` property to the list of items destructured from `useForm()`:

```typescript
const {
  handleSubmit,
  control,
  formState: { isValid },
  reset,
} = useForm<TastingNote>({ mode: 'onChange' });
```

Then update the `save` method:

```typescript
const save = async (data: TastingNote) => {
  await saveNote(data);
  reset();
  onDismiss({ refresh: true });
};
```

Finally update the cancel button's click event:

```tsx
<IonButton data-testid="cancel-button" onClick={() => onDismiss({ refresh: false})}>
```

Add a handler to `TastingNotesPage` that:

1. Dismisses the modal
2. Checks if the list of notes should be refreshed
3. If so, fetches the list of tasting notes

**`src/tasting-notes/TastingNotesPage.tsx`**

```tsx
...
const TastingNotesPage: React.FC = () => {
  ...
  const handleOnDismiss = async (refresh: boolean) => {
    setIsOpen(false);
    if (refresh) await getNotes();
  };

  return (
    ...
    <TastingNoteEditor onDismiss={({refresh}) => handleOnDismiss(refresh)} />
    ...
  );
};
export default TastingNotesPage;
```

## Edit a Note

It would be nice to be able to go back and either view or modify tasting notes that had been previously created.

### Modify the Editor

A good first step will be to start by modifying the editor such that it should have a different title and different button text based on whether or not a note is passed.

Let's make use of the `update` describe block we created in `TastingNoteEditor.test.tsx`:

**`src/tasting-notes/editor/TastingNoteEditor.test.tsx`**

```tsx
describe('update', () => {
  beforeEach(() => {
    component = <TastingNoteEditor onDismiss={mockDismiss} note={mockNote} />;
  });

  it('renders consistently', async () => {
    const { asFragment } = render(component);
    await waitFor(() => expect(asFragment()).toMatchSnapshot());
  });

  it('sets the properties', async () => {
    render(component);
    const brand = (await screen.findByTestId(/brand-input/)) as HTMLIonInputElement;
    const name = (await screen.findByTestId(/name-input/)) as HTMLIonInputElement;
    const notes = (await screen.findByTestId(/notes-input/)) as HTMLIonTextareaElement;
    expect(brand.getAttribute('value')).toEqual(mockNotes[0].brand);
    expect(name.getAttribute('value')).toEqual(mockNotes[0].name);
    expect(notes.getAttribute('value')).toEqual(mockNotes[0].notes);
  });

  it('updates the data', async () => {
    const expected = { ...mockNotes[0] };
    expected.notes = "It's not good";
    expected.rating = 1;
    const { getByTestId } = render(component);
    const brand = await waitFor(() => getByTestId(/brand-input/));
    const name = await waitFor(() => getByTestId(/name-input/));
    const rating = await waitFor(() => getByTestId(/Rate 1 stars/));
    const notes = await waitFor(() => getByTestId(/notes-input/));
    const submit = await waitFor(() => getByTestId(/submit-button/));

    await waitFor(() => fireEvent.ionChange(brand, mockNotes[0].brand));
    await waitFor(() => fireEvent.ionChange(name, mockNotes[0].name));
    await waitFor(() => fireEvent.click(rating));
    await waitFor(() => fireEvent.ionChange(notes, expected.notes));
    await waitFor(() => fireEvent.click(submit));

    expect(mockSaveNote).toHaveBeenCalledWith(expected);
    expect(mockSaveNote).toHaveBeenCalledTimes(1);
  });
});
```

Updating the data is very similar to saving the data - it's a simple copy and paste job with a few extra steps.

Refactoring the `save()` method is to handle the new requirement is straight forward. Here is one way of doing it:

```typescript
const save = async (data: TastingNote) => {
  if (note?.id) data.id = note.id;
  await saveNote(data);
  reset();
  onDismiss({ refresh: true });
};
```

Now we can load a note for editing and we can modify the data and have it saved. We should change some of the labels on the editor to reflect which action the application user is doing.

Add the following tests to the 'save' `describe()` block. They should all pass.

```typescript
it('has the add title', async () => {
  const { container } = render(component);
  await waitFor(() => expect(container).toHaveTextContent(/Add New Tasting Note/));
});

it('has the add button label', async () => {
  render(component);
  const submit = (await screen.findByTestId(/submit-button/)) as HTMLIonButtonElement;
  expect(submit.textContent).toEqual('Add');
});
```

Add the following tests to the 'update' `describe()` block. These tests should fail.

```typescript
it('has the update title', async () => {
  const { container } = render(component);
  await waitFor(() => expect(container).toHaveTextContent(/Update Tasting Note/));
});

it('has the update button label', async () => {
  render(component);
  const submit = (await screen.findByTestId(/submit-button/)) as HTMLIonButtonElement;
  expect(submit.textContent).toEqual('Update');
});
```

**Challenge:** I leave it to you to make the "update" tests pass.

### Update the Tasting Notes Page

Now that the editor has been modified to handle updating existing tasting notes in addition to adding new tasting notes, we need to update the tasting note page so application users can access this functionality.

To make this all work, we need to use state to update the `note` prop on `<TastingNoteEditor />` when:

- A specific note is clicked
- The floating action button is clicked
- The modal is dismissed

Let's go ahead and do that:

**`src/tasting-notes/TastingNotesPage.tsx`**

```tsx
...
const TastingNotesPage: React.FC = () => {
  ...
  const [selectedNote, setSelectedNote] = useState<TastingNote | undefined>(undefined);
  ...

  const handleOnDismiss = async (refresh: boolean) => {
    setIsOpen(false);
    setSelectedNote(undefined);
    if (refresh) await getNotes();
  };

  const handleUpdateNote = (note: TastingNote) => {
    setSelectedNote(note);
    setIsOpen(true);
  };

  const handleNewNote = () => {
    setSelectedNote(undefined);
    setIsOpen(true);
  };

  return (
    <IonPage>
      ...
      <IonContent>
        ...
        <IonList>
          {notes.map((note, idx) => (
            <IonItem key={idx} onClick={() => handleUpdateNote(note)}>
              <IonLabel>
                <div>{note.brand}</div>
                <div>{note.name}</div>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => handleNewNote()}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
        <IonModal isOpen={isOpen}>
          <TastingNoteEditor onDismiss={({ refresh }) => handleOnDismiss(refresh)} note={selectedNote} />
        </IonModal>
      </IonContent>
    </IonPage>
  );
};
export default TastingNotesPage;
```

## Delete a Note

The final feature we will add is the ability to delete a note. We will keep this one simple and make it somewhat hidden so that it isn't too easy for application users to delete notes.

We will use <a href="https://ionicframework.com/docs/api/item-sliding" target="_blank">item-sliding</a> to essentially "hide" the delete button behind the item. That way the application user has to slide the item over in order to expose the button and perform a delete.

This results in a little bit of re-work in the way the item is rendered and bound:

First, add a reference we can use for the `<IonList />`. This will allow us to programmatically close any items that have been slid open:

**`src/tasting-notes/TastingNotesPage.tsx`**

```typescript
...
const [selectedNote, setSelectedNote] = useState<TastingNote | undefined>(undefined);
const list = useRef<HTMLIonListElement>(null);
...
```

Then, modify the component template:

**`src/tasting-notes/TastingNotesPage.tsx`**

```tsx
<IonList ref={list}>
  {notes.map((note, idx) => (
    <IonItemSliding key={idx}>
      <IonItem onClick={() => handleUpdateNote(note)}>
        <IonLabel>
          <div>{note.brand}</div>
          <div>{note.name}</div>
        </IonLabel>
      </IonItem>
      <IonItemOptions>
        <IonItemOption
          color="danger"
          onClick={() => {
            handleDeleteNote(note.id!);
          }}
        >
          Delete
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  ))}
</IonList>
```

Finally, use the accompanying code for `handleDeleteNote()`:

```typescript
const handleDeleteNote = async (id: number) => {
  await list.current?.closeSlidingItems();
  await deleteNote(id);
  await getNotes();
};
```

**Extra Credit:** Add an alert to ask the user if they _really_ want to delete the note!

## Conclusion

Congratulations. You have used what we have learned to this point to add a whole new feature to your app. Along the way, you also exercised a few Framework components you had not used before. Next we will add some styling to the application.
