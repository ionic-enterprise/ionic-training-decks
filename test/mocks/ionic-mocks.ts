import { NavController, Platform } from '@ionic/angular';

export function createNavControllerMock() {
  return jasmine.createSpyObj<NavController>('NavController', ['navigateForward', 'navigateRoot']);
}

export function createOverlayElementMock(name: string) {
  return jasmine.createSpyObj(name, {
    dismiss: Promise.resolve(),
    onDidDismiss: Promise.resolve(),
    onWillDismiss: Promise.resolve(),
    present: Promise.resolve()
  });
}

export function createOverlayControllerMock(name: string, element?: any) {
  return jasmine.createSpyObj(name, {
    create: Promise.resolve(element),
    dismiss: undefined,
    getTop: Promise.resolve(element)
  });
}

export function createPlatformMock() {
  return jasmine.createSpyObj<Platform>('Platform', {
    is: false,
    ready: Promise.resolve('ready')
  });
}
