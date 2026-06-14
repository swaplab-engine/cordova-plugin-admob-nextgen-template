# Next.js + Capacitor + AdMob Next Gen Template 🚀

This is a starter template for building high-performance hybrid apps using **Next.js (App Router)**, **Tailwind CSS**, and **Capacitor**, integrated with the [AdMob Next Gen Plugin](https://github.com/swaplab-engine/cordova-plugin-admob-nextgen).

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

To ensure Next.js works with Capacitor (Static Export) and the AdMob plugin injects IDs correctly, follow these steps.

### 1. Update `next.config.js` (Crucial)

Capacitor requires a static export. Update your config to output to the `out` directory and disable image optimization.

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Mandatory for Capacitor
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
```

### 2. Update `package.json`

Add the `update-admob` and `cap-sync` scripts. The `cap-sync` command builds your Next.js app first, then runs the hook to inject App IDs.

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "update-admob": "node node_modules/cordova-plugin-admob-nextgen/capacitor-hook-admob-ids.js",
  "cap-sync": "npm run build && npm run update-admob && npx cap sync"
}
```

### 3. Update `capacitor.config.json`

Set `webDir` to **"out"** (since we are using Next.js static export) and add your App ID.
*(Note: The example below uses Google's Test ID. Replace with your real ID for production).*

```json
{
  "appId": "com.example.nextjsapp",
  "appName": "NextAdMob",
  "webDir": "out",
  "plugins": {
    "AdMob": {
      "APP_ID_ANDROID": "ca-app-pub-3940256099942544~3347511713",
      "NEXT_GEN_SDK_VERSION": "1.2.0",
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
npm install @capacitor/android@8.3.1
npx cap add android
```

### Step 2: Sync with Hook (Crucial Step)

**Do not** run `npx cap sync` manually. Instead, run the custom command we created. This ensures the Next.js project is built into the `out` folder and the `AndroidManifest.xml` is updated.

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

## 💡 Usage Example

Here is a complete example of a Test Page component (`components/pages/Admob.tsx`) that implements Banner, Interstitial, and Native Ads properly using React Hooks.

```tsx
// components/pages/Admob.tsx
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle } from '@ionic/react';
import { useState, useEffect } from 'react';

declare global {
  interface Window {
    admobNextGen?: any;
  }
}

const Admob = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  const addLog = (msg: string) => {
    console.log(`[AdMob Test] ${msg}`);
    setLogs((prev) => [`${new Date().toLocaleTimeString().split(' ')[0]} ${msg}`, ...prev]);
  };

  useEffect(() => {
    const onDeviceReady = () => {
      const AdMob = window.admobNextGen;
      if (!AdMob) {
        addLog('Plugin Error: Not found (Run on Device).');
        return;
      }

      // 1. Consent & Init
      addLog('Requesting Consent...');
      AdMob.requestConsentInfo({ debug: true, testDeviceIds: [], reset: false },
        () => {
          AdMob.initialize({
                maxAdContentRating: 'G',  // 'G' | 'PG' | 'T' | 'MA' | ""
                tagForChildDirectedTreatment: false, // true | false | null
                tagForUnderAgeOfConsent: false // true | false | null
            },() => {
              addLog('✅ SDK INITIALIZED');
              setIsReady(true);
            },
            (err: any) => addLog('Init Failed: ' + err)
          );
        },
        (err: any) => {
          addLog('Consent Error: ' + JSON.stringify(err));
          // Initialize anyway
          AdMob.initialize(() => setIsReady(true), () => {});
        }
      );
    };

    document.addEventListener('deviceready', onDeviceReady, false);
    return () => document.removeEventListener('deviceready', onDeviceReady);
  }, []);

  const showBanner = () => {
    window.admobNextGen?.createBanner({
      adUnitId: 'ca-app-pub-3940256099942544/6300978111',
      position: 'bottom',
      size: 'ADAPTIVE',
      isOverlapping: false, // Push content up for safety
      isAutoShow: true,
    });
    addLog('Action: Show Banner');
  };

  const showInterstitial = () => {
    window.admobNextGen?.createInterstitial({
      adUnitId: 'ca-app-pub-3940256099942544/1033173712',
      isAutoShow: true,
    });
    addLog('Action: Show Interstitial');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar><IonTitle>AdMob Test</IonTitle></IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader><IonCardSubtitle>STATUS</IonCardSubtitle></IonCardHeader>
          <IonCardContent>
            <h1 className="text-2xl font-bold">{isReady ? 'READY' : 'INIT...'}</h1>
          </IonCardContent>
        </IonCard>
        
        <IonGrid>
          <IonRow>
            <IonCol><IonButton expand="block" onClick={showBanner}>Banner</IonButton></IonCol>
          </IonRow>
          <IonRow>
            <IonCol><IonButton expand="block" color="warning" onClick={showInterstitial}>Interstitial</IonButton></IonCol>
          </IonRow>
        </IonGrid>

        {/* Logs */}
        <div className="bg-black text-green-400 font-mono text-xs p-2 h-32 overflow-y-auto mt-4 rounded">
          {logs.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Admob;
```

## 📄 License

MIT