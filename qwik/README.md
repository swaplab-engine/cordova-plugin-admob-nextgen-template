# Qwik + Capacitor + AdMob Next Gen Template 🚀

This is a starter template for building high-performance hybrid apps using **Qwik**, **Vite**, and **Capacitor**, integrated with the [AdMob Next Gen Plugin](https://github.com/swaplab-engine/cordova-plugin-admob-nextgen).

## 📦 Prerequisites

* Node.js (v20+)
* Android Studio (for Android builds)
* Java JDK 17+

## 🛠️ Installation

1.  **Clone or Download** this repository.
2.  Install dependencies:

```bash
npm install
```

3.  Install the AdMob Next Gen plugin:

```bash
npm install cordova-plugin-admob-nextgen
```

---

## ⚙️ Configuration (Important)

To ensure the AdMob plugin works correctly with Capacitor and Qwik's resumability model, you need to configure the build hooks and App ID.

### 1. Update `package.json`

Add the `update-admob` and `cap-sync` scripts to your `package.json`. The **hook script** is crucial for injecting the App ID into the Android Manifest automatically.

```json
"scripts": {
  "build": "qwik build",
    "build.client": "vite build",
    "build.server": "qwik check-client src dist && vite build -c adapters/static/vite.config.ts",
    "build.types": "tsc --incremental --noEmit",
    "qwik": "qwik",
    "update-admob": "node node_modules/cordova-plugin-admob-nextgen/capacitor-hook-admob-ids.js",
    "cap-sync": "npm run build && npm run update-admob && npx cap sync"
}
```

### 2. Update `capacitor.config.json`

Set `webDir` to **"dist"** (Qwik's default output) and add your App ID under the `plugins` object.
*(Note: The example below uses Google's Test ID. Replace with your real ID for production).*

```json
{
  "appId": "com.swaplab.template",
  "appName": "SwapLabTemplate",
  "webDir": "dist",
  "plugins": {
    "AdMob": {
      "APP_ID_ANDROID": "ca-app-pub-3940256099942544~3347511713",
      "NEXT_GEN_SDK_VERSION": "0.23.0-beta01",
      "UMP_VERSION": "4.0.0"
    }
  }
}
```

---

## 📱 Android Setup & Build

Follow these steps carefully to initialize the Android platform.

### Step 1: Add Android Platform

Install the Capacitor Android core and add the platform folder:

```bash
npm install @capacitor/android@7.1.0
npx cap add android
```

### Step 2: Sync with Hook (Crucial Step)

**Do not** run `npx cap sync` manually. Instead, run the custom command we created. This ensures the Qwik project is built into the `dist` folder and the `AndroidManifest.xml` is updated properly.

```bash
npm run cap-sync
```

You should see a success message in the terminal:
> `[AdMob Hook] Success: Updated AndroidManifest.xml`
> `[AdMob Hook] Success: Injected legacy SDK exclusion rules...`

### Step 3: Open Android Studio

Once the sync is complete, open the project in Android Studio:

```bash
npx cap open android
```

---

## 💡 Usage in Qwik

In Qwik, since rendering happens on the server (SSR), we must use `useVisibleTask$` to interact with the window/browser object for the AdMob plugin.

Create a component at `src/components/admob-panel.tsx`:

```tsx
import { component$, useStore, useVisibleTask$, $ } from '@builder.io/qwik';

declare global {
  interface Window {
    admobNextGen?: any;
  }
}

export const AdMobPanel = component$(() => {
  const state = useStore({ isReady: false, logs: [] as string[] });

  const addLog = $((msg: string) => {
    console.log(`[AdMob] ${msg}`);
    state.logs = [`${new Date().toLocaleTimeString()} ${msg}`, ...state.logs].slice(0, 50);
  });

  // INITIALIZATION (Runs only in Browser)
  useVisibleTask$(() => {
    const onDeviceReady = async () => {
      const AdMob = window.admobNextGen;
      if (!AdMob) {
        addLog("Plugin not found.");
        return;
      }

      addLog("Requesting Consent...");
      AdMob.requestConsentInfo({ debug: true, testDeviceIds: [], reset: false },
        () => {
          AdMob.initialize({
                maxAdContentRating: 'G',  // 'G' | 'PG' | 'T' | 'MA' | ""
                tagForChildDirectedTreatment: false, // true | false | null
                tagForUnderAgeOfConsent: false // true | false | null
            }, () => {
            addLog("✅ SDK INITIALIZED");
            state.isReady = true;
          }, (err: any) => addLog(`Init Failed: ${err}`));
        },
        (err: any) => {
            addLog(`Consent Error: ${JSON.stringify(err)}`);
            AdMob.initialize(() => { state.isReady = true; }, () => {});
        }
      );
    };

    document.addEventListener('deviceready', onDeviceReady);
    return () => document.removeEventListener('deviceready', onDeviceReady);
  });

  const showBanner = $(() => {
    window.admobNextGen?.createBanner({
      adUnitId: 'ca-app-pub-3940256099942544/6300978111',
      position: 'bottom',
      size: 'ADAPTIVE',
      isOverlapping: false,
      isAutoShow: true
    });
    addLog("Action: Show Banner");
  });

  return (
    <div>
      <h1>Status: {state.isReady ? 'READY' : 'INIT...'}</h1>
      <button onClick$={showBanner}>Show Banner</button>
      <pre>{state.logs.join('\n')}</pre>
    </div>
  );
});
```

## 📄 License

MIT