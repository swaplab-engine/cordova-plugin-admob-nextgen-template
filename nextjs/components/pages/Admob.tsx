import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
} from '@ionic/react';
import { useState, useEffect } from 'react';

// TypeScript definition to prevent window errors
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
    setLogs((prev) => [
      `${new Date().toLocaleTimeString().split(' ')[0]} ${msg}`,
      ...prev,
    ]);
  };

  // --- INITIALIZATION ON MOUNT ---
  useEffect(() => {
    const onDeviceReady = () => {
      const AdMob = window.admobNextGen;
      if (!AdMob) {
        addLog('Plugin Error: Not found (Run on Device/Emulator).');
        return;
      }

      // 1. Request Consent (UMP) & Configuration & Initialize
      addLog('Requesting Consent...');
      AdMob.requestConsentInfo(
        { 
          debug: true, // true | false | Default/Production: false
          reset: false, // true | false | Default/Production: false
          tagForUnderAgeOfConsent: false // true | false | Default: false
         },
        () => {
          // Consent OK -> Init SDK
          AdMob.initialize({
              maxAdContentRating: "", // 'G' | 'PG' | 'T' | 'MA' | Default: ""
              tagForChildDirectedTreatment: false, // true | false | Default: null
              tagForUnderAgeOfConsent: false, // true | false | Default: null
            },
            () => {
              addLog('✅ SDK INITIALIZED');
              setIsReady(true);
              setupEvents();
            },
            (err: any) => addLog('Init Failed: ' + err),
          );
        },
        (err: any) => {
          // Consent Failed -> Proceed anyway (e.g. no internet)
          addLog('Consent Error (Proceeding anyway): ' + JSON.stringify(err));
          AdMob.initialize({
              maxAdContentRating: "", // 'G' | 'PG' | 'T' | 'MA' | Default: ""
              tagForChildDirectedTreatment: false, // true | false | Default: null
              tagForUnderAgeOfConsent: false, // true | false | Default: null
            },
            () => {
              setIsReady(true);
              setupEvents();
            },
            () => {},
          );
        },
      );
    };

    const setupEvents = () => {
      document.addEventListener('on.banner.load', () =>
        addLog('Event: Banner Loaded'),
      );
      document.addEventListener('on.interstitial.dismissed', () =>
        addLog('Event: Interstitial Closed'),
      );
      document.addEventListener('on.rewarded.earned', (e: any) =>
        addLog(`Event: Reward Earned: ${e.amount}`),
      );
    };

    document.addEventListener('deviceready', onDeviceReady, false);
    return () => document.removeEventListener('deviceready', onDeviceReady);
  }, []);

  // Complete API method/Event: https://github.com/swaplab-engine/cordova-plugin-admob-nextgen/tree/main/simple-example/www/js

  // --- AD FUNCTIONS ---

  const showBanner = () => {
    window.admobNextGen?.createBanner({
      adUnitId: 'ca-app-pub-3940256099942544/9214589741',
      position: 'bottom',       // 'top' or 'bottom'
      size: 'ADAPTIVE',         // 'BANNER', 'LARGE_BANNER', 'MEDIUM_RECTANGLE', 'ADAPTIVE', 'FULL_BANNER', 'LEADERBOARD'
      isOverlapping: false,     // true = Overlay, false = Push Webview
      collapsible: false,       // true = Enable Collapsible Format (High Revenue)
      retryInterval: 5000,      // optional: Anti-spam delay (ms) Disable: 0
      isAutoShow: true
    });
    addLog('Action: Show Banner');
  };

  const removeBanner = () => {
    window.admobNextGen?.removeBanner();
    addLog('Action: Remove Banner');
  };

  const showInterstitial = () => {
    window.admobNextGen?.createInterstitial({
      adUnitId: 'ca-app-pub-3940256099942544/1033173712',
      isAutoShow: true,
      retryInterval: 5000,      // optional: Anti-spam delay (ms) Disable: 0
    });
    addLog('Action: Show Interstitial');
  };

  const showRewarded = () => {
    window.admobNextGen?.createRewarded({
      adUnitId: 'ca-app-pub-3940256099942544/5224354917',
      isAutoShow: true,
      retryInterval: 5000,      // optional: Anti-spam delay (ms) Disable: 0
    });
    addLog('Action: Show Rewarded');
  };

  const showAppOpen = () => {
    // Manual Show for testing purpose
    // Note: In production, App Open Ads usually trigger automatically on resume
    window.admobNextGen?.loadAppOpenAd({
      adUnitId: 'ca-app-pub-3940256099942544/9257395921', // Correct App Open Test ID
      isAutoShow: true,
      retryInterval: 5000,      // optional: Anti-spam delay (ms) Disable: 0
    });
    addLog('Action: Load App Open');
  };

  const showNativeFixed = () => {
    // Native Ad configured as a Fixed Banner at the Top
    // 'isOverlapping: false' ensures it pushes the app content down
    window.admobNextGen?.createNativeAd({
      adUnitId: 'ca-app-pub-3940256099942544/2247696110',
      view: 'banner_top', 
      isOverlapping: false, 
      retryInterval: 5000,      // optional: Anti-spam delay (ms) Disable: 0
    });
    addLog('Action: Show Native (Top Fixed)');
  };

  const removeNative = () => {
    window.admobNextGen?.removeNativeAd();
    addLog('Action: Remove Native');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>AdMob Test Next.js</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {/* STATUS CARD */}
        <IonCard className="mb-4">
          <IonCardHeader>
            <IonCardSubtitle>SDK STATUS</IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            <h1
              className={`text-2xl font-bold ${isReady ? 'text-green-500' : 'text-yellow-500'}`}
            >
              {isReady ? 'READY' : 'INITIALIZING...'}
            </h1>
          </IonCardContent>
        </IonCard>

        {/* LOG CONSOLE */}
        <div className="bg-black text-green-400 font-mono text-xs p-2 h-32 overflow-y-auto mb-4 rounded border border-gray-700">
          {logs.length === 0 && <span>Waiting for logs...</span>}
          {logs.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>

        {/* CONTROLS */}
        <IonGrid>
          <IonRow>
            <IonCol size="6">
              <IonButton expand="block" onClick={showBanner}>
                Show Banner
              </IonButton>
            </IonCol>
            <IonCol size="6">
              <IonButton expand="block" color="danger" onClick={removeBanner}>
                Hide Banner
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              <IonButton
                expand="block"
                color="warning"
                onClick={showInterstitial}
              >
                Show Interstitial
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              <IonButton expand="block" color="tertiary" onClick={showRewarded}>
                Show Rewarded
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="6">
              <IonButton
                expand="block"
                color="dark"
                onClick={showNativeFixed}
              >
                Native Top
              </IonButton>
            </IonCol>
            <IonCol size="6">
              <IonButton expand="block" color="medium" onClick={removeNative}>
                Hide Native
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              <IonButton expand="block" color="success" onClick={showAppOpen}>
                Load App Open
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Admob;