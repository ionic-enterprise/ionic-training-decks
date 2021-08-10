import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PageMenuComponent } from './page-menu.component';

describe('PageMenuComponent', () => {
  let component: PageMenuComponent;
  let fixture: ComponentFixture<PageMenuComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [PageMenuComponent],
        imports: [IonicModule],
      }).compileComponents();

      fixture = TestBed.createComponent(PageMenuComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
