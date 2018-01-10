import { Component, Prop } from '@stencil/core';
import { MatchResults } from '@stencil/router';

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.scss'
})
export class AppHome {
  private items: Array<any> = [];

  @Prop() match: MatchResults;

  async componentWillLoad() {
    const file = await fetch('/assets/data/menu.json');
    this.items = JSON.parse(await file.text()).pages;
  }

  render() {
    return (
      <div class="container">
        <div class="menu">
          <app-menu menu={this.items} />
        </div>
        <div class="content">
          <stencil-route
            url="/:step"
            routeRender={props => {
              {
                return (
                  <app-markdown
                    path={`/assets/data/markdown/${props.match.params.step}`}
                  />
                );
              }
            }}
          />
        </div>
      </div>
    );
  }
}
