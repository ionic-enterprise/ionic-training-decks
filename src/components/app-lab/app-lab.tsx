import { Component, Prop } from '@stencil/core';
import { MatchResults } from '@stencil/router';

@Component({
  tag: 'app-lab',
  styleUrl: 'app-lab.scss'
})
export class AppLab {
  private items: Array<any> = [];

  @Prop() match: MatchResults;

  async componentWillLoad() {
    if (this.match && this.match.params.lab) {
      const file = await fetch(
        `/assets/data/${this.match.params.lab}/menu.json`
      );
      this.items = JSON.parse(await file.text()).pages;
    }
  }

  render() {
    if (this.match && this.match.params.lab) {
      return (
        <div class="container">
          <div class="menu">
            <app-menu lab={this.match.params.lab} menu={this.items} />
          </div>
          <div class="content">
            <stencil-route
              url="/lab/:lab/:file"
              routeRender={props => {
                {
                  return (
                    <app-markdown
                      path={`/assets/data/${props.match.params.lab}/markdown/${
                        props.match.params.file
                      }`}
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
}
