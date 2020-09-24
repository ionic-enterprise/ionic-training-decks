# Lab: Add the Notes Feature

In this lab you will:

- Take what you have learned so far and add a whole new feature
- Use some Ionic Framework components we have not seen yet, including:
- The modal overlay, various form elements, and the sliding Ion Item

## Overview

Let's take what we've learned so far to add a whole new feature to our application. Specifically, we will add the "Tasting Notes" feature. In addition to exercising some skills we have already learned such as creating models, data service singletons, components, and pages, we will also use some Ionic Framework components we have not seen yet.

## Prelimary Items

Before we move onto new stuff, there are a couple of preliminary items that we need to get out of the way first:

- Create a data model
- Create a data service singleton that performs HTTP requests
- Create a hook to abstract our data service singleton from component logic

These are a couple things we have done multiple times now, so I will just give you the code to move things along. If you are still unsure on these items though, please review the code that is provided here.

### The `TastingNote` Model

Add the following model in `src/models/TastingNote.ts` and make sure to update the barrel file accordingly:

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

### The `TastingNotes` Singleton

Create two files inside `src/tasting-notes`: `TastingNotesService.tsx` and `TastingNotesService.test.tsx`.

#### Test First

Fill in `TastingNotesService.test.tsx` with the following:

```TypeScript
import { TastingNote } from '../models';
import TastingNotesSingleton, { TastingNotesService } from './TastingNotesService';

const mockToken = '3884915llf950';

describe('TastingNotesService', () => {
  let tastingNotesService: TastingNotesService;

  beforeEach(() => {
    tastingNotesService = TastingNotesSingleton.getInstance();
    (window.fetch as any) = jest.fn(() => {
      return Promise.resolve({
        json: () => Promise.resolve(),
      });
    });
  });

  it('should use the singleton instance', () => {
    expect(tastingNotesService).toBeDefined();
  });

  describe('get all', () => {
    it('GETs the user tasting notes', async () => {
      await tastingNotesService.getAll(mockToken);
      expect(window.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('get', () => {
    it('GETs a specific note', async () => {
      await tastingNotesService.get(mockToken, 4);
      expect(window.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('DELETEs a specific note', async () => {
      await tastingNotesService.delete(mockToken, 4);
      expect(window.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('save', () => {
    it('POSTs a new note', async () => {
      const note: TastingNote = {
        brand: 'Lipton',
        name: 'Yellow Label',
        notes: 'Overly acidic, highly tannic flavor',
        rating: 1,
        teaCategoryId: 3,
      };
      await tastingNotesService.save(mockToken, note);
      expect(window.fetch).toHaveBeenCalledTimes(1);
    });

    it('saves an existing note', async () => {
      const note: TastingNote = {
        id: 7,
        brand: 'Lipton',
        name: 'Yellow Label',
        notes: 'Overly acidic, highly tannic flavor',
        rating: 1,
        teaCategoryId: 3,
      };
      await tastingNotesService.save(mockToken, note);
      expect(window.fetch).toHaveBeenCalledTimes(1);
    });
  });

  afterEach(() => {
    (window.fetch as any).mockRestore();
  });
});
```

#### Then Code

Place the following code inside `TastingNotesService.tsx`:

```TypeScript
import { TastingNote } from '../models';

export class TastingNotesService {
  async getAll(token: string): Promise<Array<TastingNote>> {
    const url = `${process.env.REACT_APP_DATA_SERVICE}/user-tasting-notes`;
    return await this.request(url, token);
  }

  async get(token: string, id: number): Promise<TastingNote> {
    const url = `${process.env.REACT_APP_DATA_SERVICE}/user-tasting-notes/${id}`;
    return await this.request(url, token);
  }

  async delete(token: string, id: number): Promise<void> {
    const options = { method: 'DELETE' };
    const url = `${process.env.REACT_APP_DATA_SERVICE}/user-tasting-notes/${id}`;
    return await this.request(url, token, options);
  }

  async save(token: string, note: TastingNote): Promise<void> {
    const options = { method: 'POST' };
    let url = `${process.env.REACT_APP_DATA_SERVICE}/user-tasting-notes`;
    if (note.id) url += `/${note.id}`;
    return await this.request(url, token, options);
  }

  private async request(
    url: string,
    token: string,
    options: any = undefined,
  ): Promise<any> {
    const headers = { Authorization: 'Bearer ' + token };
    const response = await fetch(url, { ...options, headers });
    return await response.json();
  }
}

export default class TastingNotesSingleton {
  private static instance: TastingNotesService | undefined = undefined;

  static getInstance(): TastingNotesService {
    if (this.instance === undefined) this.instance = new TastingNotesService();
    return this.instance;
  }
}
```

### The `useTastingNotes` Hook

Create two more files inside `src/tasting-notes`: `useTastingNotes.ts` and `useTastingNotes.test.ts`

#### Test First

Fill in `useTastingNotes.test.ts`:

```TypeScript
import { renderHook, act, cleanup } from '@testing-library/react-hooks';
import { useTastingNotes } from './useTastingNotes';
import IdentitySingleton, { Identity } from '../auth/Identity';
import TastingNotesSingleton, {
  TastingNotesService,
} from './TastingNotesService';
import { TastingNote } from '../models';
import { doesNotThrow } from 'assert';

const mockToken = '3884915llf950';
const mockNote = {
  id: 4,
  brand: 'Lipton',
  name: 'Yellow Label',
  notes: 'Overly acidic, highly tannic flavor',
  rating: 1,
  teaCategoryId: 3,
};

describe('useTastingNotes', () => {
  let identity: Identity;
  let tastingNotesService: TastingNotesService;

  beforeEach(() => {
    identity = IdentitySingleton.getInstance();
    identity['_token'] = mockToken;
    tastingNotesService = TastingNotesSingleton.getInstance();
  });

  describe('get all user tasting notes', () => {
    it('returns an array of TastingNote', async () => {
      tastingNotesService.getAll = jest.fn(() => Promise.resolve([]));
      let notes: Array<TastingNote> | undefined;
      const { result } = renderHook(() => useTastingNotes());
      await act(async () => {
        notes = await result.current.getAllNotes();
      });
      expect(notes).toEqual([]);
    });

    it('sets an error if there is a failure', async () => {
      const error = 'Uh-oh, something went wrong!';
      tastingNotesService.getAll = jest.fn(() => {
        throw new Error(error);
      });
      const { result } = renderHook(() => useTastingNotes());
      await act(async () => {
        await result.current.getAllNotes();
      });
      expect(result.current.error).toEqual(error);
    });
  });
  describe('get the specific user tasting note', () => {
    it('returns the specific TastingNote', async () => {
      tastingNotesService.get = jest.fn(() => Promise.resolve(mockNote));
      let note: TastingNote | undefined;
      const { result } = renderHook(() => useTastingNotes());
      await act(async () => {
        note = await result.current.getNote(4);
      });
      expect(note).toEqual(mockNote);
    });

    it('sets an error if there is a failure', async () => {
      const error = 'Uh-oh, something went wrong!';
      tastingNotesService.get = jest.fn(() => {
        throw new Error(error);
      });
      const { result } = renderHook(() => useTastingNotes());
      await act(async () => {
        await result.current.getNote(4);
      });
      expect(result.current.error).toEqual(error);
    });
  });

  describe('delete the specific user tasting note', () => {
    it('returns the specific TastingNote', async () => {
      tastingNotesService.delete = jest.fn(() => Promise.resolve());
      const { result } = renderHook(() => useTastingNotes());
      await act(async () => {
        await result.current.deleteNote(4);
      });
      expect(tastingNotesService.delete).toHaveBeenCalledTimes(1);
    });

    it('sets an error if there is a failure', async () => {
      const error = 'Uh-oh, something went wrong!';
      tastingNotesService.delete = jest.fn(() => {
        throw new Error(error);
      });
      const { result } = renderHook(() => useTastingNotes());
      await act(async () => {
        await result.current.deleteNote(4);
      });
      expect(result.current.error).toEqual(error);
    });
  });

  describe('save the specific user tasting note', () => {
    it('saves a specific TastingNote', async () => {
      tastingNotesService.save = jest.fn(() => Promise.resolve());
      const { result } = renderHook(() => useTastingNotes());
      await act(async () => {
        await result.current.saveNote(mockNote);
      });
      expect(tastingNotesService.save).toBeCalledTimes(1);
    });

    it('saves a new TastingNote', async () => {
      const note = { ...mockNote };
      delete note.id;
      tastingNotesService.save = jest.fn(() => Promise.resolve());
      const { result } = renderHook(() => useTastingNotes());
      await act(async () => {
        await result.current.saveNote(note);
      });
      expect(tastingNotesService.save).toBeCalledTimes(1);
    });

    it('sets an error if there is a failure', async () => {
      const error = 'Uh-oh, something went wrong!';
      tastingNotesService.save = jest.fn(() => {
        throw new Error(error);
      });
      const { result } = renderHook(() => useTastingNotes());
      await act(async () => {
        await result.current.saveNote(mockNote);
      });
      expect(result.current.error).toEqual(error);
    });
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });
});
```

#### Then Code

Fill in `useTastingNotes.ts`:

```TypeScript
import { useState } from 'react';
import IdentitySingleton from '../auth/Identity';
import TastingNotesSingleton from './TastingNotesService';
import { TastingNote } from '../models';

export const useTastingNotes = () => {
  const identityService = IdentitySingleton.getInstance();
  const tastingNotesService = TastingNotesSingleton.getInstance();
  const [error, setError] = useState<string>('');

  const getAllNotes = async (): Promise<Array<TastingNote> | undefined> => {
    try {
      return await tastingNotesService.getAll(identityService.token || '');
    } catch (error) {
      setError(error.message);
    }
  };

  const getNote = async (id: number): Promise<TastingNote | undefined> => {
    try {
      return await tastingNotesService.get(identityService.token || '', id);
    } catch (error) {
      setError(error.message);
    }
  };

  const deleteNote = async (id: number) => {
    try {
      return await tastingNotesService.delete(identityService.token || '', id);
    } catch (error) {
      setError(error.message);
    }
  };

  const saveNote = async (note: TastingNote) => {
    try {
      return await tastingNotesService.save(identityService.token || '', note);
    } catch (error) {
      setError(error.message);
    }
  };

  return { error, getAllNotes, getNote, deleteNote, saveNote };
};
```

## Create the Editor Component

Now we are getting into the new stuff. Back to the usual format. 🤓

Let's create a composite component that we can use to both create new tasting notes or update existing notes. This component will be created in the tasting notes feature folder since it is going to be specific to that feature of the application.

Create a new folder inside of `src/tasting-notes` named `editor`. Add the following files in into the newly created folder:

- `TastingNoteEditor.css`
- `TastingNoteEditor.tsx`
- `TastingNoteEditor.test.tsx`

Open `TastingNoteEditor.tsx` and add in the following code (add any imports along the way):

```TypeScript
import React from 'react';

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
      <IonHeader></IonHeader>
      <IonContent></IonContent>
      <IonFooter></IonFooter>
    </>
  );
};
export default TastingNoteEditor;
```

This will be a shell to house our editor in. There are a few notable items here:

- Since this isn't a full page we do not want to wrap inner elements in an `IonPage` component
- This component will contain a close button, but the parent component should be able to that event
- We want the ability to update an existing note later on, so we'll add it as an optional prop

Let's also start the test file. Open `TastingNoteEditor.test.tsx` and paste in the following code:

```TypeScript
import React from 'react';
import { render } from '@testing-library/react';
import { cleanup } from '@testing-library/react-hooks';
import { ionFireEvent as fireEvent } from '@ionic/react-test-utils';
import TastingNotesSingleton, { TastingNotesService } from '../TastingNotesService';
import TastingNoteEditor from './TastingNoteEditor';


describe('<TastingNoteEditor />', () => {
  let mockOnDismiss: any;
  let component: any;

  beforeEach(() => {
    mockOnDismiss = jest.fn();
    component = <TastingNoteEditor onDismiss={mockOnDismiss} />;
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });
});
```

### Hookup the Modal

The first thing we need to do is get a modal overlayed hooked up for the "add a new note" case. This will allow us to test out the component for the modal as we develop it.

We will launch the modal for the "add a new note" scenario from a floating action button on the `TastingNotes` component.

#### Test First

Open `src/tasting-notes/TastingNotes.test.tsx` and add the following describe block:

```TypeScript
  ...
  describe('add a new note', () => {
    it('displays the editor modal', async () => {
      const { container, getByText } = render(<TastingNotes />);
      const button = container.querySelector('ion-fab-button')!;
      fireEvent.click(button);
      await wait(() => expect(getByText('Add New Tasting Note')).toBeDefined());
    });
  });
  ...
```

#### Then Code

Now let's add the modal to the tasting notes page. Open `TastingNotes.tsx` and add the following code:

```TypeScript
...
const TastingNotes: React.FC = () => {
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
export default TastingNotes;
```

Don't worry, the test you added will still be failing. We'll fix that next.

### Mock the Editor Component

#### Basic Layout

To make our test in `TastingNotes.test.tsx` pass, we need some text that says "Add New Tasting Note". Luckily, that will be the header text for `TastingNoteEditor`. Let's lay down some basics of the form's UI.

Open up `src/tasting-notes/editor/TastingNoteEditor.test.tsx` and add the following describe block:

```TypeScript
  ...
  describe('cancel button', () => {
    it('calls the dismiss function', async () => {
      const { container } = render(component);
      const button = await waitForElement(
        () => container.querySelector('#cancel-button')!,
      );
      fireEvent.click(button);
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });
  });
  ...
```

Now let's fill out `TastingNoteEditor.tsx` so that our tests pass:

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

Let's start filling out that form. First start by adding the following code to hook into React Form Hook:

```TypeScript
import React, { useState } from 'react';
...
import { useForm, Controller } from 'react-hook-form';
...
interface TastingNoteEditorProps {
  ...
}

const TastingNoteEditor: React.FC<TastingNoteEditorProps> = ({
  onDismiss,
  note = undefined,
}) => {
  const { handleSubmit, control, formState } = useForm<TastingNote>({
    mode: 'onChange',
  });

  return (
    ...
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
  const [categories, setCategories] = useState<Array<Tea>>([]);
  ...
```

Then add the following template syntax underneath the "name" field created above:

```JSX
<IonItem>
  <IonLabel>Category</IonLabel>
  <Controller
    render={({ onChange, value }) => (
      <>
        {categories.length && (
          <IonSelect
            onIonChange={(e: any) => onChange(e.detail.value!)}
            value={value}>
            {categories.map((tea: Tea) => (
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

We will now turn our attention to wiring the form up to submit tasting notes to the backend data service.

#### Initialization

The only initialization we need at this point is to fetch the list of tea categories to bind to our `ion-select` component.

##### Test First

Add the following mock to `src/tasting-notes/editor/TastingNoteEditor.test.tsx`:

```TypeScript
const mockTeaCategories = [
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

Now let's add a mock for the `getAll()` method of `TeaCategoriesSingleton` and add describe block and test for the component's initialization logic:

```TypeScript
describe('<TastingNoteEditor />', () => {
  ...
  let teaCategoriesService: TeaCategories;

  beforeEach(() => {
    ...
    teaCategoriesService = TeaCategoriesSingleton.getInstance();
    teaCategoriesService.getAll = jest.fn(() =>
      Promise.resolve(mockTeaCategories),
    );
  });

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

##### Then Code

We've seen this code before. Add the following to `TastingNoteEditor.tsx`:

```TypeScript
useEffect(() => {
  const initTeaCategories = async () => {
    const teaCategories = await getCategories();
    setCategories(teaCategories || []);
  };
  initTeaCategories();
}, []);
```

#### Perform the Add

The add is relatively easy. Take the form data, call `saveNote()` and close the modal.

##### Test First

Head back to `TastingNoteEditor.test.tsx`. Let's add a mock tasting note that can be used for our test cases. Place the follow code under `mockTeaCategories`:

```TypeScript
const mockTastingNote = {
  id: 73,
  brand: 'Lipton',
  name: 'Yellow Label',
  teaCategoryId: 1,
  rating: 1,
  notes: 'ick',
};
```

Next, create a new describe block underneath the "initialization" block:

```TypeScript
  ...
  describe('save', () => {
    beforeEach(() => {
      tastingNotesService = TastingNotesSingleton.getInstance();
      tastingNotesService.save = jest.fn(() =>
        Promise.resolve(mockTastingNote),
      );
    });

    it('renders consistently', async () => {
      const { asFragment } = render(component);
      await wait(() => expect(asFragment()).toMatchSnapshot());
    });

    it('saves the data', async () => {
      const expected = { ...mockTastingNote };
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
        fireEvent.ionChange(brand, mockTastingNote.brand);
        fireEvent.ionChange(name, mockTastingNote.name);
        fireEvent.click(rating);
        fireEvent.ionChange(notes, mockTastingNote.notes);
        fireEvent.click(submit);
      });
      expect(tastingNotesService.save).toHaveBeenCalledWith('', expected);
    });
  });
  ...
```

##### Then Code

First let's modify the button in the footer so it does a few additional things:

- It has it's `type` set to `submit`
- It is disabled if the form is invalid
- On click, it handles the submission of the form

In `TastingNoteEditor.tsx` update the footer so the button does the things above:

```JSX
    ...
    <IonFooter>
        <IonToolbar>
          <IonButton
            type="submit"
            disabled={!formState.isValid}
            expand="full"
            onClick={handleSubmit(data => save(data))}>
            Add
          </IonButton>
        </IonToolbar>
      </IonFooter>
      ...
```

Let's setup the `save()` function:

```TypeScript
  ...
  const save = async (data: TastingNote) => {
    await saveNote(data);
    onDismiss();
  };
  ...
```

Our tests pass, and if you are serving the application you'll see the modal dismisses after a new tasting note is added. Nice!

## List the Tasting Notes

We can add notes all day long, but we cannot see them. Let's shift back to the tasting notes page and do a little work. When we come into the page, we want to display the existing notes in a simple list.

### Test First

First we need to provide a mock for the `TastingNotesSingleton` and configure it to return some basic test data:

```TypeScript
import React from 'react';
...
import TastingNotesSingleton, { TastingNotesService } from './TastingNotesService';

const mockTastingNotes: Array<TastingNote> = [
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

describe('<TastingNotes />', () => {
  let tastingNotesService: TastingNotesService;

  beforeEach(() => {
    tastingNotesService = TastingNotesSingleton.getInstance();
    tastingNotesService.getAll = jest.fn(() =>
      Promise.resolve(mockTastingNotes),
    );
  });
  ...
  describe('add a new note', () => {
    ...
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });
});

```

Then create a describe block with some tests to ensure our list is displayed properly:

```TypeScript
describe('<TastingNotes />', () =>
  ...
  describe('initialization', () => {
    it('gets all of the notes', async () => {
      render(<TastingNotes />);
      await wait(() => expect(tastingNotesService.getAll).toBeCalledTimes(1));
    });

    it('displays the notes', async () => {
      const { container } = render(<TastingNotes />);
      await wait(() => {
        expect(container).toHaveTextContent(/Bently/);
        expect(container).toHaveTextContent(/Lipton/);
      });
    });
  });
  ...
});
```

### Then Code

We've done component initialization a few times now, so I'm just going to outline the changes to make to the `TastingNotes` component below:

```TypeScript
...
const TastingNotes: React.FC = () => {
  ...
  const [tastingNotes, setTastingNotes] = useState<TastingNote[]>([]);
  const { getAllNotes } = useTastingNotes();

  useEffect(() => {
    const initNotes = async () => {
      const notes = await getAllNotes();
      setTastingNotes(notes || []);
    };
    initNotes();
  }, []);
};

return (
  <IonPage>
    ...
    <IonContent>
      <IonHeader>
        ...
      </IonHeader>

      <IonList>
        {tastingNotes.map((note, idx) => (
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
export default TastingNotes;
```

## Refreshing Tasting Notes

The notes we have added so far show up, but when we add a new note it does not. We can easily fix that.

When `TastingNoteEditor` is dismissed, it should notify the parent component if a refresh is required. Let's update the `onDismiss` prop in `src/tasting-notes/editor/TastingNoteEditor.tsx` to reflect this:

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

If the user chooses to dismiss the form before adding a note, there's no reason to refresh.

### Test First

Switch over to `src/tasting-notes/TastingNotes.test.tsx` and let's add a test to our "add a new note" describe block:

```TypeScript
  // I'm unable to figure out how to test this. It seems that moving async operations to
  // state would resolve it? https://www.debuggr.io/react-update-unmounted-component/
```

### Then Code

This is pretty simple logic. In `TastingNotes.tsx` update the part of the template where we declare `TastingNoteEditor`:

```TypeScript
...
  <TastingNoteEditor onDismiss={opts => handleOnDismiss(opts)} />
...
```

Then update and refactor the code before the template:

```TypeScript
...
const TastingNotes: React.FC = () => {
  ...
  const fetchTastingNotes = async () => {
    const notes = await getAllNotes();
    setTastingNotes(notes || []);
  };

  useEffect(() => {
    fetchTastingNotes();
  }, []);

  const handleOnDismiss = async (options: any) => {
    setShowModal(false);
    if (options.refresh) fetchTastingNotes();
  };

  return (
    ...
  );
};
export default TastingNotes;
```

## Edit a Note

It would be nice to be able to go back and either view or modify tasting notes that had been previously created.

### Modify the Editor

A good first step will be to start by modifying the editor such that it should have a different title and different button text based on whether or not a note is passed.

All of the following modifications will be to `TastingNotesEditor.tsx` and it's `test` file.

#### Test First

Let's create another describe block named `update`:

```TypeScript
  ...
  describe('update', () => {
    beforeEach(() => {
      component = (
        <TastingNoteEditor onDismiss={mockOnDismiss} note={mockTastingNote} />
      );
      tastingNotesService = TastingNotesSingleton.getInstance();
      tastingNotesService.save = jest.fn(() =>
        Promise.resolve(mockTastingNote),
      );
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
      expect(brand.getAttribute('value')).toEqual(mockTastingNote.brand);
      expect(name.getAttribute('value')).toEqual(mockTastingNote.name);
      expect(notes.getAttribute('value')).toEqual(mockTastingNote.notes);
    });

    it('updates the data', async () => {
      const expected = { ...mockTastingNote };
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
        fireEvent.ionChange(brand, mockTastingNote.brand);
        fireEvent.ionChange(name, mockTastingNote.name);
        fireEvent.click(rating);
        fireEvent.ionChange(notes, expected.notes);
        fireEvent.click(submit);
      });
      expect(tastingNotesService.save).toHaveBeenCalledWith('', expected);
    });
  });
  ...
```

Updating the data is very similar to saving the data - it's a simple copy and paste job with a few extra steps.

#### Then Code

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

#### Then Code

Feel free to get fancy and creative on how you modify `TastingNoteEditor` to display the correct labels. Below is how I tackled the requirement:

```JSX
<>
  ...
    <IonTitle>{!note && 'Add New'} Tasting Note</IonTitle>
  ...
    <IonButton
      {/* Props excluded for clarity */} >
      {note ? 'Update' : 'Add'}
    </IonButton>
</>
```

### Update the Tasting Notes Page

Now that the editor has been modified to handle updating existing tasting notes in addition to adding new tasting notes, we need to update the tasting note page so application users can access this functionality.

All of the following modifications will be to `TastingNotes.tsx` and it's `test` file.

#### Test First

Let's add a new describe block to `TastingNotes.test.tsx` for the "update an existing note" case:

```TypeScript
  ...
  describe('update an existing note', () => {
    it('prepopulates the editor modal', async () => {
      const { container, getByText } = render(<TastingNotes />);
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
```

#### Then Code

To make this all work, we need to use state to update the `note` prop on `<TastingNoteEditor />` when:

- A specific note is clicked
- The floating action button is clicked
- The modal is dismissed

Modify `TastingNotes.tsx`

```TypeScript
import React, { useEffect, useState } from 'react';
...
const TastingNotes: React.FC = () => {
  ...
  const [selectedNote, setSelectedNote] = useState<TastingNote | undefined>(
    undefined,
  );

  const handleOnDismiss = async (options: any) => {
    setShowModal(false);
    setSelectedNote(undefined);
    if (options.refresh) fetchTastingNotes();
  };

  const handleUpdate = (note: TastingNote) => {
    setSelectedNote(note);
    setShowModal(true);
  };

  const handleNewNote = () => {
    setSelectedNote(undefined);
    setShowModal(true);
  };

  return (
    <IonPage>
      <IonHeader>
        ...
      </IonHeader>
      <IonContent>
        <IonHeader collapse="condense">
          ...
        </IonHeader>

        <IonList>
          {tastingNotes.map((note, idx) => (
            <IonItem key={idx} onClick={() => handleUpdateNote(note)}>
              ...
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
            onDismiss={opts => handleOnDismiss(opts)}
            note={selectedNote}
          />
        </IonModal>
      </IonContent>
    </IonPage>
  );
};
export default TastingNotes;
```

## Delete a Note

The final feature we will add is the ability to delete a ntoe. We will keep this one simple and make it somewhat hidden so that it isn't too easy for application users to delete notes.

We will use <a href="https://ionicframework.com/docs/api/item-sliding" target="_blank">item-sliding</a> to essentially "hide" the delete button behind the item. That way the application user has to slide the item over in order to expose the button and perform a delete.

This results in a little bit of re-work in the way the item is rendered and bound on `TastingNotes`:

```JSX
<IonList>
  {tastingNotes.map((note, idx) => (
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
const handleDeleteNote = (id: number) => {
  deleteNote(id);
  fetchTastingNotes();
};
```

**Extra Credit:** Add an alert to ask the user if they _really_ want to delete the note!

## Conclusion

Congratulations. You have used what we have learned to this point to add a whole new feature to your app. Along the way, you also exercised a few Framework components you had not used before. We are almost done with this app. One more page to go and we will be done.
