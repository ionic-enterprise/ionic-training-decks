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

**Important:** These are a few things we have done multiple times now. As such, we will often provide you with some skeleton code and leave you to fill in the logic. If you get stuck, you can look at the <a href="https://github.com/ionic-enterprise/tea-taster-angular" target="_blank">completed code</a>, but try not to.

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

I'll provide the skeleton, you provide the actual logic.

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable } from 'rxjs';

import { TastingNote } from '@app/models';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class TastingNotesService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Array<TastingNote>> {
    // TODO: Replace with actual code, see the tea service if you need a hint.
    //       This one is a lot easier, though, as there are no data transforms.
    return EMPTY;
  }

  delete(id: number): Observable<void> {
    // TODO: Replace with actual code
    return EMPTY;
  }

  save(note: TastingNote): Observable<TastingNote> {
    // TODO: Replace with actual code
    return EMPTY;
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

### The Editor Component

#### `src/app/tasting-notes/tasting-note-editor/tasting-note-editor.module.ts`

```TypeScript
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared';
import { IonicModule } from '@ionic/angular';
import { TastingNoteEditorComponent } from './tasting-note-editor.component';

@NgModule({
  declarations: [TastingNoteEditorComponent],
  exports: [TastingNoteEditorComponent],
  imports: [CommonModule, IonicModule, ReactiveFormsModule, SharedModule],
})
export class TastingNoteEditorModule {}
```

#### `src/app/tasting-notes/tasting-note-editor/tasting-note-editor.component.spec.ts`

```TypeScript
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TastingNotesService, TeaService } from '@app/core';
import { createTastingNotesServiceMock, createTeaServiceMock } from '@app/core/testing';
import { SharedModule } from '@app/shared';
import { IonicModule, ModalController } from '@ionic/angular';
import { createOverlayControllerMock } from '@test/mocks';
import { of } from 'rxjs';

import { TastingNoteEditorComponent } from './tasting-note-editor.component';

describe('TastingNoteEditorComponent', () => {
  let component: TastingNoteEditorComponent;
  let fixture: ComponentFixture<TastingNoteEditorComponent>;

  const click = (button: HTMLElement) => {
    const event = new Event('click');
    button.dispatchEvent(event);
    fixture.detectChanges();
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TastingNoteEditorComponent],
      imports: [IonicModule, ReactiveFormsModule, SharedModule],
      providers: [
        { provide: ModalController, useFactory: () => createOverlayControllerMock('ModalController') },
        { provide: TastingNotesService, useFactory: createTastingNotesServiceMock },
        { provide: TeaService, useFactory: createTeaServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TastingNoteEditorComponent);
    component = fixture.componentInstance;
    const tea = TestBed.inject(TeaService);
    (tea.getAll as jasmine.Spy).and.returnValue(
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
      ])
    );
  }));

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('binds the tea select', () => {
      fixture.detectChanges();
      const sel = fixture.debugElement.query(By.css('ion-select'));
      const opts = sel.queryAll(By.css('ion-select-option'));
      expect(opts.length).toEqual(2);
      expect(opts[0].nativeElement.value).toEqual(7);
      expect(opts[0].nativeElement.textContent).toEqual('White');
      expect(opts[1].nativeElement.value).toEqual(8);
      expect(opts[1].nativeElement.textContent).toEqual('Yellow');
    });

    describe('without a note', () => {
      beforeEach(() => {
        fixture.detectChanges();
      });

      it('has the add title', () => {
        const el = fixture.debugElement.query(By.css('ion-title'));
        expect(el.nativeElement.textContent).toEqual('Add Note');
      });

      it('has the add button label', () => {
        const btn = fixture.debugElement.query(By.css('[data-testid="save-button"]'));
        expect(btn.nativeElement.textContent).toEqual('Add');
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

      it('sets the brand', () => {
        const brand = fixture.debugElement.query(By.css('[data-testid="brand-input"]'));
        expect(brand.nativeElement.value).toEqual('Lipton');
      });

      it('sets the name', () => {
        const name = fixture.debugElement.query(By.css('[data-testid="name-input"]'));
        expect(name.nativeElement.value).toEqual('Yellow Label');
      });

      it('sets the notes', () => {
        const notes = fixture.debugElement.query(By.css('[data-testid="notes-input"]'));
        expect(notes.nativeElement.value).toEqual('Overly acidic, highly tannic flavor');
      });

      it('sets the tea category id', () => {
        const sel = fixture.debugElement.query(By.css('[data-testid="tea-type-select"]'));
        expect(sel.nativeElement.value).toEqual(3);
      });

      it('has the update title', () => {
        const el = fixture.debugElement.query(By.css('ion-title'));
        expect(el.nativeElement.textContent).toEqual('Update Note');
      });

      it('has the update button label', () => {
        const btn = fixture.debugElement.query(By.css('[data-testid="save-button"]'));
        expect(btn.nativeElement.textContent).toEqual('Update');
      });
    });
  });

  describe('save', () => {
    beforeEach(() => {
      const tastingNotes = TestBed.inject(TastingNotesService);
      (tastingNotes.save as jasmine.Spy).and.returnValue(of(null));
    });

    describe('a new note', () => {
      beforeEach(() => {
        fixture.detectChanges();
      });

      it('saves the entered data', () => {
        const tastingNotes = TestBed.inject(TastingNotesService);
        const btn = fixture.debugElement.query(By.css('[data-testid="save-button"]'));
        component.editorForm.controls.brand.setValue('Lipton');
        component.editorForm.controls.name.setValue('Yellow Label');
        component.editorForm.controls.teaCategoryId.setValue(3);
        component.editorForm.controls.rating.setValue(1);
        component.editorForm.controls.notes.setValue('ick');
        click(btn.nativeElement);
        expect(tastingNotes.save).toHaveBeenCalledTimes(1);
        expect(tastingNotes.save).toHaveBeenCalledWith({
          brand: 'Lipton',
          name: 'Yellow Label',
          teaCategoryId: 3,
          rating: 1,
          notes: 'ick',
        });
      });

      it('dismisses the modal', () => {
        const btn = fixture.debugElement.query(By.css('[data-testid="save-button"]'));
        const modalController = TestBed.inject(ModalController);
        click(btn.nativeElement);
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
        const tastingNotes = TestBed.inject(TastingNotesService);
        const btn = fixture.debugElement.query(By.css('[data-testid="save-button"]'));
        component.editorForm.controls.brand.setValue('Lipton');
        component.editorForm.controls.name.setValue('Yellow Label');
        component.editorForm.controls.teaCategoryId.setValue(3);
        component.editorForm.controls.rating.setValue(1);
        component.editorForm.controls.notes.setValue('ick');
        click(btn.nativeElement);
        expect(tastingNotes.save).toHaveBeenCalledTimes(1);
        expect(tastingNotes.save).toHaveBeenCalledWith({
          id: 73,
          brand: 'Lipton',
          name: 'Yellow Label',
          teaCategoryId: 3,
          rating: 1,
          notes: 'ick',
        });
      });

      it('dismisses the modal', () => {
        const btn = fixture.debugElement.query(By.css('[data-testid="save-button"]'));
        const modalController = TestBed.inject(ModalController);
        click(btn.nativeElement);
        expect(modalController.dismiss).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('close', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('dismisses the modal', () => {
      const btn = fixture.debugElement.query(By.css('[data-testid="cancel-button"]'));
      const modalController = TestBed.inject(ModalController);
      click(btn.nativeElement);
      expect(modalController.dismiss).toHaveBeenCalledTimes(1);
    });
  });
});
```

#### `src/app/tasting-notes/tasting-note-editor/tasting-note-editor.component.html`

```html
<ion-header>
  <ion-toolbar>
    <ion-title>{{ title }}</ion-title>
    <ion-buttons slot="start">
      <ion-button id="cancel-button" (click)="close()" data-testid="cancel-button"> Cancel </ion-button>
    </ion-buttons>
    <ion-buttons slot="end">
      <ion-button expand="full" [disabled]="!editorForm.valid" (click)="save()" data-testid="save-button"
        >{{ buttonLabel }}</ion-button
      >
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content>
  <form [formGroup]="editorForm">
    <ion-item>
      <ion-input
        id="brand-input"
        name="brand"
        label="Brand"
        label-placement="floating"
        formControlName="brand"
        data-testid="brand-input"
      ></ion-input>
    </ion-item>
    <ion-item>
      <ion-input
        id="name-input"
        name="name"
        label="Name"
        label-placement="floating"
        formControlName="name"
        data-testid="name-input"
      ></ion-input>
    </ion-item>
    <ion-item>
      <ion-select name="tea-type-select" label="Type" formControlName="teaCategoryId" data-testid="tea-type-select">
        <ion-select-option *ngFor="let t of teaCategories$ | async" [value]="t.id">{{ t.name }}</ion-select-option>
      </ion-select>
    </ion-item>
    <ion-item>
      <ion-label>Rating</ion-label>
      <app-rating id="rating-input" name="rating" formControlName="rating" data-testid="rating"></app-rating>
    </ion-item>
    <ion-item>
      <ion-textarea
        id="notes-textbox"
        name="notes"
        label="Notes"
        label-placement="floating"
        formControlName="notes"
        rows="5"
        data-testid="notes-input"
      ></ion-textarea>
    </ion-item>
  </form>
</ion-content>
```

#### `src/app/tasting-notes/tasting-note-editor/tasting-note-editor.component.ts`

There are two TODOs in the following code. Copy the rest of the code in to your TypeScript file, then fill in the TODOs.

```TypeScript
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { TastingNotesService, TeaService } from '@app/core';
import { TastingNote, Tea } from '@app/models';
import { ModalController } from '@ionic/angular';
import { Observable, of, tap } from 'rxjs';

@Component({
  selector: 'app-tasting-note-editor',
  templateUrl: './tasting-note-editor.component.html',
  styleUrls: ['./tasting-note-editor.component.scss'],
})
export class TastingNoteEditorComponent implements OnInit {
  @Input()
  note: TastingNote | undefined;

  editorForm = this.fb.group({
    brand: ['', Validators.required],
    name: ['', Validators.required],
    teaCategoryId: new FormControl<number | undefined>(undefined, { validators: [Validators.required] }),
    rating: [0, Validators.required],
    notes: ['', Validators.required],
  });
  buttonLabel: string = '';
  title: string = '';
  teaCategories$: Observable<Array<Tea>> = of([]);

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private tastingNotes: TastingNotesService,
    private tea: TeaService
  ) {}

  close() {
    this.modalController.dismiss();
  }

  async save() {
    const note: TastingNote = {
      // TODO: Figure out how to set this based on the test we just wrote. As an example, here is
      //       how to set the brand:
      brand: this.editorForm.controls.brand.value as string,
    };

    this.tastingNotes
      .save(note)
      .pipe(tap(() => this.modalController.dismiss()))
      .subscribe();
  }

  ngOnInit() {
    this.teaCategories$ = this.tea.getAll();
    if (this.note) {
      // TODO: Figure out what needs to be done here if a `note` is passed via property
      // HINT: this.editorForm.controls.brand.setValue(this.note.brand);
      //       ...
      //       this.buttonLabel = 'Update'
      //       ...
    } else {
      // TODO: Only the buttonLabel and title need to get set here.
    }
  }
}
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
import { fakeAsync, tick, waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TastingNotesService } from '@app/core';
import { createTastingNotesServiceMock } from '@app/core/testing';
import { TastingNote } from '@app/models';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';
import { TastingNotesPage } from './tasting-notes.page';

describe('TastingNotesPage', () => {
  let component: TastingNotesPage;
  let fixture: ComponentFixture<TastingNotesPage>;
  let modal: HTMLIonModalElement;
  let testData: Array<TastingNote>;

  const mockRouterOutlet = {
    nativeEl: {},
  };

  beforeEach(waitForAsync(() => {
    initializeTestData();
    TestBed.configureTestingModule({
      declarations: [TastingNotesPage],
      imports: [IonicModule],
      providers: [{ provide: TastingNotesService, useFactory: createTastingNotesServiceMock }],
    }).compileComponents();

    const tastingNotes = TestBed.inject(TastingNotesService);
    (tastingNotes.getAll as jasmine.Spy).and.returnValue(of(testData));
    fixture = TestBed.createComponent(TastingNotesPage);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('displays the notes', () => {
    fixture.detectChanges();
    const items = fixture.debugElement.queryAll(By.css('ion-item'));
    expect(items.length).toEqual(2);
    expect(items[0].nativeElement.textContent).toContain('Bentley');
    expect(items[1].nativeElement.textContent).toContain('Lipton');
  });

  const click = (button: HTMLElement) => {
    const event = new Event('click');
    button.dispatchEvent(event);
    fixture.detectChanges();
  };

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
  };
});
```

#### `src/app/tasting-notes/tasting-notes.page.ts`

```TypeScript
import { Component, OnInit } from '@angular/core';
import { TastingNotesService } from '@app/core';
import { TastingNote } from '@app/models';
import { EMPTY, Observable } from 'rxjs';

@Component({
  selector: 'app-tasting-notes',
  templateUrl: './tasting-notes.page.html',
  styleUrls: ['./tasting-notes.page.scss'],
})
export class TastingNotesPage implements OnInit {
  notes$: Observable<Array<TastingNote>> = EMPTY;

  constructor(private tastingNotes: TastingNotesService) {}

  ngOnInit() {
    this.notes$ = this.tastingNotes.getAll();
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
  beforeEach(waitForAsync(() => {
    initializeTestData();
    modal = createOverlayElementMock('Modal');
    TestBed.configureTestingModule({
      declarations: [TastingNotesPage],
      imports: [IonicModule, TastingNoteEditorModule],
      providers: [
        { provide: ModalController, useFactory: () => createOverlayControllerMock('ModalController', modal) },
        { provide: IonRouterOutlet, useValue: mockRouterOutlet },
      ▏ { provide: TastingNotesService, useFactory: createTastingNotesServiceMock },
      ],
    }).compileComponents();

    const tastingNotes = TestBed.inject(TastingNotesService);
    (tastingNotes.getAll as jasmine.Spy).and.returnValue(of(testData));
    fixture = TestBed.createComponent(TastingNotesPage);
    component = fixture.componentInstance;
  }));
```

In `src/app/tasting-notes/tasting-notes.page.ts` inject the same items that we just set up providers for:

```TypeScript
  constructor(
    private modalController: ModalController,
    private routerOutlet: IonRouterOutlet,
    private tastingNotes: TastingNotesService,
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
    // Filling in this code is left as an exercise for you.
    // You may want to start with setting up the options based on whether you have a note or not:
    // const opt: ModalOptions = { ... }
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
    this.tastingNotes.delete(note.id as number).subscribe();
  }
```

## Refreshing

This is mostly working. Mostly. One problem we have, though, is that as we add, update, or remove tasting notes, the list does not update. We can fix that by using a `BehaviorSubject` to refresh the data. All of the following changes are in the `src/app/tasting-notes/tasting-notes.page.ts` file.

First, create the `BehaviorSubject`:

```typescript
private refresh = new BehaviorSubject<void>(undefined);
```

Then update the main observable pipeline that is feeding the data to our page:

```typescript
ngOnInit() {
▏ this.notes$ = this.refresh.pipe(mergeMap(() => this.tastingNotes.getAll()));
}
```

At this point, we just need to know when to call `next()` on the `BehaviorSubject`. Logically we will need to do this after the modal is closed and as part of the `delete` pipeline.

```typescript
// NOTE: Your code may differ slightly...
private async displayEditor(note?: TastingNote): Promise<void> {
  let opt: ModalOptions = {
    component: TastingNoteEditorComponent,
    backdropDismiss: false,
    presentingElement: this.routerOutlet.nativeEl,
  };
  if (note) {
    opt.componentProps = { note };
  }
  const modal = await this.modalController.create(opt);
  modal.present();
  await modal.onDidDismiss();
  this.refresh.next();
}
```

```typescript
async deleteNote(note: TastingNote) {
  this.tastingNotes
    .delete(note.id as number)
    .pipe(tap(() => this.refresh.next()))
    .subscribe();
}
```

This will ensure that the data is refreshed after each change.

**Note:** The `getAll()` does not currently guarantee a consistent sort order on the notes, which may be jarring for the users. Fixing that is left as an exercise for the reader.

## Extra Credit Items

**Extra Credit #1:** Normally, we would write the tests first and then the code. For the deleting of a note we did not do that. That is because I wanted to give you some practice crafting your own tests.

**Extra Credit #2:** You could also use an alert to ask the user if they _really_ want to delete the note. Extra extra credit if you want to implement that logic.

## Conclusion

Congratulations. You have used what we have learned to this point to add a whole new feature to your app. Along the way, you also exercised a few Framework components you had not used before. We are almost done with this app. One more page to go and we will be done.
