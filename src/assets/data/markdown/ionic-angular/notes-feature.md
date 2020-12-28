# Lab: Add the Notes Feature

In this lab, we will take what we have learned so far and add a whole new feature to our application. Specifically, we will add the "Tasting Notes" feature. In addition to exercising some skills we have already learned such as creating models, services, components, and pages, we will also use some Framework components we have not seen yet. These will include:

- The modal overlay
- Various form elements
- The sliding Ion Item

## Preliminary Items

There are a couple of preliminary items that we need to get out of the way first.

- Create a data model
- Create a data service that performs HTTP requests
- Add the notes to the store

These are a few things we have done multiple times now, so I will just give you the code to move things along. If you are still unsure on these items, though, please review the code that is provided here.

### The `TastingNotes` Model

Add the following model in `src/app/models/tasting-note.ts` and make sure to update the `src/app/models/index.ts` accordingly:

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

### The `TastingNotes` Service

First create the files: `ionic generate service core/tasting-notes/tasting-notes`

#### Test

```typescript
import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { TastingNotesService } from './tasting-notes.service';
import { environment } from '@env/environment';

describe('TastingNotesService', () => {
  let httpTestingController: HttpTestingController;
  let service: TastingNotesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(TastingNotesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get all', () => {
    it('gets the user tasting notes', () => {
      service.getAll().subscribe();
      const req = httpTestingController.expectOne(
        `${environment.dataService}/user-tasting-notes`,
      );
      expect(req.request.method).toEqual('GET');
      httpTestingController.verify();
    });
  });

  describe('delete', () => {
    it('removes the specific note', () => {
      service.delete(4).subscribe();
      const req = httpTestingController.expectOne(
        `${environment.dataService}/user-tasting-notes/4`,
      );
      expect(req.request.method).toEqual('DELETE');
      httpTestingController.verify();
    });
  });

  describe('save', () => {
    it('saves a new note', () => {
      service
        .save({
          brand: 'Lipton',
          name: 'Yellow Label',
          notes: 'Overly acidic, highly tannic flavor',
          rating: 1,
          teaCategoryId: 3,
        })
        .subscribe();
      const req = httpTestingController.expectOne(
        `${environment.dataService}/user-tasting-notes`,
      );
      expect(req.request.method).toEqual('POST');
      httpTestingController.verify();
    });

    it('saves an existinsg note', () => {
      service
        .save({
          id: 7,
          brand: 'Lipton',
          name: 'Yellow Label',
          notes: 'Overly acidic, highly tannic flavor',
          rating: 1,
          teaCategoryId: 3,
        })
        .subscribe();
      const req = httpTestingController.expectOne(
        `${environment.dataService}/user-tasting-notes/7`,
      );
      expect(req.request.method).toEqual('POST');
      httpTestingController.verify();
    });
  });
});
```

#### Code

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { TastingNote } from '@app/models';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class TastingNotesService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Array<TastingNote>> {
    return this.http.get<Array<TastingNote>>(
      `${environment.dataService}/user-tasting-notes`,
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.dataService}/user-tasting-notes/${id}`,
    );
  }

  save(note: TastingNote): Observable<TastingNote> {
    let url = `${environment.dataService}/user-tasting-notes`;
    if (note.id) {
      url += `/${note.id}`;
    }
    return this.http.post<TastingNote>(url, note);
  }
}
```

#### Mock

```typescript
import { EMPTY } from 'rxjs';
import { TastingNotesService } from './tasting-notes.service';

export function createTastingNotesServiceMock() {
  return jasmine.createSpyObj<TastingNotesService>('TastingNotesService', {
    getAll: EMPTY,
    delete: EMPTY,
    save: EMPTY,
  });
}
```

**Important:** remember to update the `src/app/core/[index.ts|testing.ts]` files.

### Store Updates

There is nothing all that new to learn with the store modifications. We will follow the basic pattern we have laid out thus far where:

- the page or component dispatches an action
- that action generally sets a `loading` flag (think of it as a "busy state")
- that action has an effect that performs some tasks
  - if the task succeeds, an action is dispatched to clear loading flags and set the data
  - if the task fails, an action is dispatched to clear loading flags and set an error message

**Note:** for most of the store updates, it will be up to you to supply the updates to the `import`s in these files.

#### Actions

Add the following to the `ActionTypes`:

```TypeScript
  TeaDetailsChangeRating = '[Tea Details Page] change rating',
  TeaDetailsChangeRatingSuccess = '[Data API] change rating success',
  TeaDetailsChangeRatingFailure = '[Data API] change rating failure',

  NotesPageLoaded = '[Notes Page] loaded',
  NotesPageDataLoadedSuccess = '[Data API] notes page loaded success',
  NotesPageDataLoadedFailure = '[Data API] notes page loaded failure',

  NoteSaved = '[Note Editor] note saved',
  NoteSavedSuccess = '[Data API] note saved success',
  NoteSavedFailure = '[Data API] note saved failure',

  NoteDeleted = '[Notes Page] note deleted',
  NoteDeletedSuccess = '[Data API] note deleted success',
  NoteDeletedFailure = '[Data API] note deleted failure',
```

And export the following related action functions:

```TypeScript
export const notesPageLoaded = createAction(ActionTypes.NotesPageLoaded);
export const notesPageLoadedSuccess = createAction(
  ActionTypes.NotesPageDataLoadedSuccess,
  props<{ notes: Array<TastingNote> }>(),
);
export const notesPageLoadedFailure = createAction(
  ActionTypes.NotesPageDataLoadedFailure,
  props<{ errorMessage: string }>(),
);

export const noteSaved = createAction(
  ActionTypes.NoteSaved,
  props<{ note: TastingNote }>(),
);
export const noteSavedSuccess = createAction(
  ActionTypes.NoteSavedSuccess,
  props<{ note: TastingNote }>(),
);
export const noteSavedFailure = createAction(
  ActionTypes.NoteSavedFailure,
  props<{ errorMessage: string }>(),
);

export const noteDeleted = createAction(
  ActionTypes.NoteDeleted,
  props<{ note: TastingNote }>(),
);
export const noteDeletedSuccess = createAction(
  ActionTypes.NoteDeletedSuccess,
  props<{ note: TastingNote }>(),
);
export const noteDeletedFailure = createAction(
  ActionTypes.NoteDeletedFailure,
  props<{ errorMessage: string }>(),
);
```

#### Reducers

The reducers are also pretty straight forward. We will do this in steps. All of the following modifications are in one of the two following files: `src/app/store/reducers/data/data.reducer.ts` or `src/app/store/reducers/data/data.reducer.spec.ts`

First, we need to add the notes to the state. Add the `notes` property as shown here.

```TypeScript
...
import { TastingNote, Tea } from '@app/models';

export interface DataState {
  notes: Array<TastingNote>;
  teas: Array<Tea>;
  loading: boolean;
  errorMessage: string;
}

export const initialState: DataState = {
  notes: [],
  teas: [],
  loading: false,
  errorMessage: '',
};
...
```

Let's add some data to test with. This is towards the top of the file where we have our other test data defined:

```TypeScript
import { Session, TastingNote, Tea } from '@app/models';
...
const notes: Array<TastingNote> = [
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
    notes:
      'Very acidic, even as dark teas go, OK for iced tea, horrible for any other application',
  },
  {
    id: 73,
    brand: 'Rishi',
    name: 'Puer Cake',
    teaCategoryId: 6,
    rating: 5,
    notes: 'Smooth and peaty, the king of puer teas',
  },
];
```

We need to update the `LogoutSuccess` portion of the reducer to including the clearing of `notes` in addition to `teas`. Here is the updated test and code.

```TypeScript
  {
    description: `${ActionTypes.LogoutSuccess}: clears the data`,
    action: logoutSuccess(),
    begin: { teas, notes },
    end: {},
  },
```

```TypeScript
  on(Actions.logoutSuccess, state => ({
    ...state,
    notes: [],
    teas: [],
  })),
```

Then add the new test cases that we need:

```TypeScript
  {
    description: `${ActionTypes.NotesPageLoaded}: sets the loading flag and clears any error message`,
    action: notesPageLoaded(),
    begin: { teas, errorMessage: 'The last thing, it failed' },
    end: { teas, loading: true },
  },
  {
    description: `${ActionTypes.NotesPageDataLoadedSuccess}: adds the notes / clears the loading flag`,
    action: notesPageLoadedSuccess({ notes }),
    begin: { teas, loading: true },
    end: { teas, notes },
  },
  {
    description: `${ActionTypes.NotesPageDataLoadedFailure}: adds the error message / clears the loading flag`,
    action: notesPageLoadedFailure({ errorMessage: 'Something is borked' }),
    begin: { notes, teas, loading: true },
    end: { notes, teas, errorMessage: 'Something is borked' },
  },
  {
    description: `${ActionTypes.NoteSaved}: sets the loading flag and clears any error message`,
    action: noteSaved({ note: notes[2] }),
    begin: { notes, teas, errorMessage: 'The last thing, it failed' },
    end: { notes, teas, loading: true },
  },
  {
    description: `${ActionTypes.NoteSavedSuccess}: updates an existing note`,
    action: noteSavedSuccess({
      note: { ...notes[2], brand: 'Generic Tea Co.' },
    }),
    begin: { notes, teas, loading: true },
    end: {
      notes: [notes[0], notes[1], { ...notes[2], brand: 'Generic Tea Co.' }],
      teas,
    },
  },
  {
    description: `${ActionTypes.NoteSavedSuccess}: appends a new note`,
    action: noteSavedSuccess({
      note: {
        id: 999943,
        brand: 'Berkley',
        name: 'Green Tea',
        teaCategoryId: 3,
        rating: 2,
        notes: 'I am not sure this is even tea',
      },
    }),
    begin: { notes, teas, loading: true },
    end: {
      notes: [
        ...notes,
        {
          id: 999943,
          brand: 'Berkley',
          name: 'Green Tea',
          teaCategoryId: 3,
          rating: 2,
          notes: 'I am not sure this is even tea',
        },
      ],
      teas,
    },
  },
  {
    description: `${ActionTypes.NoteSavedFailure}: adds the error message / clears the loading flag`,
    action: noteSavedFailure({ errorMessage: 'Something is borked' }),
    begin: { notes, teas, loading: true },
    end: { notes, teas, errorMessage: 'Something is borked' },
  },
  {
    description: `${ActionTypes.NoteDeleted}: sets the loading flag and clears any error message`,
    action: noteDeleted({ note: notes[0] }),
    begin: { notes, teas, errorMessage: 'The last thing, it failed' },
    end: { notes, teas, loading: true },
  },
  {
    description: `${ActionTypes.NoteDeletedSuccess}: removes the note`,
    action: noteDeletedSuccess({ note: notes[1] }),
    begin: { notes, teas, loading: true },
    end: { notes: [notes[0], notes[2]], teas },
  },
  {
    description: `${ActionTypes.NoteDeletedFailure}: adds the error message / clears the loading flag`,
    action: noteDeletedFailure({ errorMessage: 'Something is borked' }),
    begin: { notes, teas, loading: true },
    end: { notes, teas, errorMessage: 'Something is borked' },
  },
```

Finally, add the code to the reducer:

```TypeScript
  on(Actions.notesPageLoaded, state => ({
    ...state,
    loading: true,
    errorMessage: '',
  })),
  on(Actions.notesPageLoadedSuccess, (state, { notes }) => ({
    ...state,
    loading: false,
    notes,
  })),
  on(Actions.notesPageLoadedFailure, (state, { errorMessage }) => ({
    ...state,
    loading: false,
    errorMessage,
  })),
  on(Actions.noteSaved, state => ({
    ...state,
    loading: true,
    errorMessage: '',
  })),
  on(Actions.noteSavedSuccess, (state, { note }) => {
    const notes = [...state.notes];
    const idx = notes.findIndex(n => n.id === note.id);
    if (idx > -1) {
      notes.splice(idx, 1, note);
    } else {
      notes.push(note);
    }
    return {
      ...state,
      notes,
      loading: false,
    };
  }),
  on(Actions.noteSavedFailure, (state, { errorMessage }) => ({
    ...state,
    loading: false,
    errorMessage,
  })),
  on(Actions.noteDeleted, state => ({
    ...state,
    loading: true,
    errorMessage: '',
  })),
  on(Actions.noteDeletedSuccess, (state, { note }) => {
    const notes = [...state.notes];
    const idx = notes.findIndex(n => n.id === note.id);
    if (idx > -1) {
      notes.splice(idx, 1);
    }
    return {
      ...state,
      notes,
      loading: false,
    };
  }),
  on(Actions.noteDeletedFailure, (state, { errorMessage }) => ({
    ...state,
    loading: false,
    errorMessage,
  })),
```

#### Effects

For our tests, we will need some test data as well, so add the same test data that we added to the data recuder tests.

We are also going to need to inject the `TastingNotesService` so update the `TestBed` configuration as well:

```TypeScript
        {
          provide: TastingNotesService,
          useFactory: createTastingNotesServiceMock
        },
```

Once that is in place, we can create test for the following workflows:

- loading the notes list page (load the notes)
- saving a note
- deleting a note

```TypeScript
  describe('notesPageLoaded$', () => {
    beforeEach(() => {
      const notesService = TestBed.inject(TastingNotesService);
      (notesService.getAll as any).and.returnValue(of(notes));
    });

    it('loads the notes', done => {
      const notesService = TestBed.inject(TastingNotesService);
      actions$ = of(notesPageLoaded());
      effects.notesPageLoaded$.subscribe(() => {
        expect(notesService.getAll).toHaveBeenCalledTimes(1);
        done();
      });
    });

    describe('on success', () => {
      it('dispatches notes loaded success', done => {
        actions$ = of(notesPageLoaded());
        effects.notesPageLoaded$.subscribe(newAction => {
          expect(newAction).toEqual({
            type: ActionTypes.NotesPageDataLoadedSuccess,
            notes,
          });
          done();
        });
      });
    });

    describe('on an exception', () => {
      beforeEach(() => {
        const notesService = TestBed.inject(TastingNotesService);
        (notesService.getAll as any).and.returnValue(
          throwError(new Error('the server is blowing chunks')),
        );
      });

      it('dispatches notes loaded failure with a generic message', done => {
        actions$ = of(notesPageLoaded());
        effects.notesPageLoaded$.subscribe(newAction => {
          expect(newAction).toEqual({
            type: ActionTypes.NotesPageDataLoadedFailure,
            errorMessage: 'Error in data load, check server logs',
          });
          done();
        });
      });
    });
  });

  describe('noteSaved$', () => {
    let note: TastingNote;
    let noteWithId: TastingNote;
    beforeEach(() => {
      note = {
        brand: 'Bigalow',
        name: 'Earl Grey',
        teaCategoryId: 5,
        rating: 3,
        notes: 'Not great, but not bad either',
      };
      noteWithId = { ...note, id: 99385 };
      const notesService = TestBed.inject(TastingNotesService);
      (notesService.save as any).and.returnValue(of(noteWithId));
    });

    it('saves the notes', done => {
      const notesService = TestBed.inject(TastingNotesService);
      actions$ = of(noteSaved({ note }));
      effects.noteSaved$.subscribe(() => {
        expect(notesService.save).toHaveBeenCalledTimes(1);
        expect(notesService.save).toHaveBeenCalledWith(note);
        done();
      });
    });

    describe('on success', () => {
      it('dispatches note saved success', done => {
        actions$ = of(noteSaved({ note }));
        effects.noteSaved$.subscribe(newAction => {
          expect(newAction).toEqual({
            type: ActionTypes.NoteSavedSuccess,
            note: noteWithId,
          });
          done();
        });
      });
    });

    describe('on an exception', () => {
      beforeEach(() => {
        const notesService = TestBed.inject(TastingNotesService);
        (notesService.save as any).and.returnValue(
          throwError(new Error('the server is blowing chunks')),
        );
      });

      it('dispatches note saved failure with a generic message', done => {
        actions$ = of(noteSaved({ note }));
        effects.noteSaved$.subscribe(newAction => {
          expect(newAction).toEqual({
            type: ActionTypes.NoteSavedFailure,
            errorMessage: 'Error in data load, check server logs',
          });
          done();
        });
      });
    });
  });

  describe('noteDeleted$', () => {
    beforeEach(() => {
      const notesService = TestBed.inject(TastingNotesService);
      (notesService.delete as any).and.returnValue(of(null));
    });

    it('deletes the notes', done => {
      const notesService = TestBed.inject(TastingNotesService);
      actions$ = of(noteDeleted({ note: notes[1] }));
      effects.noteDeleted$.subscribe(() => {
        expect(notesService.delete).toHaveBeenCalledTimes(1);
        expect(notesService.delete).toHaveBeenCalledWith(notes[1].id);
        done();
      });
    });

    describe('on success', () => {
      it('dispatches note deleted success', done => {
        actions$ = of(noteDeleted({ note: notes[1] }));
        effects.noteDeleted$.subscribe(newAction => {
          expect(newAction).toEqual({
            type: ActionTypes.NoteDeletedSuccess,
            note: notes[1]
          });
          done();
        });
      });
    });

    describe('on an exception', () => {
      beforeEach(() => {
        const notesService = TestBed.inject(TastingNotesService);
        (notesService.delete as any).and.returnValue(
          throwError(new Error('the server is blowing chunks')),
        );
      });

      it('dispatches note deleted failure with a generic message', done => {
        actions$ = of(noteDeleted({ note: notes[1] }));
        effects.noteDeleted$.subscribe(newAction => {
          expect(newAction).toEqual({
            type: ActionTypes.NoteDeletedFailure,
            errorMessage: 'Error in data load, check server logs',
          });
          done();
        });
      });
    });
  });
```

```TypeScript
  notesPageLoaded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(notesPageLoaded),
      mergeMap(() =>
        this.tastingNotesService.getAll().pipe(
          map(notes => notesPageLoadedSuccess({ notes })),
          catchError(() =>
            of(
              notesPageLoadedFailure({
                errorMessage: 'Error in data load, check server logs',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  noteSaved$ = createEffect(() =>
    this.actions$.pipe(
      ofType(noteSaved),
      mergeMap(action =>
        this.tastingNotesService.save(action.note).pipe(
          map(note => noteSavedSuccess({ note })),
          catchError(() =>
            of(
              noteSavedFailure({
                errorMessage: 'Error in data load, check server logs',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  noteDeleted$ = createEffect(() =>
    this.actions$.pipe(
      ofType(noteDeleted),
      mergeMap(action =>
        this.tastingNotesService.delete(action.note.id).pipe(
          map(() => noteDeletedSuccess({ note: action.note })),
          catchError(() =>
            of(
              noteDeletedFailure({
                errorMessage: 'Error in data load, check server logs',
              }),
            ),
          ),
        ),
      ),
    ),
  );
```

#### Selectors

For selectors, we need one to get all of the notes and one to get a specific note.

```TypeScript
import { TastingNote, Tea } from '@app/models';
...
export const selectNotes = createSelector(
  selectData,
  (state: DataState) => state.notes,
);
export const selectNote = createSelector(
  selectNotes,
  (notes: Array<TastingNote>, props: { id: number }) =>
    notes.find(t => t.id === props.id),
);
```

## Create the Editor Component

Now we are getting into the new stuff. Back to the usual format. 🤓

Let's create a composite component that we can use to create new tasting notes or update existing notes. We will create this new component under the `src/app/tasting-notes` folder since it is going to be specific to the "tasting notes" feature of our application.

```bash
$ ionic g module tasting-notes/tasting-note-editor
$ ionic g component tasting-notes/tasting-note-editor
```

### Update the Editor Module

Notice that we created a module for the editor. Let's update that to declare and export our component. Since we will be creating an editor form using Ionic Framework components as well as our ratings component, we will also modify it to include the following modules in its list of imports: `FormsModule`, `IonicModule`, and `SharedModule`.

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { TastingNoteEditorComponent } from './tasting-note-editor.component';
import { SharedModule } from '@app/shared';

@NgModule({
  declarations: [TastingNoteEditorComponent],
  exports: [TastingNoteEditorComponent],
  imports: [CommonModule, FormsModule, IonicModule, SharedModule],
})
export class TastingNoteEditorModule {}
```

Make the same change with regard to the `imports` within the `src/app/tasting-notes/tasting-note-editor/tasting-note-editor.component.spec.ts` where the testing module is configured.

### Hookup the Modal

The first thing we need to do is get a modal overlay hooked up for the "add a new note" case. This will allow us to test out the component for the modal as we develop it. This will also get the infrastructure for the rest of our modifications in place. We will launch the modal for the "add a new note" scenario from a floating action button on the `TastingNotesPage`.

First we need to set up the test for the `TastingNotesPage`.

```typescript
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, ModalController, IonRouterOutlet } from '@ionic/angular';

import { TastingNotesPage } from './tasting-notes.page';
import {
  createOverlayControllerMock,
  createOverlayElementMock,
} from '@test/mocks';
import { TastingNoteEditorComponent } from './tasting-note-editor/tasting-note-editor.component';
import { TastingNoteEditorModule } from './tasting-note-editor/tasting-note-editor.module';

describe('TastingNotesPage', () => {
  let component: TastingNotesPage;
  let fixture: ComponentFixture<TastingNotesPage>;
  let modal: HTMLIonModalElement;

  const mockRouterOutlet = {
    nativeEl: {},
  };

  beforeEach(
    waitForAsync(() => {
      modal = createOverlayElementMock('Modal');
      TestBed.configureTestingModule({
        declarations: [TastingNotesPage],
        imports: [IonicModule, TastingNoteEditorModule],
        providers: [
          {
            provide: ModalController,
            useFactory: () =>
              createOverlayControllerMock('ModalController', modal),
          },
          { provide: IonRouterOutlet, useValue: mockRouterOutlet },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(TastingNotesPage);
      component = fixture.componentInstance;
    }),
  );

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('add new note', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('creates the editor modal', () => {
      const modalController = TestBed.inject(ModalController);
      component.newNote();
      expect(modalController.create).toHaveBeenCalledTimes(1);
      expect(modalController.create).toHaveBeenCalledWith({
        component: TastingNoteEditorComponent,
        backdropDismiss: false,
        swipeToClose: true,
        presentingElement: mockRouterOutlet.nativeEl as any,
      });
    });

    it('displays the editor modal', async () => {
      await component.newNote();
      expect(modal.present).toHaveBeenCalledTimes(1);
    });
  });
});
```

From here, the code and the markup are pretty easy:

```html
<ion-header>
  <ion-toolbar>
    <ion-title>Tasting Notes</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <ion-fab vertical="bottom" horizontal="end" slot="fixed">
    <ion-fab-button (click)="newNote()">
      <ion-icon name="add"></ion-icon>
    </ion-fab-button>
  </ion-fab>
</ion-content>
```

```typescript
import { Component, OnInit } from '@angular/core';
import { IonRouterOutlet, ModalController } from '@ionic/angular';
import { TastingNoteEditorComponent } from './tasting-note-editor/tasting-note-editor.component';

@Component({
  selector: 'app-tasting-notes',
  templateUrl: './tasting-notes.page.html',
  styleUrls: ['./tasting-notes.page.scss'],
})
export class TastingNotesPage implements OnInit {
  constructor(
    private modalController: ModalController,
    private routerOutlet: IonRouterOutlet,
  ) {}

  ngOnInit() {}

  async newNote(): Promise<void> {
    const modal = await this.modalController.create({
      component: TastingNoteEditorComponent,
      backdropDismiss: false,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
    });
    modal.present();
  }
}
```

Also add the `TastingNoteEditorModule` to the imports list within the `TastingNotesPageModule`. This will make the `TastingNoteEditorComponent` available for use in our modal overlay.

```diff
--- a/src/app/tasting-notes/tasting-notes.module.ts
+++ b/src/app/tasting-notes/tasting-notes.module.ts
@@ -6,6 +6,7 @@ import { IonicModule } from '@ionic/angular';

 import { TastingNotesPageRoutingModule } from './tasting-notes-routing.module';

+import { TastingNoteEditorModule } from './tasting-note-editor/tasting-note-editor.module';
 import { TastingNotesPage } from './tasting-notes.page';

 @NgModule({
@@ -13,6 +14,7 @@ import { TastingNotesPage } from './tasting-notes.page';
     CommonModule,
     FormsModule,
     IonicModule,
+    TastingNoteEditorModule,
     TastingNotesPageRoutingModule,
   ],
   declarations: [TastingNotesPage],
```

### Create the Editor Component

#### Basic Layout

Let's switch bach to our editor component and start laying out the basics of our form. We know what we will need a header section with a title, a footer secion with a button, and that the content will be our form. So let's start there:

```html
<ion-header>
  <ion-toolbar>
    <ion-title>Add New Tasting Note</ion-title>
    <ion-buttons slot="primary">
      <ion-button id="cancel-button" (click)="close()">
        <ion-icon slot="icon-only" name="close"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content>
  <form #notesEditorForm="ngForm"></form>
</ion-content>

<ion-footer>
  <ion-toolbar>
    <ion-button expand="full" [disabled]="!notesEditorForm.form.valid"
      >Add</ion-button
    >
  </ion-toolbar>
</ion-footer>
```

Let's start filling out that form. We already have one simple form. The `LoginPage`. It looks like over there we used a list of inputs. We will need something like that, so let's use that as a model for the first couple of input fields here. All of the following items will go inside the `form` element:

```html
<ion-item>
  <ion-label position="floating">Brand</ion-label>
  <ion-input
    id="brand-input"
    name="brand"
    [(ngModel)]="brand"
    #brandInput="ngModel"
    required
  ></ion-input>
</ion-item>
<ion-item>
  <ion-label position="floating">Name</ion-label>
  <ion-input
    id="name-input"
    name="name"
    [(ngModel)]="name"
    #nameInput="ngModel"
    required
  ></ion-input>
</ion-item>
```

We need a way to select the type of tea that we have:

```html
<ion-item>
  <ion-label>Type</ion-label>
  <ion-select
    name="tea-type-select"
    [(ngModel)]="teaCategoryId"
    #teaTypeSelect="ngModel"
    required
  >
    <ion-select-option
      *ngFor="let t of teaCategories$ | async"
      value="{{ t.id }}"
      >{{ t.name }}</ion-select-option
    >
  </ion-select>
</ion-item>
```

A rating

```html
<ion-item>
  <ion-label>Rating</ion-label>
  <app-rating
    [(ngModel)]="rating"
    id="rating-input"
    name="rating"
    #ratingInput="ngModel"
    required
  ></app-rating>
</ion-item>
```

A text area for some free-form notes on the tea we just tasted:

```html
<ion-item>
  <ion-label position="floating">Notes</ion-label>
  <ion-textarea
    id="notes-textbox"
    name="notes"
    [(ngModel)]="notes"
    #notesInput="ngModel"
    rows="5"
    required
  ></ion-textarea>
</ion-item>
```

That looks pretty good so far.

#### Hooking it Up

We will now turn our attention to the `src/app/tasting-notes/tasting-note-editor/tasting-note-editor.component.spec.ts` and `src/app/tasting-notes/tasting-note-editor/tasting-note-editor.component.ts` files.

##### Properties

First, we have a lot of `[(ngModel)]` bindings. We need to declare the properties for these:

```typescript
  brand: string;
  name: string;
  teaCategoryId: string;
  rating: number;
  notes: string;

  teaCategories$: Observable<Array<Tea>>;
```

Note that the `teaCategoryId` is a string even though in reality it is a number. The reason for this is because the values in the select always bind as a string due to how HTML attributes work, so we will need to convert this to a number when we do the save.

##### Initialization

The only initialization we need at this point is to set up the `teaCategories$` observable such that our `ion-select` is bound properly.

###### Test

```typescript
...
import { MockStore, provideMockStore } from '@ngrx/store/testing';
...
import { DataState, initialState } from '@app/store/reducers/data/data.reducer';
...
import { Store } from '@ngrx/store';
import { selectTeas } from '@app/store';
import {By} from '@angular/platform-browser';
...
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TastingNoteEditorComponent],
        imports: [FormsModule, IonicModule, SharedModule],
        providers: [
          provideMockStore<{ data: DataState }>({
            initialState: { data: initialState },
          }),
        ],
      }).compileComponents();

      const store = TestBed.inject(Store) as MockStore;
      store.overrideSelector(selectTeas, [
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
      ]);

      fixture = TestBed.createComponent(TastingNoteEditorComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }),
  );
...
  describe('initialization', () => {
    it('binds the tea select', () => {
      const sel = fixture.debugElement.query(By.css('ion-select'));
      const opts = sel.queryAll(By.css('ion-select-option'));
      expect(opts[0].nativeElement.value).toEqual('7');
      expect(opts[0].nativeElement.textContent).toEqual('White');
      expect(opts[1].nativeElement.value).toEqual('8');
      expect(opts[1].nativeElement.textContent).toEqual('Yellow');
    });
  });
...
 });
```

###### Code

The population of the `ion-select-option` values is handled via `*ngFor="let t of teaCategories$ | async"` so all we need to do at this point is assign the `teaCategories$` observable. You will need to inject the `TeaService`.

```typescript
  constructor(private store: Store<State>) {}

  ngOnInit() {
    this.teaCategories$ = this.store.select(selectTeas);
  }

```

##### Perform the Add

The add is relativily easy. Create a tea object using the properties, call `tastingNotesService.save()`, and close the modal.

###### Test

First update the `TestBed` to provide the `ModalController`. You should have a good set of examples of how to do this, so no code is provided here.

Once that is in place, here is the code for the tests:

```typescript
describe('save', () => {
  it('dispatches the save with the data', () => {
    const store = TestBed.inject(Store);
    spyOn(store, 'dispatch');
    component.brand = 'Lipton';
    component.name = 'Yellow Label';
    component.teaCategoryId = '3';
    component.rating = 1;
    component.notes = 'ick';
    component.save();
    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(store.dispatch).toHaveBeenCalledWith(
      noteSaved({
        note: {
          brand: 'Lipton',
          name: 'Yellow Label',
          teaCategoryId: 3,
          rating: 1,
          notes: 'ick',
        },
      }),
    );
  });

  it('dismisses the modal', () => {
    const modalController = TestBed.inject(ModalController);
    component.save();
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  });
});
```

**Note:** these tests call the `component.save()` directly. If we wanted to be more complete we could add a helper function to do a button click, get the "Add" button, and perform a click on it. Exapanding the test in such a way is left as an exercise for the reader to do on their own. We have examples of such tests for the `LoginPage`.

###### Code

You will first need to inject the appropriate services, then the following code will need to be written:

```typescript
  save() {
    this.store.dispatch(
      noteSaved({
        note: {
          brand: this.brand,
          name: this.name,
          teaCategoryId: parseInt(this.teaCategoryId, 10),
          rating: this.rating,
          notes: this.notes,
        },
      }),
    );
    this.modalController.dismiss();
  }
```

###### Markup

Modify the HTML for the component to hook up the `(click)` event on the button in the footer to the `save()` method we just created.

```html
<ion-footer>
  <ion-toolbar>
    <ion-button
      expand="full"
      [disabled]="!notesEditorForm.form.valid"
      (click)="save()"
      >Add</ion-button
    >
  </ion-toolbar>
</ion-footer>
```

##### Close the Modal

We have an 'X' icon in the toolbar that allows users to close the dialog if they cannot swipe to close. The test and code is very easy since all it needs to do is dismiss the modal without saving anything.

###### Test

```typescript
describe('close', () => {
  it('dismisses the modal', () => {
    const modalController = TestBed.inject(ModalController);
    component.close();
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  });
});
```

###### Code

```typescript
  close() {
    this.modalController.dismiss();
  }
```

## List the Notes

We can add notes all day long, but we cannot see them. Let's shift back to the `TastingNotesPage` and do a little work. Basically, when we come into the page, we want to display the existing notes in a simple list, so we will need to get them.

### Test

First we need to provide a mock for the `TastingNotesService` and configure it to return some basic test data.

```typescript
  // add this up by the other declarations...
  let testData: Array<TastingNote>;
  ...

  // Most of this already exists, add the bits that do not
  beforeEach(
    waitForAsync(() => {
      initializeTestData();
      modal = createOverlayElementMock('Modal');
      TestBed.configureTestingModule({
        declarations: [TastingNotesPage],
        imports: [IonicModule, TastingNoteEditorModule],
        providers: [
          {
            provide: ModalController,
            useFactory: () =>
              createOverlayControllerMock('ModalController', modal),
          },
          { provide: IonRouterOutlet, useValue: mockRouterOutlet },
          provideMockStore<{ data: DataState }>({
            initialState: { data: initialState },
          }),
        ],
      }).compileComponents();

      const store = TestBed.inject(Store) as MockStore;
      store.overrideSelector(selectNotes, testData);

      fixture = TestBed.createComponent(TastingNotesPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }),
  );

  ...

  // add this function at the end of the main describe()
  function initializeTestData() {
    testData = [
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
  }
```

Then we can create simple test to ensure our list is displayed properly.

```typescript
describe('initialization', () => {
  it('dispatches notes page loaded', () => {
    const store = TestBed.inject(Store);
    spyOn(store, 'dispatch');
    fixture.detectChanges();
    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(store.dispatch).toHaveBeenCalledWith(notesPageLoaded());
  });

  it('displays the notes', () => {
    fixture.detectChanges();
    const items = fixture.debugElement.queryAll(By.css('ion-item'));
    expect(items.length).toEqual(2);
    expect(items[0].nativeElement.textContent).toContain('Bently');
    expect(items[1].nativeElement.textContent).toContain('Lipton');
  });
});
```

### Code

```typescript
...
  notes$: Observable<Array<TastingNote>>;

  constructor(
    private modalController: ModalController,
    private routerOutlet: IonRouterOutlet,
    private store: Store,
  ) {}

  ngOnInit() {
    this.store.dispatch(notesPageLoaded());
    this.notes$ = this.store.select(selectNotes);
  }
...
```

### HTML

For the Tasting Notes page, we could just add a simple list, but now that we have a potentially scrollable list here, it would be nice to also use the collapsable large title. Since that is a little more complex to add, here is the whole markup:

```html
<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-title>Tasting Notes</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true">
  <ion-header collapse="condense">
    <ion-toolbar>
      <ion-title size="large">Tasting Notes</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-list>
    <ion-item *ngFor="let note of notes$ | async">
      <ion-label>
        <div>{{ note.brand }}</div>
        <div>{{ note.name }}</div>
      </ion-label>
    </ion-item>
  </ion-list>

  <ion-fab vertical="bottom" horizontal="end" slot="fixed">
    <ion-fab-button (click)="newNote()">
      <ion-icon name="add"></ion-icon>
    </ion-fab-button>
  </ion-fab>
</ion-content>
```

## Edit a Note

It would be nice to be able to go back and either view or modify notes that we had previously made.

### Bind the List Item

Each note that we have is represented by an item in the list. We can bind each of those items to a method called `updateNote()` in order to open that note in the modal.

#### HTML

```html
<ion-item *ngFor="let note of notes$ | async" (click)="updateNote(note)">
  <ion-label>
    <div>{{ note.brand }}</div>
    <div>{{ note.name }}</div>
  </ion-label>
</ion-item>
```

#### Tests

This tests will be almost identical to the `newNote()` tests with the exception that we will pass a note to the modal component.

```typescript
describe('update existing note', () => {
  let note: TastingNote;
  beforeEach(() => {
    note = {
      id: 73,
      brand: 'Lipton',
      name: 'Yellow Label',
      teaCategoryId: 3,
      rating: 1,
      notes: 'ick',
    };
  });

  it('creates the editor modal', () => {
    const modalController = TestBed.inject(ModalController);
    component.updateNote(note);
    expect(modalController.create).toHaveBeenCalledTimes(1);
    expect(modalController.create).toHaveBeenCalledWith({
      component: TastingNoteEditorComponent,
      backdropDismiss: false,
      swipeToClose: true,
      presentingElement: mockRouterOutlet.nativeEl as any,
      componentProps: { note },
    });
  });

  it('displays the editor modal', async () => {
    await component.updateNote(note);
    expect(modal.present).toHaveBeenCalledTimes(1);
  });
});
```

#### Code

For our first cut at this, we can just copy-paste `newNote()` and update a couple of things:

```typescript
  async updateNote(note: TastingNote): Promise<void> {
    const modal = await this.modalController.create({
      component: TastingNoteEditorComponent,
      backdropDismiss: false,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: { note },
    });
    await modal.present();
    await modal.onDidDismiss();
    this.refresh.next();
  }
```

**Challenge:** Refactor your code (just the code, not the tests) so it does not repeat so much.

### Modify the Editor

What we have "works" in that it displays the editor, but it doesn't load the note for editing. The next thing we will need to do is expand the capabilities of the editor a bit. We will need to modify the editor such that:

- It can have a note to edit passed to it
- If it has a note passed to it, it initiailizes the bound properties based on that note
- It should have a different title and different button text based on whether or not a note is passed

All of the following modifications will be to the `tasting-note-editor.component` spec and ts files.

#### Pass the Note

First we will need a mechanism to pass the note:

```typescript
@Input() note: TastingNote;
```

Now that we have the note property, if it is set at the time that the component is initialized, then we need to unpack it.

##### Tests

Before we write this test, we will need to take control of when we do the initialization. To do this, remove the call to `fixture.detectChanges()` from the main `beforeEach()`. Instead, call it at the start of each test like this:

```typescript
it('should create', () => {
  fixture.detectChanges();
  expect(component).toBeTruthy();
});
```

This will allow us to set up data before the `ngOnInit()` call is made.

Finally, add the following test the the "initialization" set of tests:

```typescript
describe('with a note', () => {
  beforeEach(() => {
    component.note = {
      id: 7,
      brand: 'Lipton',
      name: 'Yellow Label',
      notes: 'Overly acidic, highly tannic flavor',
      rating: 1,
      teaCategoryId: 3,
    };
    fixture.detectChanges();
  });

  it('sets the properties', () => {
    expect(component.brand).toEqual('Lipton');
    expect(component.name).toEqual('Yellow Label');
    expect(component.notes).toEqual('Overly acidic, highly tannic flavor');
    expect(component.rating).toEqual(1);
    expect(component.teaCategoryId).toEqual('3');
  });
});
```

##### Code

```typescript
  ngOnInit() {
    this.teaCategories$ = this.store.select(selectTeas);
    if (this.note) {
      this.brand = this.note.brand;
      this.name = this.note.name;
      this.teaCategoryId = this.note.teaCategoryId.toString();
      this.rating = this.note.rating;
      this.notes = this.note.notes;
    }
  }
```

#### Save the Updates

Now when the user clicks the button at the bottom of the editor, we want to save the modifications, but with the ID from the original note (the save when adding does not have an ID).

##### Tests

The technique used here is to wrap the existing "save" tests in a child `describe()` with the label "a new note". You can then copy that whole section, rename it "an existing note", and change the tests slightly to reflect the new requirements. When you are done, the full set of tests looks like this:

```typescript
describe('save', () => {
  describe('a new note', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('dispatches the save with the data', () => {
      const store = TestBed.inject(Store);
      spyOn(store, 'dispatch');
      component.brand = 'Lipton';
      component.name = 'Yellow Label';
      component.teaCategoryId = '3';
      component.rating = 1;
      component.notes = 'ick';
      component.save();
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toHaveBeenCalledWith(
        noteSaved({
          note: {
            brand: 'Lipton',
            name: 'Yellow Label',
            teaCategoryId: 3,
            rating: 1,
            notes: 'ick',
          },
        }),
      );
    });

    it('dismisses the modal', () => {
      const modalController = TestBed.inject(ModalController);
      component.save();
      expect(modalController.dismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('an existing note', () => {
    beforeEach(() => {
      component.note = {
        id: 73,
        brand: 'Generic',
        name: 'White Label',
        teaCategoryId: 2,
        rating: 3,
        notes: 'it is ok',
      };
      fixture.detectChanges();
    });

    it('saves the data including the ID', () => {
      const store = TestBed.inject(Store);
      spyOn(store, 'dispatch');
      component.brand = 'Lipton';
      component.name = 'Yellow Label';
      component.teaCategoryId = '3';
      component.rating = 1;
      component.notes = 'ick';
      component.save();
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toHaveBeenCalledWith(
        noteSaved({
          note: {
            id: 73,
            brand: 'Lipton',
            name: 'Yellow Label',
            teaCategoryId: 3,
            rating: 1,
            notes: 'ick',
          },
        }),
      );
    });

    it('dismisses the modal', () => {
      const modalController = TestBed.inject(ModalController);
      component.save();
      expect(modalController.dismiss).toHaveBeenCalledTimes(1);
    });
  });
});
```

**Note:** If you did this correctly, it was really just a copy-paste with a few lines of code changed. You could probably clean this up a bit if you wanted for maintainability, but sometimes that makes the tests less stright forward to read and map to requirements.

##### Code

Refactoring the `save()` method to handle the new requirement is straight forward. Here is one way of doing it.

```typescript
  save() {
    const note: TastingNote = {
      brand: this.brand,
      name: this.name,
      teaCategoryId: parseInt(this.teaCategoryId, 10),
      rating: this.rating,
      notes: this.notes,
    };

    if (this.note) {
      note.id = this.note.id;
    }

    this.store.dispatch(noteSaved({ note }));
    this.modalController.dismiss();
  }
```

#### Modify the UI

Now we can load a note for editing and we can modify the data and have it saved, but we need to be change some of the labels on the dialog to reflect what we are actually doing.

##### Tests

First add a "witout a note" section within the initialization tests. These should pass.

```typescript
describe('without a note', () => {
  beforeEach(() => {
    fixture.detectChanges();
  });

  it('has the add title', () => {
    const el = fixture.debugElement.query(By.css('ion-title'));
    expect(el.nativeElement.textContent).toEqual('Add New Tasting Note');
  });

  it('has the add button label', () => {
    const footer = fixture.debugElement.query(By.css('ion-footer'));
    const el = footer.query(By.css('ion-button'));
    expect(el.nativeElement.textContent).toEqual('Add');
  });
});
```

Next add simlar tests within the "with a note" section we added earlier. Only now, the expected text will be slightly different:

```typescript
it('has the update title', () => {
  const el = fixture.debugElement.query(By.css('ion-title'));
  expect(el.nativeElement.textContent).toEqual('Tasting Note');
});

it('has the update button label', () => {
  const footer = fixture.debugElement.query(By.css('ion-footer'));
  const el = footer.query(By.css('ion-button'));
  expect(el.nativeElement.textContent).toEqual('Update');
});
```

##### Code

There are multiple ways to deal with this, but the easiest is probably just to create a couple of getters and then bind them in the HTML

```typescript
  get title(): string {
    return this.note ? 'Tasting Note' : 'Add New Tasting Note';
  }

  get buttonLabel(): string {
    return this.note ? 'Update' : 'Add';
  }
```

```html
<ion-header>
  <ion-toolbar>
    <ion-title>{{ title }}</ion-title>
  </ion-toolbar>
</ion-header>

...

<ion-footer>
  <ion-toolbar>
    <ion-button
      expand="full"
      [disabled]="!notesEditorForm.form.valid"
      (click)="save()"
      >{{ buttonLabel }}</ion-button
    >
  </ion-toolbar>
</ion-footer>
```

## Delete a Note

The final feature we will add is the ability to delete a note. We will keep this one simple and make it somewhat hidden so that it isn't too easy for a user to delete a note.

We will use a contruct called a <a ref="https://ionicframework.com/docs/api/item-sliding" target="_blank">item sliding</a> to essentially "hide" the delete button behind the item. That way the user has to slide the item over in order to expose the button and do a delete.

Using this results in a little be of rework in how the item is rendered and bound on the `TastingNotesPage`:

```HTML
    <ion-item-sliding *ngFor="let note of notes$ | async">
      <ion-item (click)="updateNote(note)">
        <ion-label>
          <div>{{ note.brand }}</div>
          <div>{{ note.name }}</div>
        </ion-label>
      </ion-item>

      <ion-item-options>
        <ion-item-option color="danger" (click)="deleteNote(note)">
          Delete
        </ion-item-option>
      </ion-item-options>
    </ion-item-sliding>
```

And the code for the delete is pretty straight forward:

```typescript
  deleteNote(note: TastingNote): void {
    this.store.dispatch(noteDeleted({ note }));
  }
```

**Extra Credit #1:** Normally, we would write the tests first and then the code. Here we did not, but that is because I wanted to give you some practice crafting your own tests.

**Extra Credit #2:** You could also use an alert to ask the user if they _really_ want to delete the note. Extra extra credit if you want to implement that logic.

## Conclusion

Congratulations. You have used what we have learned to this point to add a whole new feature to your app. Along the way, you also exercised a few Framework components you had not used before. We are almost done with this app. One more page to go and we will be done.
