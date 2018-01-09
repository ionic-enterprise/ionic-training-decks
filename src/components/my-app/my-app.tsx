import { Component } from '@stencil/core';

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
            <stencil-route url="/" component="app-home" exact={true} />

            <stencil-route url="/lab/:lab" component="app-lab" />

            {/* <stencil-route
              url="/lab/:lab/:file"
              component="app-lab"
              exact={true}
            /> */}
          </stencil-router>
        </main>
      </div>
    );
  }
}
