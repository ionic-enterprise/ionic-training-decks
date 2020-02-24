export class MenuItem {
  title: string;
  file: string;
  folder?: string;
  icon?: string;
  pages?: Array<MenuItem>;

  constructor(data: MenuItem) {
    this.title = data.title;
    this.file = data.file;
    this.folder = data.folder;
    this.icon = data.icon;
    this.pages = data.pages && JSON.parse(JSON.stringify(data.pages));
  }
}
