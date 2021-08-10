import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: ':tabName',
        loadChildren: () => import('../page/page.module').then((m) => m.PagePageModule),
      },
      {
        path: ':tabName/page',
        loadChildren: () => import('../page/page.module').then((m) => m.PagePageModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
