import { Routes } from '@angular/router';
import { PagePage } from './page.page';

export const routes: Routes = [
  {
    path: '',
    component: PagePage,
  },
  {
    path: ':page',
    component: PagePage,
  },
];
