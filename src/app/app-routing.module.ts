import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'course/:section',
    loadChildren: () =>
      import('./page/page.module').then(m => m.PagePageModule),
    pathMatch: 'full',
  },
  {
    path: 'course/:section/page',
    loadChildren: () =>
      import('./page/page.module').then(m => m.PagePageModule),
  },
  {
    path: 'course/:section/tabs',
    loadChildren: () =>
      import('./tabs/tabs.module').then(m => m.TabsPageModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      paramsInheritanceStrategy: 'always',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
