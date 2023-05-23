import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: ':tabName',
        loadChildren: () => import('../page/page.routes').then((m) => m.routes),
      },
      {
        path: ':tabName/page',
        loadChildren: () => import('../page/page.routes').then((m) => m.routes),
      },
    ],
  },
];
