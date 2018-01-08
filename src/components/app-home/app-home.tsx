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
              <a href={`lab/${lab.path}`}>{lab.title}</a>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
