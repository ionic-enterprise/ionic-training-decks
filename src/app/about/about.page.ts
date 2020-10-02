import { Component, OnInit } from '@angular/core';

import { author, version, dependencies } from '../../../package.json';

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
    this.author = author;
    this.applicationVersion = version;
    this.capacitorVersion = dependencies['@capacitor/core'].replace(
      verSpec,
      '',
    );
    this.frameworkVersion = dependencies['@ionic/angular'].replace(verSpec, '');
  }
}
