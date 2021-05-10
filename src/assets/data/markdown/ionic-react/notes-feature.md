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

```TypeScript
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

Create a new folder `src/tasting-notes/__mocks__` with a file `mockNotes.ts` within it.

**`src/tasting-notes/__mocks__/mockNotes.ts`**

```TypeScript
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

### `useTastingNotes` Hook

Add two files to `src/tasting-notes` - `useTastingNotes.tsx` and `useTastingNotes.test.tsx`.

**`src/tasting-notes/useTastingNotes.test.tsx`**

```TypeScript
import { renderHook, act } from '@testing-library/react-hooks';
import { TastingNote } from '../shared/models';
import { useTastingNotes } from './useTastingNotes';
import { mockNotes } from './__mocks__/mockNotes';

jest.mock('../core/auth/useAuthInterceptor', () => ({
  useAuthInterceptor: () => ({
    instance: {
      get: mockInstanceVerb,
      post: mockInstanceVerb,
      delete: mockInstanceVerb,
    },
  }),
}));

let mockInstanceVerb = jest.fn();

describe('useTastingNotes', () => {
  describe('get all notes', () => {
    beforeEach(() => {
      mockInstanceVerb = jest.fn(async () => ({ data: [mockNotes] }));
    });

    it('gets the notes', async () => {
      let notes: Array<TastingNote> = [];
      const { result } = renderHook(() => useTastingNotes());
      await act(async () => {
        notes = await result.current.getNotes();
      });
      expect(mockInstanceVerb).toHaveBeenCalledTimes(1);
      expect(notes).toEqual([mockNotes]);
    });
  });

  describe('get a singular note', () => {
    beforeEach(() => {
      mockInstanceVerb = jest.fn(async () => ({ data: mockNotes[0] }));
    });

    it('gets a single TastingNote', async () => {
      let note: TastingNote | undefined = undefined;
      const { result } = renderHook(() => useTastingNotes());
      await act(async () => {
        note = await result.current.getNoteById(4);
      });
      expect(mockInstanceVerb).toHaveBeenCalledTimes(1);
      expect(note).toEqual(mockNotes[0]);
    });
  });

  describe('delete a note', () => {
    beforeEach(() => {
      mockInstanceVerb = jest.fn(() => Promise.resolve());
    });

    it('deletes a single note', async () => {
      const { result } = renderHook(() => useTastingNotes());
      await act(async () => {
        await result.current.deleteNote(4);
      });
      expect(mockInstanceVerb).toHaveBeenCalledTimes(1);
    });
  });

  describe('save a note', () => {
    beforeEach(() => {
      mockInstanceVerb = jest.fn(() => Promise.resolve());
    });

    it('saves a single note', async () => {
      const { result } = renderHook(() => useTastingNotes());
      await act(async () => {
        await result.current.saveNote(mockNotes[0]);
      });
      expect(mockInstanceVerb).toHaveBeenCalledTimes(1);
    });
  });

  afterEach(() => jest.restoreAllMocks());
});
```

**`src/tasting-notes/useTastingNotes.tsx`**

```TypeScript
import { useCallback } from 'react';
import { useAuthInterceptor } from '../core/auth';
import { TastingNote } from '../shared/models';

export const useTastingNotes = () => {
  const { instance } = useAuthInterceptor();

  const getNotes = useCallback(async (): Promise<TastingNote[]> => {
    const url = `/user-tasting-notes`;
    const { data } = await instance.get(url);
    return data;
  }, [instance]);

  const getNoteById = useCallback(
    async (id: number): Promise<TastingNote> => {
      const url = `/user-tasting-notes/${id}`;
      const { data } = await instance.get(url);
      return data;
    },
    [instance],
  );

  const deleteNote = async (id: number): Promise<void> => {
    const url = `/user-tasting-notes/${id}`;
    await instance.delete(url);
  };

  const saveNote = async (note: TastingNote) => {
    let url = `/user-tasting-notes`;
    if (note.id) url += `/${note.id}`;
    await instance.post(url, note);
  };

  return { getNotes, getNoteById, deleteNote, saveNote };
};
```

## Create the Editor Component

Now we are getting into the new stuff. Back to the usual format. 🤓

Let's create a composite component that we can use to both create new tasting notes or update existing notes. This component will be created in the tasting notes feature folder since it is going to be specific to that feature of the application.

Create a new folder inside of `src/tasting-notes` named `editor`. Create the following files in `src/tasting-notes/editor`: `TastingNoteEditor.tsx` and `TastingNoteEditor.test.tsx`.

**`src/tasting-notes/editor/TastingNoteEditor.test.tsx`**

```TypeScript
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

```TypeScript
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

- A callback letting the parent component know that the user is ready to dimiss the editor
- An optional `TastingNote` to fit the use-case where the user wants to edit an existing note

Go ahead and add these props to our `TastingNoteEditor` component:

**`src/tasting-notes/editor/TastingNoteEditor.tsx`**

```TypeScript
...
import { TastingNote } from '../../shared/models';

interface TastingNoteEditorProps {
  onDismiss: () => void;
  note?: TastingNote;
}

const TastingNoteEditor: React.FC<TastingNoteEditorProps> = ({
  onDismiss,
  note = undefined,
}) => {
  return (
    <>
      ...
    </>
  );
};
export default TastingNoteEditor;
```

Since we have an optional prop, we should update our test file so that it generates snapshots for both the "new note" and "edit note" scenarios:

**`src/tasting-note/editor/TastingNoteEditor.test.tsx`**

```TypeScript
import { render, waitFor } from '@testing-library/react';
import TastingNoteEditor from './TastingNoteEditor';
import { mockNotes } from '../__mocks__/mockNotes';

describe('<TastingNoteEditor />', () => {
  let component: any;
  let mockDismiss = jest.fn();

  beforeEach(() => (component = <TastingNoteEditor onDismiss={mockDismiss} />));

  describe('save', () => {
    it('renders consistently', async () => {
      const { asFragment } = render(component);
      await waitFor(() => expect(asFragment()).toMatchSnapshot());
    });
  });

  describe('update', () => {
    beforeEach(
      () => (component = (<TastingNoteEditor onDismiss={mockDismiss} note={mockNotes[0]} />)),
    );

    it('renders consistently', async () => {
      const { asFragment } = render(component);
      await waitFor(() => expect(asFragment()).toMatchSnapshot());
    });
  });

  afterEach(() => jest.restoreAllMocks());
});
```

### Hooking Up the Modal

Before we get any deeper into building the editor let's get a modal overlay hooked up in `TastingNotesPage` for the "add a new note" case, allowing us to test the component out as we develop it.

We will launch the modal using a floating action button. We'll add a test case to display the editor modal then implement it:

**`src/tasting-notes/TastingNotesPage.test.tsx`**

```TypeScript
import { render, waitFor } from '@testing-library/react';
import { ionFireEvent as fireEvent } from '@ionic/react-test-utils';
import TastingNotesPage from './TastingNotesPage';

describe('<TastingNotesPage />', () => {
  it('renders consistently', () => {
    const { asFragment } = render(<TastingNotesPage />);
    expect(asFragment).toMatchSnapshot();
  });

  describe('add a new note', () => {
    it('displays the editor modal', async () => {
      const { getByText, getByTestId } = render(<TastingNotesPage />);
      const button = getByTestId(/fab-button/) as HTMLIonButtonElement;
      fireEvent.click(button);
      await waitFor(() =>
        expect(getByText('Add New Tasting Note')).toBeDefined(),
      );
    });
  });

  afterEach(() => jest.resetAllMocks());
});
```

**`src/tasting-notes/TastingNotesPage.tsx`**

```TypeScript
import { useState } from 'react';
...
import TastingNoteEditor from './editor/TastingNoteEditor';
import { add } from 'ionicons/icons';

const TastingNotesPage: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <IonPage>
      <IonHeader>
        ...
      </IonHeader>
      <IonContent>
        <IonHeader collapse="condense">
          ...
        </IonHeader>
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton
            data-testid="fab-button"
            onClick={() => setShowModal(true)}
          >
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
        <IonModal isOpen={showModal}>
          <TastingNoteEditor onDismiss={() => setShowModal(false)} />
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

```TypeScript
  ...
  import { ionFireEvent as fireEvent } from '@ionic/react-test-utils';
  ...
  describe('cancel button', () => {
    it('calls the dismiss function', () => {
      const { getByTestId } = render(component);
      const button = getByTestId(/cancel-button/) as HTMLIonButtonElement;
      fireEvent.click(button);
      expect(mockDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('save', () => {
    ...
  });
  ...
```

The cancel button will be part of the editor's header. Let's also throw in a `<form>` tag and a button to add a new note while we're here:

**`src/tasting-note/editor/TastingNoteEditor.tsx`**

```JSX
<>
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

  <IonContent>
    <form></form>
  </IonContent>

  <IonFooter>
    <IonToolbar>
      <IonButton expand="full">Add</IonButton>
    </IonToolbar>
  </IonFooter>
</>
```

#### Inputs

Let's start filling out that form. Add React Form Hook into our component:

**`src/tasting-notes/editor/TastingNoteEditor.tsx`**

```TypeScript
...
const TastingNoteEditor: React.FC<TastingNoteEditorProps> = ({...}) => {
  const {
    handleSubmit,
    control,
    formState: { isValid },
  } = useForm<TastingNote>({ mode: 'onChange' });

  return (
    <>
      ...
      <IonFooter>
        <IonToolbar>
         <IonButton
            data-testid="submit-button"
            expand="full"
            onClick={handleSubmit(() => {})}
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

We already have one simple form, the `LoginPage`. Over there we used a list of inputs, we will need something like that so let's use it as a model for the first couple of input fields here. All of the following code will go inside the `form` element:

```JSX
<IonList>
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
</IonList>
```

We need a way to select the category of tea that we have. Add the following `useState` statement under the declaration for `useForm`:

```TypeScript
  ...
  const [teas, setTeas] = useState<Tea[]>([]);
  ...
```

Then add the following template syntax underneath the "name" field created above:

```JSX
<IonItem>
  <IonLabel>Category</IonLabel>
  <Controller
    render={({ field: { onChange, value } }) => (
      <>
        {teas.length && (
          <IonSelect
            onIonChange={e => onChange(e.detail.value!)}
            value={value}
          >
            {teas.map((tea: Tea) => (
              <IonSelectOption key={tea.id} value={tea.id}>
                {tea.name}
              </IonSelectOption>
            ))}
          </IonSelect>
        )}
      </>
    )}
    control={control}
    name="teaCategoryId"
    defaultValue={note?.teaCategoryId || 1}
  />
</IonItem>
```

Under the category field, let's add a field for rating:

```JSX
 <IonItem>
  <IonLabel>Rating</IonLabel>
  <Controller
    render={({ field: { onChange, value } }) => (
      <Rating onRatingChange={onChange} initialRating={value} />
    )}
    control={control}
    name="rating"
    rules={{ required: true }}
    defaultValue={note?.rating || 0}
  />
</IonItem>
```

We're reusing the `Rating` component we built here, pretty neat!

Finally, we'll add a text area for some free-form notes on the tea tasted:

```JSX
 <IonItem>
  <IonLabel position="floating">Notes</IonLabel>
  <Controller
    render={({ field: { onChange, value } }) => (
      <IonTextarea
        data-testid="notes-input"
        onIonChange={e => onChange(e.detail.value!)}
        rows={5}
        value={value}
      />
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

#### Initialization

The only initialization logic the form needs at this point is the list of tea categories to bind to the `IonSelect` component. Import the list of mock teas then add a mock for the `useTea` hook into the editor's test file.

**`src/tasting-notes/editor/TastingNoteEditor.test.tsx`**

```TypeScript
...
import { resultTeas } from '../../tea/__mocks__/mockTeas';

const mockTeas = resultTeas();

jest.mock('../../tea/useTea', () => ({
  useTea: () => ({
    getTeas: jest.fn(() => Promise.resolve(mockTeas)),
  }),
}));
...
```

Add a new `describe()` block as a sibling to the 'save', 'update' and 'cancel button' blocks with the following unit test:

```TypeScript
describe('initialization', () => {
  it('binds the tea select', async () => {
    const { getByTestId } = render(component);
    const options = await waitFor(() => getByTestId(/category-select/));
    expect(options.children.length).toEqual(8);
    expect(options.children[0].textContent).toEqual('Green');
    expect(options.children[1].textContent).toEqual('Black');
  });
});
```

**Challenge:** Write a `useEffect` that gets the teas from `useTea` so that the test passes.

#### Perform the Add

To add a new note is relatively simple. Take the form data, call `saveNote()`, and dismiss the modal.

Add the following mock to `src/tasting-notes/editor/TastingNoteEditor.test.tsx`:

```TypeScript
jest.mock('../useTastingNotes', () => ({
  useTastingNotes: () => ({
    saveNote: jest.fn(() => Promise.resolve()),
  }),
}));
```

Add the following unit test into the 'save' `describe()` block:

```TypeScript
it('saves the note', async () => {
  const expected = { ...mockNotes[0] };
  // @ts-ignore
  delete expected.id;
  const { getByTestId } = render(component);
  const brand = await waitFor(() => getByTestId(/brand-input/));
  const name = await waitFor(() => getByTestId(/name-input/));
  const rating = await waitFor(() => getByTestId(/Rate 4 stars/));
  const notes = await waitFor(() => getByTestId(/notes-input/));
  const submit = await waitFor(() => getByTestId(/submit-button/));

  await waitFor(() => fireEvent.ionChange(brand, mockNotes[0].brand));
  await waitFor(() => fireEvent.ionChange(name, mockNotes[0].name));
  await waitFor(() => fireEvent.click(rating));
  await waitFor(() => fireEvent.ionChange(notes, mockNotes[0].notes));
  await waitFor(() => fireEvent.click(submit));

  expect(mockSaveNote).toHaveBeenCalledWith(expected);
  expect(mockSaveNote).toHaveBeenCalledTimes(1);
});
```

As we go back to implement the save in the component's code file, let's make these additional changes to the button in the footer:

- Set it's `type` to `submit`
- Disable the button if the form is invalid or dirty

**`src/tasting-notes/editor/TastingNoteEditor.tsx`**

```TypeScript
import React, { useEffect, useState } from 'react';
...

const TastingNoteEditor: React.FC<TastingNoteEditorProps> = ({ ...}) => {
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

```TypeScript
...
import { resultTeas } from '../tea/__mocks__/mockTeas';
import { mockNotes } from './__mocks__/mockNotes';

let mockGetNotes = jest.fn(async () => mockNotes);
jest.mock('./useTastingNotes', () => ({
  useTastingNotes: () => ({
    getNotes: mockGetNotes,
  }),
}));

describe('<TastingNotesPage />', () => {
  beforeEach(() => (mockGetNotes = jest.fn(async () => mockNotes)));
  ...
});
```

### Fetching Tasting Notes

Create a `describe()` block for the initialization of the page. It will be a sibling to the 'add a new note' `describe()` block.

```TypeScript
describe('initialization', () => {
  it('gets all of the notes', async () => {
    render(<TastingNotesPage />);
    await waitFor(() => expect(mockGetNotes).toHaveBeenCalledTimes(1));
  });

  it('displays the notes', async () => {
    const { container } = render(<TastingNotesPage />);
    await waitFor(() => {
      expect(container).toHaveTextContent(/Bently/);
      expect(container).toHaveTextContent(/Lipton/);
    });
  });
});
```

We should also update the it `'renders consistently'` test knowing that when we have initialization logic our tests need to have a `waitFor()` expression before we can make any assertions:

```TypeScript
it('renders consistently', async () => {
  const { asFragment } = render(<TastingNotesPage />);
  await waitFor(() => expect(asFragment).toMatchSnapshot());
});
```

We have initialized components a few times now. I will outline the changes to make to `TastingNotesPage` below.

**`src/tasting-notes/TastingNotesPage.tsx`**

```TypeScript
...
import { useTastingNotes } from './useTastingNotes';
import { TastingNote } from '../shared/models';

const TastingNotesPage: React.FC = () => {
  const { getNotes } = useTastingNotes();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [notes, setNotes] = useState<TastingNote[]>([]);

   useEffect(() => {
    (async () => {
      const notes = await getNotes();
      setNotes(notes.reverse());
    })();
  }, [getNotes]);

  return (
    <IonPage>
      ...
      <IonContent>
        {/* Place before the IonFab component */}
        <IonList>
          {notes.reverse().map((note, idx) => (
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

```TypeScript
interface TastingNoteEditorProps {
  onDismiss: (opts: { refresh: boolean }) => void;
  note?: TastingNote;
}
```

Update the `save` method and the close button accordingly.

Start by adding the `reset` property to the list of items destructured from `useForm()`:

```TypeScript
const {
    handleSubmit,
    control,
    formState: { isValid },
    reset
  } = useForm<TastingNote>({ mode: 'onChange' });
```

Then update the `save` method:

```TypeScript
const save = async (data: TastingNote) => {
  await saveNote(data);
  reset();
  onDismiss({refresh: true});
};
```

Finally update the cancel button's click event:

```TypeScript
  <IonButton data-testid="cancel-button" onClick={() => onDismiss({ refresh: false})}>
```

Add a handler to `TastingNotesPage` that:

1. Dismisses the modal
2. Checks if the list of notes should be refreshed
3. If so, fetches the list of tasting notes

**`src/tasting-notes/TastingNotesPage.tsx`**

```TypeScript
...
const TastingNotesPage: React.FC = () => {
  ...
  const handleOnDismiss = async (refresh: boolean) => {
    setShowModal(false);
    if (refresh) {
      const notes = await getNotes();
      setNotes(notes.reverse());
    }
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

```TypeScript
  describe('update', () => {
    beforeEach(() => {
      component = <TastingNoteEditor onDismiss={mockDismiss} note={mockNote} />;
      mockSaveNote = jest.fn(() => Promise.resolve());
    });

    it('renders consistently', async () => {
      const { asFragment } = render(component);
      await wait(() => expect(asFragment()).toMatchSnapshot());
    });

     it('sets the properties', async () => {
      const { getByTestId } = render(component);
      const brand = await waitFor(() => getByTestId(/brand-input/));
      const name = await waitFor(() => getByTestId(/name-input/));
      const notes = await waitFor(() => getByTestId(/notes-input/));
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

```TypeScript
const save = async (data: TastingNote) => {
  if (note?.id) data.id = note.id;
  await saveNote(data);
  onDismiss({ refresh: true });
};
```

Now we can load a note for editing and we can modify the data and have it saved. We should change some of the labels on the editor to reflect which action the application user is doing.

Add the following tests to the 'save' `describe()` block. They should all pass.

```TypeScript
it('has the add title', async () => {
  const { container } = render(component);
  await waitFor(() =>
    expect(container).toHaveTextContent(/Add New Tasting Note/),
  );
});

it('has the add button label', async () => {
  const { getByTestId } = render(component);
  const submit = await waitFor(() => getByTestId(/submit-button/));
  expect(submit.textContent).toEqual('Add');
});
```

Add the following tests to the 'update' `describe()` block. These tests should fail.

```TypeScript
it('has the update title', async () => {
  const { container } = render(component);
  await waitFor(() =>
    expect(container).toHaveTextContent(/Update Tasting Note/),
  );
});

it('has the update button label', async () => {
  const { getByTestId } = render(component);
  const submit = await waitFor(() => getByTestId(/submit-button/));
  expect(submit.textContent).toEqual('Update');
});
```

**Challenge:** I leave it to you to make the "update" tests pass.

### Update the Tasting Notes Page

Now that the editor has been modified to handle updating existing tasting notes in addition to adding new tasting notes, we need to update the tasting note page so application users can access this functionality.

Start by adding a new describe block in `TastingNotesPage.test.tsx`. It will be a sibling to the 'add a new note' `describe()` block.

**`src/tasting-notes/TastingNotesPage.test.tsx`**

```TypeScript
...
describe('update an existing note', () => {
  it('pre-populates the editor modal', async () => {
    const { getByText, getByTestId } = render(<TastingNotesPage />);
    const item = await waitFor(() => getByTestId(/note0/));
    fireEvent.click(item);
    await waitFor(() => {
      expect(getByText(/Update Tasting Note/)).toBeDefined();
    });
  });
});
...
});
```

To make this all work, we need to use state to update the `note` prop on `<TastingNoteEditor />` when:

- A specific note is clicked
- The floating action button is clicked
- The modal is dismissed

Let's go ahead and do that:

**`src/tasting-notes/TastingNotesPage.tsx`**

```TypeScript
...
const TastingNotesPage: React.FC = () => {
  ...
  const [selectedNote, setSelectedNote] = useState<TastingNote | undefined>(undefined);
  ...

  const handleOnDismiss = async (refresh: boolean) => {
    setShowModal(false);
    setSelectedNote(undefined);
    if (refresh) {
      const notes = await getNotes();
      setNotes(notes);
    }
  };

  const handleUpdateNote = (note: TastingNote) => {
    setSelectedNote(note);
    setShowModal(true);
  };

  const handleNewNote = () => {
    setSelectedNote(undefined);
    setShowModal(true);
  };

  return (
    <IonPage>
      ...
      <IonContent>
        ...
        <IonList>
          {notes.map((note, idx) => (
            <IonItem
              data-testid={`note${idx}`}
              key={idx}
              onClick={() => handleUpdateNote(note)}
            >
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
        <IonModal isOpen={showModal}>
          <TastingNoteEditor
            onDismiss={({ refresh }) => handleOnDismiss(refresh)}
            note={selectedNote}
          />
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

**`src/tasting-notes/TastingNotesPage.tsx`**

```JSX
<IonList>
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
          onClick={() => {handleDeleteNote(note.id!)}}>
          Delete
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  ))}
</IonList>
```

The accompanying code for `handleDeleteNote()` simply calls our hook and refreshes the list:

```TypeScript
const handleDeleteNote = async (id: number) => {
  await deleteNote(id);
  const notes = await getNotes();
  setNotes(notes.reverse());
};
```

**Extra Credit:** Add an alert to ask the user if they _really_ want to delete the note!

## Conclusion

Congratulations. You have used what we have learned to this point to add a whole new feature to your app. Along the way, you also exercised a few Framework components you had not used before. Next we will add some styling to the application.
