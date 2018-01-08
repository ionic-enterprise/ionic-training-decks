import { Component, Prop } from '@stencil/core';
import { MatchResults } from '@stencil/router';

@Component({
  tag: 'app-lab',
  styleUrl: 'app-lab.scss'
})
export class AppLab {
  @Prop() match: MatchResults;

  render() {
    if (this.match && this.match.params.lab) {
      return (
        <div class="container">
          <div class="menu">
            <app-menu lab={this.match.params.lab} />
          </div>
          <div class="content">
            {this.match.params.file ? (
              <app-markdown
                path={`/assets/data/${this.match.params.lab}/markdown/${
                  this.match.params.file
                }`}
              />
            ) : (
              <app-empty-content />
            )}
          </div>
        </div>
      );
    }
  }
}
