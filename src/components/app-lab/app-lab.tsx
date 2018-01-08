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
        <div>
          <p>
            Hello! My name is {this.match.params.lab}.
          </p>

          <div>
            <div>
              <app-menu lab={this.match.params.lab}></app-menu>
            </div>
          </div>
        </div>
      );
    }
  }
}
