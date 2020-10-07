# Lab: Add the Notes Feature

In this lab you will:

- Take what you have learned so far and add a whole new feature
- Use some Ionic Framework components we have not seen yet, including:
- The modal overlay, various form elements, and the sliding IonItem

## Overview

Let's take what we've learned so far to add a whole new feature to our application. Specifically, we will add the "Tasting Notes" feature. In addition to exercising some skills we have already learned such as creating models, hooks, components, and pages, we will also use some Ionic Framework components we have not seen yet.

## Prelimary Items

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

### The `useTastingNotes` Hook

Create two more files inside `src/tasting-notes`: `useTastingNotes.tsx` and `useTastingNotes.test.tsx`.

**`src/tasting-notes/useTastingNotes.test.tsx`**

```TypeScript
import { renderHook, act, cleanup } from '@testing-library/react-hooks';
import apiInstance from '../core/apiInstance';
import { TastingNote } from '../shared/models';
import { useTastingNotes } from './useTastingNotes';

const mockNote = {
  id: 4,
  brand: 'Lipton',
  name: 'Yellow Label',
  notes: 'Overly acidic, highly tannic flavor',
  rating: 1,
  teaCategoryId: 3,
};

describe('useTea', () => {
  describe('get all notes', () => {
    beforeEach(() => {
      (apiInstance.get as any) = jest.fn(() =>
        Promise.resolve({ data: [mockNote] }),
      );

      it('gets the notes', async () => {
        let notes: Array<TastingNote> = [];
        const { result } = renderHook(() => useTastingNotes());
        await act(async () => {
          notes = await result.current.getNotes();
        });
        expect(apiInstance.get).toHaveBeenCalledTimes(1);
        expect(notes).toEqual([mockNote]);
      });
    });
  });

  describe('get a singular note', () => {
    beforeEach(() => {
      (apiInstance.get as any) = jest.fn(() =>
        Promise.resolve({ data: mockNote }),
      );
    });

    it('gets a single TastingNote', async () => {
      let note: TastingNote | undefined = undefined;
      const { result } = renderHook(() => useTastingNotes());
      await act(async () => {
        note = await result.current.getNoteById(4);
      });
      expect(apiInstance.get).toHaveBeenCalledTimes(1);
      expect(note).toEqual(mockNote);
    });
  });

  describe('delete a note', () => {
    beforeEach(() => {
      (apiInstance.delete as any) = jest.fn(() => Promise.resolve());
    });

    it('deletes a single note', async () => {
      const { result } = renderHook(() => useTastingNotes());
      await act(async () => {
        await result.current.deleteNote(4);
      });
      expect(apiInstance.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe('save a note', () => {
    beforeEach(() => {
      (apiInstance.post as any) = jest.fn(() => Promise.resolve());
    });

    it('saves a single note', async () => {
      const { result } = renderHook(() => useTastingNotes());
      await act(async () => {
        await result.current.saveNote(mockNote);
      });
      expect(apiInstance.post).toHaveBeenCalledTimes(1);
    });
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });
});
```

**`src/tasting-notes/useTastingNotes.tsx`**

```TypeScript
import { useCallback } from 'react';
import apiInstance from '../core/apiInstance';
import { TastingNote } from '../shared/models';

export const useTastingNotes = () => {
  const getNotes = useCallback(async (): Promise<Array<TastingNote>> => {
    const url = `${process.env.REACT_APP_DATA_SERVICE}/user-tasting-notes`;
    const { data } = await apiInstance.get(url);
    return data;
  }, []);

  const getNoteById = useCallback(async (id: number): Promise<TastingNote> => {
    const url = `${process.env.REACT_APP_DATA_SERVICE}/user-tasting-notes/${id}`;
    const { data } = await apiInstance.get(url);
    return data;
  }, []);

  const deleteNote = async (id: number): Promise<void> => {
    const url = `${process.env.REACT_APP_DATA_SERVICE}/user-tasting-notes/${id}`;
    await apiInstance.delete(url);
  };

  const saveNote = async (note: TastingNote) => {
    let url = `${process.env.REACT_APP_DATA_SERVICE}/user-tasting-notes`;
    if (note.id) url += `/${note.id}`;
    await apiInstance.post(url, note);
  };

  return { getNotes, getNoteById, deleteNote, saveNote };
};
```

## Create the Editor Component

Now we are getting into the new stuff. Back to the usual format. 🤓

Let's create a composite component that we can use to both create new tasting notes or update existing notes. This component will be created in the tasting notes feature folder since it is going to be specific to that feature of the application.

Create a new folder inside of `src/tasting-notes` named `editor`. Create the following files in `src/tasting-notes/editor`: `TastingNoteEditor.tsx` and `TastingNoteEditor.test.tsx`.

The editor will be a standalone component and not part of a page, which is why we're omitting "Page" from the name of the files.

**`src/tasting-notes/editor/TastingNoteEditor.test.tsx`**

```TypeScript
import React from 'react';
import { render } from '@testing-library/react';
import { cleanup } from '@testing-library/react-hooks';
import TastingNoteEditor from './TastingNoteEditor';

describe('<TastingNoteEditor />', () => {
  it('renders consistently', () => {
    const { asFragment } = render(<TastingNoteEditor />);
    expect(asFragment).toMatchSnapshot();
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });
});

```

**`src/tasting-notes/editor/TastingNoteEditor.tsx`**

```TypeScript
import React from 'react';
import { IonContent, IonFooter, IonHeader } from '@ionic/react';

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
import React from 'react';
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
describe('<TastingNoteEditor />', () => {
  let component: any;
  let mockDismiss = jest.fn();

  beforeEach(() => (component = <TastingNoteEditor onDismiss={mockDismiss} />));


  describe('save', () => {
    it('renders consistently', async () => {
      const { asFragment } = render(component);
      await wait(() => expect(asFragment()).toMatchSnapshot());
    });
  });

  describe('update', () => {
    beforeEach(() => (component = (
      <TastingNoteEditor onDismiss={mockDismiss} note={mockNote} />
    )));

    it('renders consistently', async () => {
      const { asFragment } = render(component);
      await wait(() => expect(asFragment()).toMatchSnapshot());
    });
  });
```

### Hooking Up the Modal

Before we get any deeper into building the editor let's get a modal overlay hooked up in `TastingNotesPage` for the "add a new note" case, allowing us to test the component out as we develop it.

We will launch the modal using a floating action button. We'll add a test case to display the editor modal then implement it:

**`src/tasting-notes/TastingNotesPage.test.tsx`**

```TypeScript
...
import { ionFireEvent as fireEvent } from '@ionic/react-test-utils';
...

describe('<TastingNotesPage />', () => {
  it('renders consistently', async () => {
    const { asFragment } = render(<TastingNotesPage />);
    await wait(() => expect(asFragment()).toMatchSnapshot());
  });

  describe('add a new note', () => {
    it('displays the editor modal', async () => {
      const { container, getByText } = render(<TastingNotesPage />);
      const button = container.querySelector('ion-fab-button')!;
      fireEvent.click(button);
      await wait(() => expect(getByText('Add New Tasting Note')).toBeDefined());
    });
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });
});
```

**`src/tasting-notes/TastingNotesPage.tsx`**

```TypeScript
import React, { useState } from 'react';
...
import TastingNoteEditor from './editor/TastingNoteEditor';

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
          <IonFabButton onClick={() => setShowModal(true)}>
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
  describe('cancel button', () => {
    it('calls the dismiss function', async () => {
      const { container } = render(component);
      const button = await waitForElement(
        () => container.querySelector('#cancel-button')!,
      );
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
        <IonButton id="cancel-button" onClick={() => onDismiss()}>
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
  const { handleSubmit, control, formState } = useForm<TastingNote>({
    mode: 'onChange',
  });
  return (
    <>
      ...
      <IonFooter>
        <IonToolbar>
          <IonButton expand="full" onClick={handleSubmit(() => { })}>Add</IonButton>
        </IonToolbar>
      </IonFooter>
    </>
  );
};
export default TastingNoteEditor;
```

We already have one simple form, the `LoginPage`. Over there we used a list of inputs, we will need something like that so let's use it as a model for the first couple of input fields here. All of the following code will go inside the `form` element:

```JSX
<IonItem>
  <IonLabel position="floating">Brand</IonLabel>
  <Controller
    render={({ onChange, value }) => (
      <IonInput
        id="brand-input"
        onIonChange={(e: any) => onChange(e.detail.value!)}
        value={value}
      />
    )}
    control={control}
    name="brand"
    rules={{ required: true }}
    defaultValue={note?.brand || ''}
  />
</IonItem>
<IonItem>
  <IonLabel position="floating">Name</IonLabel>
  <Controller
    render={({ onChange, value }) => (
      <IonInput
        id="name-input"
        onIonChange={(e: any) => onChange(e.detail.value!)}
        value={value}
      />
    )}
    control={control}
    name="name"
    rules={{ required: true }}
    defaultValue={note?.name || ''}
  />
</IonItem>
```

We need a way to select the category of tea that we have. Add the following `useState` statement under the declaration for `useForm`:

```TypeScript
  ...
  const [teas, setTeas] = useState<Array<Tea>>([]);
  ...
```

Then add the following template syntax underneath the "name" field created above:

```JSX
<IonItem>
  <IonLabel>Category</IonLabel>
  <Controller
    render={({ onChange, value }) => (
      <>
        {teas.length && (
          <IonSelect
            onIonChange={(e: any) => onChange(e.detail.value!)}
            value={value}>
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
    rules={{ required: true }}
    defaultValue={note?.teaCategoryId || 1}
  />
</IonItem>
```

Under the category field, let's add a field for rating:

```JSX
<IonItem>
  <IonLabel>Rating</IonLabel>
  <Controller
    render={({ onChange, value }) => (
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
    render={({ onChange, value }) => (
      <IonTextarea
        id="notes-input"
        onIonChange={(e: any) => onChange(e.detail.value!)}
        rows={5}
        value={value}
      />
    )}
    control={control}
    name="notes"
    rules={{ required: true }}
    defaultValue={note?.notes || ''}
  />
</IonItem>
```

### Wiring up the Form

We will now turn our attention to wiring the form up to submit tasting notes to the back end data service.

#### Initialization

The only initialization we need at this point is to fetch the list of tea categories to bind to our `ion-select` component. Add the following mock to `TastingNoteEditor.test.tsx`:

**`src/tasting-notes/editor/TastingNoteEditor.test.tsx`**

```TypeScript
const mockTeas = [
  {
    id: 7,
    name: 'White',
    image: 'assets/img/white.jpg',
    description: 'White tea description.',
    rating: 5,
  },
  {
    id: 8,
    name: 'Yellow',
    image: 'assets/img/yellow.jpg',
    description: 'Yellow tea description.',
    rating: 3,
  },
];
```

Add a mock for the `useTea` hook. We'll be using the `getTeas()` method in our initialization code:

```TypeScript
import React from 'react';
...
import TastingNoteEditor from './TastingNoteEditor';
jest.mock('../../tea/useTea', () => ({
  useTea: () => ({
    getTeas: jest.fn(() => Promise.resolve(mockTeas)),
  }),
}));
...
```

Like the cancel button, our initialization logic will run whether the user has the component in add or edit mode, so we'll make the "initialization" describe block a sibling of "save", "update", and "cancel button":

```TypeScript
...
describe('<TastingNoteEditor />', () => {
  ...
  describe('initialization', () => {
    it('binds the tea select', async () => {
      const { container } = render(component);
      const options = await waitForElement(
        () => container.querySelector('ion-select')!.children,
      );
      expect(options.length).toEqual(2);
      expect(options[0].textContent).toEqual('White');
      expect(options[1].textContent).toEqual('Yellow');
    });
  });
  ...
});
```

**Challenge:** Write a `useEffect` that gets the teas from `useTea` so that the test passes.

Once complete, you should notice that some tests in `TastingNotesPage.test.tsx` are broken. We also need to add `mockTeas` and our `useTea` mock to `TastingNotesPage.test.tsx`. Go ahead and do that - remember that the path will be `../tea/useTea` because `TastingNotesPage.test.tsx` is one directory level higher than our editor.

#### Perform the Add

To add a new note is relatively simple. Take the form data, call `saveNote()`, and dismiss the modal.

We need to mock out `useTastingNotes` in our test files:

**`src/tasting-notes/editor/TastingNoteEditor.test.tsx`**

```TypeScript
import React from 'react';
import { render, wait, waitForElement } from '@testing-library/react';
import { ionFireEvent as fireEvent } from '@ionic/react-test-utils';
import { cleanup } from '@testing-library/react-hooks';
import TastingNoteEditor from './TastingNoteEditor';
jest.mock('../../tea/useTea', () => (...);
jest.mock('../useTastingNotes', () => ({
  useTastingNotes: () => ({
    saveNote: mockSaveNote,
  }),
}));

let mockSaveNote = jest.fn(() => Promise.resolve());
...
describe('<TastingNoteEditor />', () => {
  let component: any;
  let mockDismiss = jest.fn();

  beforeEach(() => {
    component = <TastingNoteEditor onDismiss={mockDismiss} />;
    mockSaveNote = jest.fn(() => Promise.resolve());
  });
  ...
});
```

Now we can add the following unit test into our "save" describe block:

```TypeScript
it('saves the note', async () => {
  const expected = { ...mockNote };
  delete expected.id;
  const { container, getByLabelText } = render(component);
  const [brand, name, rating, notes, submit] = await waitForElement(() => [
    container.querySelector('#brand-input')!,
    container.querySelector('#name-input')!,
    getByLabelText(/Rate 1 stars/),
    container.querySelector('#notes-input')!,
    container.querySelector('[type="submit"]')! as HTMLIonButtonElement,
  ]);
  await wait(() => {
    fireEvent.ionChange(brand, mockNote.brand);
    fireEvent.ionChange(name, mockNote.name);
    fireEvent.click(rating);
    fireEvent.ionChange(notes, mockNote.notes);
    fireEvent.click(submit);
  });
  expect(mockSaveNote).toHaveBeenCalledWith(expected);
  expect(mockSaveNote).toHaveBeenCalledTimes(1);
});
```

As we go back to implement the save in the component's code file, let's make these additional changes to the button in the footer:

- Set it's `type` to `submit`
- Disable the button if the form is invalid

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
            type="submit"
            disabled={!formState.isValid}
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

First we need to provide mock functions for `useTastingNotes`:

**`src/tasting-notes/TastingNotesPage.test.tsx`**

```TypeScript
import React from 'react';
...
jest.mock('../tea/useTea', () => ({
  useTea: () => ({
    getTeas: jest.fn(() => Promise.resolve(mockTeas)),
  }),
}));
jest.mock('./useTastingNotes', () => ({
  useTastingNotes: () => ({
    getNotes: mockGetNotes
  }),
}));

let mockGetNotes = jest.fn(() => Promise.resolve(mockNotes));

const mockNotes: Array<TastingNote> = [
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

describe('<TastingNotesPage />', () => {
  beforeEach(() => {
    mockGetNotes = jest.fn(() => Promise.resolve(mockNotes));
  });
  ...
});
```

Then create a describe block for the initialization of the page:

```TypeScript
...
describe('<TastingNotesPage />', () => {
  ...
  describe('initialization', () => {
    it('gets all of the notes', async () => {
      render(<TastingNotesPage />);
      await wait(() => expect(mockGetNotes).toHaveBeenCalledTimes(1));
    });

    it('displays the notes', async () => {
      const { container } = render(<TastingNotesPage />);
      await wait(() => {
        expect(container).toHaveTextContent(/Bently/);
        expect(container).toHaveTextContent(/Lipton/);
      });
    });
  });
  ...
});
```

We've done component initialization a few times now, so I'm just going to outline the changes to make to `TastingNotesPage`:

**`src/tasting-notes/TastingNotesPage.tsx`**

```TypeScript
...
import { useTastingNotes } from './useTastingNotes';
import { TastingNote } from '../shared/models';

const TastingNotesPage: React.FC = () => {
  ...
  const { getNotes } = useTastingNotes();

  useEffect(() => {
    const init = async () => {
      const notes = await getNotes();
      setNotes(notes);
    };
    init();
  }, [getNotes]);

  return (
    <IonPage>
      ...
      </IonHeader>
      <IonContent>
        ...
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

The notes we have added so far show up, but when we add a new note it does not. We can easily fix that.

When `TastingNoteEditor` is dismissed, it should notify the parent component if a refresh is required. Let's update the `onDismiss` prop to reflect this:

**`src/tasting-notes/editor/TastingNoteEditor.tsx`**

```TypeScript
...
interface TastingNoteEditorProps {
  onDismiss: (opts: { refresh: boolean }) => void;
  note?: TastingNote;
}
...
```

Now when we call `onDismiss` within the component we must pass in a boolean that will let any consumers know if they should refresh or not.

Update `save` and the close button:

```TypeScript
...
  const save = async (data: TastingNote) => {
    await saveNote(data);
    onDismiss({ refresh: true });
  };

  return (
    ...
      <IonButton
        id="cancel-button"
        onClick={() => onDismiss({refresh: false})}>
      ...
      </IonButton>
    ...
  );
...
```

If the user chooses to dismiss the form before adding a note, there's no reason to refresh. Let's update `TastingNotesPage` to handle this:

**`src/tasting-notes/TastingNotesPage.tsx`**

```TypeScript
import React, { useEffect, useState } from 'react';
...
const TastingNotesPage: React.FC = () => {
  ...
  const handleOnDismiss = async (refresh: boolean) => {
    setShowModal(false);
    if (refresh) {
      const notes = await getNotes();
      setNotes(notes);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        ...
      </IonHeader>
      <IonContent>
        ...
        <IonModal isOpen={showModal}>
          <TastingNoteEditor
            onDismiss={({ refresh }) => handleOnDismiss(refresh)}
          />
        </IonModal>
      </IonContent>
    </IonPage>
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
      const { container } = render(component);
      const [brand, name, notes] = await waitForElement(() => [
        container.querySelector('#brand-input')!,
        container.querySelector('#name-input')!,
        container.querySelector('#notes-input')!,
      ]);
      expect(brand.getAttribute('value')).toEqual(mockNote.brand);
      expect(name.getAttribute('value')).toEqual(mockNote.name);
      expect(notes.getAttribute('value')).toEqual(mockNote.notes);
    });

    it('updates the data', async () => {
      const expected = { ...mockNote };
      expected.notes = "It's not good";
      const { container, getByLabelText } = render(component);
      const [brand, name, rating, notes, submit] = await waitForElement(() => [
        container.querySelector('#brand-input')!,
        container.querySelector('#name-input')!,
        getByLabelText(/Rate 1 stars/),
        container.querySelector('#notes-input')!,
        container.querySelector('[type="submit"]')! as HTMLIonButtonElement,
      ]);
      await wait(() => {
        fireEvent.ionChange(brand, mockNote.brand);
        fireEvent.ionChange(name, mockNote.name);
        fireEvent.click(rating);
        fireEvent.ionChange(notes, expected.notes);
        fireEvent.click(submit);
      });
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

#### Test First

Let's first add tests within the `save` describe block. These tests should pass:

```TypeScript
it('has the add title', async () => {
  const { container } = render(component);
  await wait(() =>
    expect(container).toHaveTextContent(/Add New Tasting Note/),
  );
});

it('has the add button label', async () => {
  const { container } = render(component);
  const submit = await waitForElement(
    () => container.querySelector('[type="submit"]')!,
  );
  expect((submit as HTMLIonButtonElement).textContent).toEqual('Add');
});
```

Now let's add their counterparts to the `update` describe block:

```TypeScript
it('has the update title', async () => {
  const { container } = render(component);
  await wait(() => expect(container).toHaveTextContent(/Tasting Note/));
});

it('has the update button label', async () => {
  const { container } = render(component);
  const submit = await waitForElement(
    () => container.querySelector('[type="submit"]')!,
  );
  expect((submit as HTMLIonButtonElement).textContent).toEqual('Update');
});
```

**Challenge:** I leave it to you to make the "update" tests pass.

### Update the Tasting Notes Page

Now that the editor has been modified to handle updating existing tasting notes in addition to adding new tasting notes, we need to update the tasting note page so application users can access this functionality.

Start by adding a new describe block in `TastingNotesPage.test.tsx`:

**`src/tasting-notes/TastingNotesPage.test.tsx`**

```TypeScript
...
jest.mock('./useTastingNotes', () => ({
  useTastingNotes: () => ({
    getNotes: mockGetNotes,
    getNote: mockGetNote,
  }),
}));

let mockGetNotes = jest.fn(() => Promise.resolve(mockNotes));
let mockGetNote = jest.fn(() => Promise.resolve(mockNotes[0]));
...
describe('<TastingNotesPage />', () => {
  beforeEach(() => {
    mockGetNotes = jest.fn(() => Promise.resolve(mockNotes));
    mockGetNote = jest.fn(() => Promise.resolve(mockNotes[0]));
  });
  ...
  describe('update an existing note', () => {
    it('prepopulates the editor modal', async () => {
      const { container, getByText } = render(<TastingNotesPage />);
      const firstNote = await waitForElement(
        () => container.querySelector('ion-item')!,
      );
      fireEvent.click(firstNote);
      await wait(() => {
        expect(getByText(/Bently/)).toBeDefined();
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

The final feature we will add is the ability to delete a ntoe. We will keep this one simple and make it somewhat hidden so that it isn't too easy for application users to delete notes.

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
  setNotes(notes);
};
```

**Extra Credit:** Add an alert to ask the user if they _really_ want to delete the note!

## Conclusion

Congratulations. You have used what we have learned to this point to add a whole new feature to your app. Along the way, you also exercised a few Framework components you had not used before. We are almost done with this app. One more page to go and we will be done.
