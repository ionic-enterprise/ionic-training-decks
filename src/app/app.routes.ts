import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'course/:section',
    loadChildren: () => import('./page/page.routes').then((m) => m.routes),
    pathMatch: 'full',
  },
  {
    path: 'course/:section/page',
    loadChildren: () => import('./page/page.routes').then((m) => m.routes),
  },
  {
    path: 'course/:section/tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'about',
    loadComponent: () => import('./about/about.page').then((m) => m.AboutPage),
  },
];
