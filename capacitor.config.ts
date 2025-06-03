import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.trainingdecks',
  appName: 'Ionic Training Labs',
  webDir: 'dist/browser',
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
    },
  },
};
