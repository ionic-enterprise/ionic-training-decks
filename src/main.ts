import { provideHttpClient } from '@angular/common/http';
import { enableProdMode, isDevMode, inject, provideAppInitializer } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withRouterConfig } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { AppComponent } from '@app/app.component';
import { MenuItemsService } from '@app/core';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { marked } from 'marked';
import { environment } from './environments/environment';

import { routes } from '@app/app.routes';
import { markedHighlight } from 'marked-highlight';
import Prism from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-diff';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-typescript';

if (environment.production) {
  enableProdMode();
}

marked.use(
  {
    renderer: new marked.Renderer(),
    pedantic: false,
    gfm: true,
    breaks: false,
  },
  markedHighlight({
    highlight(code, lang) {
      const grammar = Prism.languages[lang];
      if (grammar) {
        return Prism.highlight(code, grammar, lang);
      }
      return code;
    },
  }),
);

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideAppInitializer(() => {
      const initializerFn = (
        (menu: MenuItemsService) => () =>
          menu.load()
      )(inject(MenuItemsService));
      return initializerFn();
    }),
    provideHttpClient(),
    provideRouter(
      routes,
      withRouterConfig({
        paramsInheritanceStrategy: 'always',
      }),
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideIonicAngular({}),
  ],
});
