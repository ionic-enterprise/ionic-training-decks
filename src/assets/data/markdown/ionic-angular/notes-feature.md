# Lab: Add the Notes Feature

In this lab, we will take what we have learned so far and add a whole new feature to our application. Specifically, we will add the "Tasting Notes" feature. In addition to exercising some skills we have already learned such as creating models, services, components, and pages, we will also use some Framework components we have not seen yet. These will include:

- The modal overlay
- Various form elements
- The sliding Ion Item

## Preliminary Items

There are a couple of preliminary items that we need to get out of the way first.

- Create a data model
- Create a data service that performs HTTP requests

These are a couple of things we have done multiple times now, so I will just give you the code to move things along. If you are still unsure on these items, though, please review the code that is provided here.

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

  describe('get', () => {
    it('gets the specific note', () => {
      service.get(4).subscribe();
      const req = httpTestingController.expectOne(
        `${environment.dataService}/user-tasting-notes/4`,
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

  get(id: number): Observable<TastingNote> {
    return this.http.get<TastingNote>(
      `${environment.dataService}/user-tasting-notes/${id}`,
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
    get: EMPTY,
    delete: EMPTY,
    save: EMPTY,
  });
}
```

**Reminder:** update the `core` barrel files as well.

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

Make the same change within the `src/app/tasting-notes/tasting-note-editor/tasting-note-editor.component.spec.ts` where the testing module is configured.

### Hookup the Modal

The first thing we need to do is get a modal overlay hooked up for the "add a new note" case. This will allow us to test out the component for the modal as we develop it. This will also get the infrastructure for the rest of our modifications in place. We will launch the modal for the "add a new note" scenario from a floating action button on the `TastingNotesPage`.

First we need to set up the test for the `TastingNotesPage`.

```typescript
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
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

  beforeEach(async(() => {
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
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('add new note', () => {
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

### Create the Editor Component

#### Basic Layout

After that, let's start laying out the basics of our form. We know what we will need a header section with a title, a footer secion with a button, and that the content will be our form. So let's start there:

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

That looks good, but our tests are putting out some odd warnings now. Let's update `src/app/tasting-notes/tasting-note-editor/tasting-note-editor.component.spec.ts` so that it imports the proper modules:

```typescript
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { TastingNoteEditorComponent } from './tasting-note-editor.component';
import { SharedModule } from '@app/shared';

describe('TastingNoteEditorComponent', () => {
  let component: TastingNoteEditorComponent;
  let fixture: ComponentFixture<TastingNoteEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TastingNoteEditorComponent],
      imports: [FormsModule, IonicModule, SharedModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TastingNoteEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

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

Note that the `teaCategoryId` is a string even though in reality it is a number. The reason for this is because the values in the select always bind as a string just due to how HTML attributes work, so we will need to convert this to a number when we do the save.

##### Initialization

The only initialization we need at this point is to set up the `teaCategories$` observable such that our `ion-select` is bound properly.

###### Test

```typescript
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TastingNoteEditorComponent],
      imports: [FormsModule, IonicModule, SharedModule],
      providers: [{ provide: TeaService, useFactory: createTeaServiceMock }],
    }).compileComponents();

    const teaService = TestBed.inject(TeaService);
    (teaService.getAll as any).and.returnValue(
      of([
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
      ]),
    );

    fixture = TestBed.createComponent(TastingNoteEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

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
```

###### Code

The population of the `ion-select-option` values is handled via `*ngFor="let t of teaCategories$ | async"` so all we need to do at this point is assign the `teaCategories$` observable. You will need to inject the `TeaService`.

```typescript
  ngOnInit() {
    this.teaCategories$ = this.teaService.getAll();
  }
```

##### Perform the Add

The add is relativily easy. Create a tea object using the properties, call `tastingNotesService.save()`, and close the modal.

###### Test

First update the `TestBed` to provide the `TastingNotesService` and the `ModalController`. You should have a good set of examples of how to do this, so no code is provided here.

Once that is in place, here is the code for the tests:

```typescript
describe('save', () => {
  beforeEach(() => {
    const tastingNotesService = TestBed.inject(TastingNotesService);
    (tastingNotesService.save as any).and.returnValue(
      of({
        id: 73,
        brand: 'Lipton',
        name: 'Yellow Label',
        teaCategoryId: 3,
        rating: 1,
        notes: 'ick',
      }),
    );
  });

  it('saves the data', () => {
    const tastingNotesService = TestBed.inject(TastingNotesService);
    component.brand = 'Lipton';
    component.name = 'Yellow Label';
    component.teaCategoryId = '3';
    component.rating = 1;
    component.notes = 'ick';
    component.save();
    expect(tastingNotesService.save).toHaveBeenCalledTimes(1);
    expect(tastingNotesService.save).toHaveBeenCalledWith({
      brand: 'Lipton',
      name: 'Yellow Label',
      teaCategoryId: 3,
      rating: 1,
      notes: 'ick',
    });
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
    this.tastingNotesService
      .save({
        brand: this.brand,
        name: this.name,
        teaCategoryId: parseInt(this.teaCategoryId, 10),
        rating: this.rating,
        notes: this.notes,
      })
      .pipe(tap(() => this.modalController.dismiss()))
      .subscribe();
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

  // Most of this exists already. Add the parts that are currently missing
  beforeEach(async(() => {
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
        {
          provide: TastingNotesService,
          useFactory: createTastingNotesServiceMock,
        },
      ],
    }).compileComponents();

    const tastingNotesService = TestBed.inject(TastingNotesService);
    (tastingNotesService.getAll as any).and.returnValue(of(testData));

    fixture = TestBed.createComponent(TastingNotesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

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

Then we can create a couple of simple tests to ensure our list is displayed properly.

```typescript
describe('initialization', () => {
  it('gets all of the notes', () => {
    const tastingNotesService = TestBed.inject(TastingNotesService);
    expect(tastingNotesService.getAll).toHaveBeenCalledTimes(1);
  });

  it('displays the notes', () => {
    const items = fixture.debugElement.queryAll(By.css('ion-item'));
    expect(items.length).toEqual(2);
    expect(items[0].nativeElement.textContent).toContain('Bently');
    expect(items[1].nativeElement.textContent).toContain('Lipton');
  });
});
```

### Code

```typescript
  notes$: Observable<Array<TastingNote>>;
...
  ngOnInit() {
    this.notes$ = this.tastingNotesService.getAll();
  }
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

## Refresh the Notes

The notes we have added so far show up, but when we add a new note it does not. We can easily fix that by adding a "refresh" subject to our pipeline.

### Test

Add the following tests to the "add new note" section of `src/app/tasting-notes/tasting-notes.page.spec.ts`. We want to make sure we wait for the modal to be dismissed and that we refresh the note list.

```typescript
it('waits for the dismiss', async () => {
  await component.newNote();
  expect(modal.onDidDismiss).toHaveBeenCalledTimes(1);
});

it('refreshes the notes list', async () => {
  const tastingNotesService = TestBed.inject(TastingNotesService);
  await component.newNote();
  expect(tastingNotesService.getAll).toHaveBeenCalledTimes(2);
});
```

### Code

We need to:

- Declare the subject
- Instantiate the subject in the constructor
- Inrcorporate the subject into our observable pipeline

```typescript
  private refresh: BehaviorSubject<void>;

  constructor(
    private modalController: ModalController,
    private routerOutlet: IonRouterOutlet,
    private tastingNotesService: TastingNotesService,
  ) {
    this.refresh = new BehaviorSubject(null);
  }

  ngOnInit() {
    this.notes$ = this.refresh.pipe(
      switchMap(() => this.tastingNotesService.getAll()),
    );
  }
```

Then, in the code that handles the modal, we await the dismiss of the modal and emit on the refresh subject to trigger the refresh in the pipeline.

```typescript
  async newNote(): Promise<void> {
    const modal = await this.modalController.create({
      component: TastingNoteEditorComponent,
      backdropDismiss: false,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
    });
    await modal.present();
    await modal.onDidDismiss();
    this.refresh.next();
  }
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

  it('waits for the dismiss', async () => {
    await component.updateNote(note);
    expect(modal.onDidDismiss).toHaveBeenCalledTimes(1);
  });

  it('refreshes the notes list', async () => {
    const tastingNotesService = TestBed.inject(TastingNotesService);
    await component.updateNote(note);
    expect(tastingNotesService.getAll).toHaveBeenCalledTimes(2);
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

This will allow is to set up data before the `ngOnInit()` call is made. Note tht for the "save" tests, you can put the call at the end of the "save" `beforeEach()`

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
    this.teaCategories$ = this.teaService.getAll();
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
      const tastingNotesService = TestBed.inject(TastingNotesService);
      (tastingNotesService.save as any).and.returnValue(
        of({
          id: 73,
          brand: 'Lipton',
          name: 'Yellow Label',
          teaCategoryId: 3,
          rating: 1,
          notes: 'ick',
        }),
      );
      fixture.detectChanges();
    });

    it('saves the data', () => {
      const tastingNotesService = TestBed.inject(TastingNotesService);
      component.brand = 'Lipton';
      component.name = 'Yellow Label';
      component.teaCategoryId = '3';
      component.rating = 1;
      component.notes = 'ick';
      component.save();
      expect(tastingNotesService.save).toHaveBeenCalledTimes(1);
      expect(tastingNotesService.save).toHaveBeenCalledWith({
        brand: 'Lipton',
        name: 'Yellow Label',
        teaCategoryId: 3,
        rating: 1,
        notes: 'ick',
      });
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
      const tastingNotesService = TestBed.inject(TastingNotesService);
      (tastingNotesService.save as any).and.returnValue(
        of({
          id: 73,
          brand: 'Lipton',
          name: 'Yellow Label',
          teaCategoryId: 3,
          rating: 1,
          notes: 'ick',
        }),
      );
      fixture.detectChanges();
    });

    it('saves the data including the ID', () => {
      const tastingNotesService = TestBed.inject(TastingNotesService);
      component.brand = 'Lipton';
      component.name = 'Yellow Label';
      component.teaCategoryId = '3';
      component.rating = 1;
      component.notes = 'ick';
      component.save();
      expect(tastingNotesService.save).toHaveBeenCalledTimes(1);
      expect(tastingNotesService.save).toHaveBeenCalledWith({
        id: 73,
        brand: 'Lipton',
        name: 'Yellow Label',
        teaCategoryId: 3,
        rating: 1,
        notes: 'ick',
      });
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

    this.tastingNotesService
      .save(note)
      .pipe(tap(() => this.modalController.dismiss()))
      .subscribe();
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

We will use a contruct called a <a ref="" target="_blank">item sliding</a> to essentially "hide" the delete button behind the item. That way the user has to slide the item over in order to expose the button and do a delete.

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
    this.tastingNotesService
      .delete(note.id)
      .pipe(tap(() => this.refresh.next()))
      .subscribe();
  }
```

**Extra Credit #1:** Normally, we would write the tests first and then the code. Here we did not, but that is because I wanted to give you some practice crafting your own tests.

**Extra Credit #2:** You could also use an alert to ask the user if they _really_ want to delete the note. Extra extra credit if you want to implement that logic.

## Conclusion

Congratulations. You have used what we have learned to this point to add a whole new feature to your app. Along the way, you also exercised a few Framework components you had not used before. We are almost done with this app. One more page to go and we will be done.
