import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import packageInfo from '../../../package.json';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonIcon,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonNote,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { school } from 'ionicons/icons';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonIcon,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonNote,
  ],
})
export class AboutPage implements OnInit {
  author: string;
  applicationVersion: string;
  capacitorVersion: string;
  frameworkVersion: string;

  constructor() {
    addIcons({ school });
  }

  ngOnInit() {
    const verSpec = /[\^~]/;
    this.author = packageInfo.author;
    this.applicationVersion = packageInfo.version;
    this.capacitorVersion = packageInfo.dependencies['@capacitor/core'].replace(verSpec, '');
    this.frameworkVersion = packageInfo.dependencies['@ionic/angular'].replace(verSpec, '');
  }
}
