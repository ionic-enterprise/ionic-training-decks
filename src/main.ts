import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { marked } from 'marked';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';

if (environment.production) {
  enableProdMode();
}

marked.setOptions({
  renderer: new marked.Renderer(),
  highlight: (code, lang) => {
    const grammar = Prism.languages[lang];
    if (grammar) {
      return Prism.highlight(code, grammar, lang);
    }
    return code;
  },
  pedantic: false,
  gfm: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false,
});

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.log(err));
