import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PopoverController } from '@ionic/angular/standalone';
import { createOverlayControllerMock } from '@test/mocks';
import { PageMenuComponent } from './page-menu.component';

describe('PageMenuComponent', () => {
  let component: PageMenuComponent;
  let fixture: ComponentFixture<PageMenuComponent>;

  beforeEach(() => {
    TestBed.overrideProvider(PopoverController, { useFactory: () => createOverlayControllerMock('PopoverController') });
    fixture = TestBed.createComponent(PageMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
