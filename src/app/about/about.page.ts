import { Component, OnInit } from '@angular/core';

import packageInfo from '../../../package.json';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {
  author: string;
  applicationVersion: string;
  capacitorVersion: string;
  frameworkVersion: string;

  constructor() {}

  ngOnInit() {
    const verSpec = /[\^~]/;
    this.author = packageInfo.author;
    this.applicationVersion = packageInfo.version;
    this.capacitorVersion = packageInfo.dependencies['@capacitor/core'].replace(
      verSpec,
      '',
    );
    this.frameworkVersion = packageInfo.dependencies['@ionic/angular'].replace(
      verSpec,
      '',
    );
  }
}
