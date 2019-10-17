import { Component, h, Prop } from '@stencil/core';
import { MatchResults } from '@stencil/router';

import menuService from "../../services/menu-service";

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.scss'
})
export class AppHome {
  @Prop() match: MatchResults;

  async componentWillLoad() {
    await menuService.loadMenu();
  }

  render() {
    return (
      <div class="container">
        <div class="menu">
          <app-menu menu={menuService.items} />
        </div>
        <div class="content">
          <stencil-route
            url="/:step"
            routeRender={props => {
              {
                const id = props.match.params.step;
                const path = menuService.paths[id];
                return (
                  <app-markdown path={`/assets/data/markdown/${path}`} />
                );
              }
            }}
          />
        </div>
      </div>
    );
  }
}
