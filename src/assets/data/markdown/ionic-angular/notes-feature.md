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

**Important:** These are a few things we have done multiple times now, so I will just give you the code to move things along. That means that the first part of this lab is very "copy-paste" centric. If you are unsure on any of the items, though, please take the time to review the code that is being pasted in.

Once we have a good skeleton in place, we will get back to doing new things that are far less "copy-paste."

### Create Some Entities

First let's generate some entities that we are going to need. We will fill these in as we go.

```bash
ionic g service core/tasting-notes/tasting-notes
ionic g module tasting-notes/tasting-note-editor
ionic g component tasting-notes/tasting-note-editor
```

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

#### Test

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

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
      const req = httpTestingController.expectOne(`${environment.dataService}/user-tasting-notes`);
      expect(req.request.method).toEqual('GET');
      httpTestingController.verify();
    });
  });

  describe('delete', () => {
    it('removes the specific note', () => {
      service.delete(4).subscribe();
      const req = httpTestingController.expectOne(`${environment.dataService}/user-tasting-notes/4`);
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
      const req = httpTestingController.expectOne(`${environment.dataService}/user-tasting-notes`);
      expect(req.request.method).toEqual('POST');
      httpTestingController.verify();
    });

    it('saves an existing note', () => {
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
      const req = httpTestingController.expectOne(`${environment.dataService}/user-tasting-notes/7`);
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
    return this.http.get<Array<TastingNote>>(`${environment.dataService}/user-tasting-notes`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.dataService}/user-tasting-notes/${id}`);
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

export const createTastingNotesServiceMock = () =>
  jasmine.createSpyObj<TastingNotesService>('TastingNotesService', {
    getAll: EMPTY,
    delete: EMPTY,
    save: EMPTY,
  });
```

**Important:** remember to update the `src/app/core/[index.ts|testing.ts]` files.

### Store Updates

We will follow the basic pattern we have laid out thus far where:

- the page or component dispatches an action
- that action generally sets a `loading` flag (think of it as a "busy state")
- that action has an effect that performs some tasks
  - if the task succeeds, an action is dispatched to clear loading flags and set the data
  - if the task fails, an action is dispatched to clear loading flags and set an error message

**Note:** for most of the store updates, it will be up to you to supply the updates to the `import`s in these files.

#### Actions

Export the following actions:

```TypeScript
export const notesPageLoaded = createAction('[Notes Page] loaded');
export const notesPageLoadedSuccess = createAction(
  '[Data API] notes page loaded success',
  props<{ notes: Array<TastingNote> }>(),
);
export const notesPageLoadedFailure = createAction(
  '[Data API] notes page loaded failure',
  props<{ errorMessage: string }>(),
);

export const noteSaved = createAction(
  '[Note Editor] note saved',
  props<{ note: TastingNote }>(),
);
export const noteSavedSuccess = createAction(
  '[Data API] note saved success',
  props<{ note: TastingNote }>(),
);
export const noteSavedFailure = createAction(
  '[Data API] note saved failure',
  props<{ errorMessage: string }>(),
);

export const noteDeleted = createAction(
  '[Notes Page] note deleted',
  props<{ note: TastingNote }>(),
);
export const noteDeletedSuccess = createAction(
  '[Data API] note deleted success',
  props<{ note: TastingNote }>(),
);
export const noteDeletedFailure = createAction(
  '[Data API] note deleted failure',
  props<{ errorMessage: string }>(),
);
```

#### Reducers

All of the following modifications are for the `data` reducers. Be sure you are updating the correct reducer related files.

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

Let's add some data to test with. This is towards the top of the test file, where we have our other test data defined:

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
    description: 'Logout Success: clears the data',
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
    description: 'Notes Page Loaded: sets the loading flag and clears any error message',
    action: notesPageLoaded(),
    begin: { teas, errorMessage: 'The last thing, it failed' },
    end: { teas, loading: true },
  },
  {
    description: 'Notes Page Data Loaded Success: adds the notes / clears the loading flag',
    action: notesPageLoadedSuccess({ notes }),
    begin: { teas, loading: true },
    end: { teas, notes },
  },
  {
    description: 'Notes Page Data Loaded Failure: adds the error message / clears the loading flag',
    action: notesPageLoadedFailure({ errorMessage: 'Something is borked' }),
    begin: { notes, teas, loading: true },
    end: { notes, teas, errorMessage: 'Something is borked' },
  },
  {
    description: 'Note Saved: sets the loading flag and clears any error message',
    action: noteSaved({ note: notes[2] }),
    begin: { notes, teas, errorMessage: 'The last thing, it failed' },
    end: { notes, teas, loading: true },
  },
  {
    description: 'Note Saved Success: updates an existing note',
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
    description: 'Note Saved Success: appends a new note',
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
    description: 'Note Saved Failure: adds the error message / clears the loading flag',
    action: noteSavedFailure({ errorMessage: 'Something is borked' }),
    begin: { notes, teas, loading: true },
    end: { notes, teas, errorMessage: 'Something is borked' },
  },
  {
    description: 'Note Deleted: sets the loading flag and clears any error message',
    action: noteDeleted({ note: notes[0] }),
    begin: { notes, teas, errorMessage: 'The last thing, it failed' },
    end: { notes, teas, loading: true },
  },
  {
    description: 'Note Deleted Success: removes the note',
    action: noteDeletedSuccess({ note: notes[1] }),
    begin: { notes, teas, loading: true },
    end: { notes: [notes[0], notes[2]], teas },
  },
  {
    description: 'Note Deleted Failure: adds the error message / clears the loading flag',
    action: noteDeletedFailure({ errorMessage: 'Something is borked' }),
    begin: { notes, teas, loading: true },
    end: { notes, teas, errorMessage: 'Something is borked' },
  },
```

Finally, add the code to the reducer:

```TypeScript
  on(Actions.notesPageLoaded, (state): DataState => ({
    ...state,
    loading: true,
    errorMessage: '',
  })),
  on(Actions.notesPageLoadedSuccess, (state, { notes }): DataState => ({
    ...state,
    loading: false,
    notes,
  })),
  on(Actions.notesPageLoadedFailure, (state, { errorMessage }): DataState => ({
    ...state,
    loading: false,
    errorMessage,
  })),
  on(Actions.noteSaved, (state): DataState => ({
    ...state,
    loading: true,
    errorMessage: '',
  })),
  on(Actions.noteSavedSuccess, (state, { note }): DataState => {
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
  on(Actions.noteSavedFailure, (state, { errorMessage }): DataState => ({
    ...state,
    loading: false,
    errorMessage,
  })),
  on(Actions.noteDeleted, (state): DataState => ({
    ...state,
    loading: true,
    errorMessage: '',
  })),
  on(Actions.noteDeletedSuccess, (state, { note }): DataState => {
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
  on(Actions.noteDeletedFailure, (state, { errorMessage }): DataState => ({
    ...state,
    loading: false,
    errorMessage,
  })),
```

#### Effects

For our tests, we will need some test data as well, so add the same test data that we added to the data reducer tests.

```TypeScript
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
            type: '[Data API] notes page loaded success',
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
            type: '[Data API] notes page loaded failure',
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
            type: '[Data API] note saved success',
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
            type: '[Data API] note saved failure',
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
            type: '[Data API] note deleted success',
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
            type: '[Data API] note deleted failure',
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
      mergeMap((action) =>
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

Be sure to inject the `TastingNotesService`.

```TypeScript
  constructor(
    private actions$: Actions,
    private tastingNotesService: TastingNotesService,
    private teaService: TeaService,
  ) {}
```

#### Selectors

For selectors, we need one to get all of the notes and one to get a specific note.

```TypeScript
import { TastingNote, Tea } from '@app/models';
...
export const selectNotes = createSelector(selectData, (state: DataState) => state.notes);
export const selectNote = (id: number) =>
  createSelector(selectNotes, (notes: Array<TastingNote>) => notes.find((t) => t.id === id));
```

### The Editor Component

#### `src/app/tasting-notes/tasting-note-editor/tasting-note-editor.module.ts`

```TypeScript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SharedModule } from '@app/shared';
import { TastingNoteEditorComponent } from './tasting-note-editor.component';

@NgModule({
  declarations: [TastingNoteEditorComponent],
  exports: [TastingNoteEditorComponent],
  imports: [CommonModule, FormsModule, IonicModule, SharedModule],
})
export class TastingNoteEditorModule {}
```

#### `src/app/tasting-notes/tasting-note-editor/tasting-note-editor.component.spec.ts`

```TypeScript
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { IonicModule, ModalController } from '@ionic/angular';

import { SharedModule } from '@app/shared';
import { selectTeas } from '@app/store';
import { DataState, initialState } from '@app/store/reducers/data.reducer';
import { createOverlayControllerMock } from '@test/mocks';
import { TastingNoteEditorComponent } from './tasting-note-editor.component';
import { noteSaved } from '@app/store/actions';

describe('TastingNoteEditorComponent', () => {
  let component: TastingNoteEditorComponent;
  let fixture: ComponentFixture<TastingNoteEditorComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TastingNoteEditorComponent],
        imports: [FormsModule, IonicModule, SharedModule],
        providers: [
          provideMockStore<{ data: DataState }>({
            initialState: { data: initialState },
          }),
          {
            provide: ModalController,
            useFactory: () => createOverlayControllerMock('ModalController'),
          },
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
    }),
  );

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('binds the tea select', () => {
      fixture.detectChanges();
      const sel = fixture.debugElement.query(By.css('ion-select'));
      const opts = sel.queryAll(By.css('ion-select-option'));
      expect(opts[0].nativeElement.value).toEqual('7');
      expect(opts[0].nativeElement.textContent).toEqual('White');
      expect(opts[1].nativeElement.value).toEqual('8');
      expect(opts[1].nativeElement.textContent).toEqual('Yellow');
    });

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

      it('has the update title', () => {
        const el = fixture.debugElement.query(By.css('ion-title'));
        expect(el.nativeElement.textContent).toEqual('Tasting Note');
      });

      it('has the update button label', () => {
        const footer = fixture.debugElement.query(By.css('ion-footer'));
        const el = footer.query(By.css('ion-button'));
        expect(el.nativeElement.textContent).toEqual('Update');
      });
    });
  });

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

  describe('close', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('dismisses the modal', () => {
      const modalController = TestBed.inject(ModalController);
      component.close();
      expect(modalController.dismiss).toHaveBeenCalledTimes(1);
    });
  });
});
```

#### `src/app/tasting-notes/tasting-note-editor/tasting-note-editor.component.ts`

```TypeScript
import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { TastingNote, Tea } from '@app/models';
import { selectTeas } from '@app/store';
import { ModalController } from '@ionic/angular';
import { noteSaved } from '@app/store/actions';

@Component({
  selector: 'app-tasting-note-editor',
  templateUrl: './tasting-note-editor.component.html',
  styleUrls: ['./tasting-note-editor.component.scss'],
})
export class TastingNoteEditorComponent implements OnInit {
  @Input() note: TastingNote;

  brand: string;
  name: string;
  teaCategoryId: string;
  rating: number;
  notes: string;

  teaCategories$: Observable<Array<Tea>>;

  constructor(private modalController: ModalController, private store: Store) {}

  get title(): string {
    return this.note ? 'Tasting Note' : 'Add New Tasting Note';
  }

  get buttonLabel(): string {
    return this.note ? 'Update' : 'Add';
  }

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

  close() {
    this.modalController.dismiss();
  }

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
}
```

#### `src/app/tasting-notes/tasting-note-editor/tasting-note-editor.component.html`

```html
<ion-header>
  <ion-toolbar>
    <ion-title>{{ title }}</ion-title>
    <ion-buttons slot="primary">
      <ion-button id="cancel-button" (click)="close()">
        <ion-icon slot="icon-only" name="close"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content>
  <form #notesEditorForm="ngForm">
    <ion-item>
      <ion-label position="floating">Brand</ion-label>
      <ion-input id="brand-input" name="brand" [(ngModel)]="brand" #brandInput="ngModel" required></ion-input>
    </ion-item>
    <ion-item>
      <ion-label position="floating">Name</ion-label>
      <ion-input id="name-input" name="name" [(ngModel)]="name" #nameInput="ngModel" required></ion-input>
    </ion-item>
    <ion-item>
      <ion-label>Type</ion-label>
      <ion-select name="tea-type-select" [(ngModel)]="teaCategoryId" #teaTypeSelect="ngModel" required>
        <ion-select-option *ngFor="let t of teaCategories$ | async" value="{{ t.id }}">{{ t.name }}</ion-select-option>
      </ion-select>
    </ion-item>
    <ion-item>
      <ion-label>Rating</ion-label>
      <app-rating [(ngModel)]="rating" id="rating-input" name="rating" #ratingInput="ngModel" required></app-rating>
    </ion-item>
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
  </form>
</ion-content>

<ion-footer>
  <ion-toolbar>
    <ion-button expand="full" [disabled]="!notesEditorForm.form.valid" (click)="save()">{{ buttonLabel }}</ion-button>
  </ion-toolbar>
</ion-footer>
```

### List the Notes

#### `src/app/tasting-notes/tasting-notes.page.html`

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
</ion-content>
```

#### `src/app/tasting-notes/tasting-notes.page.spec.ts`

```TypeScript
import {
  waitForAsync,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { IonicModule } from '@ionic/angular';

import { DataState, initialState } from '@app/store/reducers/data.reducer';
import { TastingNotesPage } from './tasting-notes.page';
import { selectNotes } from '@app/store';
import { TastingNote } from '@app/models';
import { notesPageLoaded } from '@app/store/actions';

describe('TastingNotesPage', () => {
  let component: TastingNotesPage;
  let fixture: ComponentFixture<TastingNotesPage>;
  let modal: HTMLIonModalElement;
  let testData: Array<TastingNote>;

  const mockRouterOutlet = {
    nativeEl: {},
  };

  beforeEach(
    waitForAsync(() => {
      initializeTestData();
      TestBed.configureTestingModule({
        declarations: [TastingNotesPage],
        imports: [IonicModule],
        providers: [
          provideMockStore<{ data: DataState }>({
            initialState: { data: initialState },
          }),
        ],
      }).compileComponents();

      const store = TestBed.inject(Store) as MockStore;
      store.overrideSelector(selectNotes, testData);

      fixture = TestBed.createComponent(TastingNotesPage);
      component = fixture.componentInstance;
    }),
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

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
      expect(items[0].nativeElement.textContent).toContain('Bentley');
      expect(items[1].nativeElement.textContent).toContain('Lipton');
    });
  });

  const click = (button: HTMLElement) => {
    const event = new Event('click');
    button.dispatchEvent(event);
    fixture.detectChanges();
  }

  const initializeTestData = () => {
    testData = [
      {
        id: 73,
        brand: 'Bentley',
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
});
```

#### `src/app/tasting-notes/tasting-notes.page.ts`

```TypeScript
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { TastingNote } from '@app/models';
import { selectNotes } from '@app/store';
import { notesPageLoaded } from '@app/store/actions';

@Component({
  selector: 'app-tasting-notes',
  templateUrl: './tasting-notes.page.html',
  styleUrls: ['./tasting-notes.page.scss'],
})
export class TastingNotesPage implements OnInit {
  notes$: Observable<Array<TastingNote>>;

  constructor(
    private store: Store,
  ) {}

  ngOnInit() {
    this.store.dispatch(notesPageLoaded());
    this.notes$ = this.store.select(selectNotes);
  }
}
```

## Using the Notes Editor

Now we are getting into the new stuff. Back to the usual format. 🤓

We are going to use the Notes Editor in a modal in order to accomplish two different tasks:

- adding a new note
- updating an existing note

With that in mind, let's update the test and the view model so we can inject the items that we will require. **Note:** adding the proper `import` statements is left as an exercise for the reader.

In `src/app/tasting-notes/tasting-notes.page.spec.ts`, update the `TestBed` configuration to provide the `ModalController` and the `IonRouterOutlet`. The full `beforeEach` should look something like the following. **Do not** copy past this in. Instead just add the parts you don't have, using the auto-complete and auto-import features of your editor to get the proper `import` statements added for you. Here is a synopsis of the changes:

- create a mock for the modal element
- import the `TastingNoteEditorModule`
- provide mocks for the `IonRouterOutlet` and `ModalController`

```TypeScript
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
    }),
  );
```

In `src/app/tasting-notes/tasting-notes.page.ts` inject the same items that we just set up providers for:

```TypeScript
  constructor(
    private modalController: ModalController,
    private routerOutlet: IonRouterOutlet,
    private store: Store,
  ) {}
```

Finally, in `src/app/tasting-notes/tasting-notes.module.ts`, add `TastingNoteEditorModule` to the imports list:

```TypeScript
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TastingNoteEditorModule,
    TastingNotesPageRoutingModule,
  ],
```

### Add a New Note

Adding a new node will be handled via a <a href="https://ionicframework.com/docs/api/fab" target="_blank">floating action button</a>. Add the following markup to the tasting notes page HTML within the `ion-content`:

```html
<ion-fab vertical="bottom" horizontal="end" slot="fixed">
  <ion-fab-button data-testid="add-new-button" (click)="newNote()">
    <ion-icon name="add"></ion-icon>
  </ion-fab-button>
</ion-fab>
```

In our test, we will verify that the modal is properly opened:

```TypeScript
  describe('add new note', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('creates the editor modal', () => {
      const modalController = TestBed.inject(ModalController);
      const button = fixture.debugElement.query(
        By.css('[data-testid="add-new-button"]'),
      ).nativeElement;
      click(button);
      expect(modalController.create).toHaveBeenCalledTimes(1);
      expect(modalController.create).toHaveBeenCalledWith({
        component: TastingNoteEditorComponent,
        backdropDismiss: false,
        canDismiss: true,
        presentingElement: mockRouterOutlet.nativeEl as any,
      });
    });

    it('displays the editor modal', fakeAsync(() => {
      const button = fixture.debugElement.query(
        By.css('[data-testid="add-new-button"]'),
      ).nativeElement;
      click(button);
      tick();
      expect(modal.present).toHaveBeenCalledTimes(1);
    }));
  });
```

The code required to perform this action is:

```TypeScript
  async newNote(): Promise<void> {
    const modal = await this.modalController.create({
      component: TastingNoteEditorComponent,
      backdropDismiss: false,
      canDismiss: true,
      presentingElement: this.routerOutlet.nativeEl,
    });
    modal.present();
  }
```

When you click on the FAB button, you should be able to add a tasting note. Check that out to determine if it works.

### Edit an Existing Note

The modal editor component handles editing an existing note by binding the `note` property to the note to be edited when the modal is created. Let's change the code to support that.

Find the `ion-item` that displays each note in the list and add the following event binding:

```html
<ion-item (click)="updateNote(note)" ...> ... </ion-item>
```

Now we can add a set of tests:

```TypeScript
  describe('update an existing note', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('creates the editor modal', () => {
      const modalController = TestBed.inject(ModalController);
      const item = fixture.debugElement.query(By.css('ion-item')).nativeElement;
      click(item);
      expect(modalController.create).toHaveBeenCalledTimes(1);
      expect(modalController.create).toHaveBeenCalledWith({
        component: TastingNoteEditorComponent,
        backdropDismiss: false,
        swipeToClose: true,
        presentingElement: mockRouterOutlet.nativeEl as any,
        componentProps: { note: testData[0] },
      });
    });

    it('displays the editor modal', fakeAsync(() => {
      const item = fixture.debugElement.query(By.css('ion-item')).nativeElement;
      click(item);
      tick();
      expect(modal.present).toHaveBeenCalledTimes(1);
    }));
  });
```

The quick and dirty way to get this test to pass is to copy the `newNote()` method and add the note property binding to it as such:

```TypeScript
  async updateNote(note: TastingNote): Promise<void> {
    const modal = await this.modalController.create({
      component: TastingNoteEditorComponent,
      backdropDismiss: false,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: { note },
    });
    modal.present();
  }
```

But that is a lot of repeated code with just a one line difference. Let's refactor that a bit:

```TypeScript
  newNote(): Promise<void> {
    return this.displayEditor();
  }

  updateNote(note: TastingNote): Promise<void> {
    return this.displayEditor(note);
  }

  private async displayEditor(note?: TastingNote): Promise<void> {
    // Filling in this code is left as an exercise for you
  }
```

Try clicking on an existing note to make sure that you can properly update it.

## Delete a Note

The final feature we will add is the ability to delete a note. We will keep this one simple and make it somewhat hidden so that it isn't too easy for a user to delete a note.

We will use a construct called a <a ref="https://ionicframework.com/docs/api/item-sliding" target="_blank">item sliding</a> to essentially "hide" the delete button behind the item. That way the user has to slide the item over in order to expose the button and do a delete.

Doing this results in a little bit of rework in how the item is rendered and bound on the `TastingNotesPage`:

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
