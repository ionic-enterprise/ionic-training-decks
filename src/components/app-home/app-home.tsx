import { Component } from '@stencil/core';

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.scss'
})
export class AppHome {
  private labs: Array<any> = [];

  async ionViewWillLoad() {
    const file = await fetch('/assets/data/labs.json');
    this.labs = JSON.parse(await file.text()).labs;
  }

  render() {
    return (
      <div>
        <ul>
          {this.labs.map(lab => (
            <li>
              <stencil-route-link url={`lab/${lab.path}/${lab.start}`}>
                {lab.title}
              </stencil-route-link>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
