# Lab: Add the PWA Goodies

Let's raise that PWA score to 100. In this lab you will learn:

- How to optimize the Firebase hosting
- How to install the Vite PWA plugin

## Optimize Firebase Hosting

Since we are using Firebase to host our app, we already get a lot of benefits for our PWA such as HTTPS and support for HTTP2 push. However there are a couple more optimizations we should make. These optimizations are derived from the examples specified in our <a href="https://ionicframework.com/docs/vue/pwa#deploying" target="_blank">deployment guide</a>.

Add the following configuration to your `firebase.json` file:

```json
    "headers": [
      {
        "source": "@(sw.js|manifest.webmanifest|index.html)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache"
          }
        ]
      }
    ]
```

When you are complete, the `firebase.json` file should look something like this:

```json
{
  "hosting": {
    "public": "www",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "@(sw.js|manifest.webmanifest|index.html)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache"
          }
        ]
      }
    ]
  }
}
```

## Install and Configure `vite-plugin-pwa`

A PWA is built on three key pieces of technology:

- HTTPS
- Service Workers
- The Web App Manifest

The HTTPS bit is handled by Firebase Hosting. Now we will handle the last two as well as adding some polish.

We need to install the Vite PWA plugin.

```bash
npm i -D vite-plugin-pwa workbox-window
```

### Configure the PWA Plugin

We will add a `VitePWA` entry to the `plugins` section of our `vite.config.ts` file. We will start with a very bare-bones configuration:

```typescript
import { VitePWA } from 'vite-plugin-pwa';
    ...
    VitePWA({
      registerType: 'prompt',
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,webp}'],
      },
    }),
    ...
```

Our `vite.config.ts` file should now look something like this:

```typescript
/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy(),
    VitePWA({
      registerType: 'prompt',
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,webp}'],
      },
    }),
  ],
  server: {
    port: 8100,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
});
```

As we go through the step we will be importing from some `Vite` virtual modules. Our editor likely will flag this as an error. To prevent this, add the following line to the `src/vite-env.d.ts` file:

```typescript
/// <reference types="vite-plugin-pwa/react" />
```

### Check for and Apply Updates

Using a `registerType` of `prompt` requires us to manually control when the PWA is updated. Two tasks need to occur:

- Register the service worker.
- Update the application as needed.

Adjust the `<App />` component in `src/App.tsx` like so:

```tsx
import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/* Code omitted for brevity... */

const App: React.FC = () => {
  const interval = 6 * 1000;
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered: (r) => r && setInterval(() => r.update(), interval),
  });

  useEffect(() => {
    needRefresh && updateServiceWorker();
  }, [needRefresh]);


  return (
    /* Place the existing component template here. */
  );
};
export default App;
```

This code needs some explanation. First, let's review what the service worker is doing.

1. The service worker prefetched the assets for our app and will serve up a consistent version of our app from that local cache.
1. A new version of the application will not be served until the service worker has been able to update that cache.
1. By default, the service worker will check for an update <a href="https://web.dev/service-worker-lifecycle/#manual-updates" target="_blank">on specific events</a>. We have a SPA, so all navigation is in-app. Thus, none of these events are triggered by our app outside of a reload.

The service worker will serve the older version of our app until it is told to apply the new update. It will then restart the app and start serving the new version. This ensures that the user always sees a consistent version of the code. This is the code that tells our service worker to perform that restart:

```typescript
useEffect(() => {
  needRefresh && updateServiceWorker();
}, [needRefresh]);
```

If we expect our users to be in our app for long periods of time without reloading it, <a href="https://web.dev/service-worker-lifecycle/#manual-updates" target="_blank">we should periodically check for an update</a>. The following code accomplishes that:

```typescript
onRegistered: (r) => r && setInterval(() => r.update(), interval),
```

We currently have the interval set to every six seconds. Six seconds is an extremely short time within a production application. We are only using that timespan for testing. We will provide a more reasonable timespan later.

Let's test this out. Build and deploy your app.

```bash
npm run build:web
firebase deploy
```

Bring the app up in the browser and log in. Make a small modification such as changing the title in the `LoginPage.tsx` file. Build and deploy again. The application should automatically refresh within your browser within 6 seconds.

The service worker downloaded the application's code and is serving it locally. After six seconds our app asks the service worker to check for updates. It finds an update which causes `needsRefresh` to become `true`. The service worker then switches over to serving the updated code.

### Update the `manifest.webmanifest`

If we look at the `dist/manifest.webmanifest` file generated by the Vite PWA Plugin, we see that it is fairly basic.
We will make the following changes to it:

- Modify the descriptive text.
- Modify the colors to match our theme.
- Use our generated PWA icons.

#### Include Our Icons in the Build

When we generated the original app and ran `@capacitor/assets`, icons for use in a PWA were generated in the `icons` folder. We need to move these to a location where they will be included in the build. Move them from `icons/` to `public/icons`:

```bash
git mv icons public
```

#### Modify the Configuration in `vite.config.ts`

The `manifest.webmanifest` file is generated based on the configuration in `vite.config.ts`. As such, we need to modify the configuration there:

- The `name` needs to be updated.
- The `short_name` needs to be updated.
- The `description` to be updated.
- The `background_color` and `theme_color` need to be updated based on our application theme.
- The icons configuration needs to be set.

The Vite PWA Plugin's config object for the `manifest` follows the same pattern as the manifest file itself. Add the following within the `VitePWA` configuration object:

```typescript
  manifest: {
    name: 'Tea Tasting Notes',
    short_name: 'TeaTaster',
    description: 'Take some tea tasting notes',
    theme_color: '#ac9d83',
    background_color: '#8a7a5f',
    icons: [
      {
        src: 'icons/icon-72.webp',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'maskable any',
      },
      {
        src: 'icons/icon-96.webp',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'maskable any',
      },
      {
        src: 'icons/icon-128.webp',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'maskable any',
      },
      {
        src: 'icons/icon-192.webp',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable any',
      },
      {
        src: 'icons/icon-256.webp',
        sizes: '256x256',
        type: 'image/png',
        purpose: 'maskable any',
      },
      {
        src: 'icons/icon-512.webp',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable any',
      },
    ],
  },
```

The `src/index.html` file also needs to have a `theme-color` added to it within the `head`:

```html
<meta name="theme-color" content="#ac9d83" />
```

## Conclusion

Do the following:

- commit all changes in git
- `npm run build`
- `firebase deploy`

You should be able to open the app on a web-browser on your Android or iOS device. On Android you will be prompted to install the app. On iOS you will have to it your self via the "Share" button. Once it is installed to your desktop, you should be able to launch it on either platform and get an experience that is just like the Hybrid Mobile app we developed.
