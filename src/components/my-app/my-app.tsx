import '@stencil/router';
import { Component, h } from '@stencil/core';

@Component({
  tag: 'my-app',
  styleUrl: 'my-app.scss'
})
export class MyApp {
  render() {
    return (
      <div>
        <header>
          <h1>Ionic Training Deck</h1>
        </header>

        <main>
          <stencil-router>
            <stencil-route url="/" component="app-home" />
          </stencil-router>
        </main>
      </div>
    );
  }
}
