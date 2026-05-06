import { component$, useStore, useVisibleTask$, $ } from "@builder.io/qwik";

// TypeScript Definition
declare global {
  interface Window {
    admobNextGen?: any;
  }
}

export const AdMobPanel = component$(() => {
  // State Management (Qwik useStore)
  const state = useStore({
    isReady: false,
    logs: [] as string[],
  });

  // Helper: Add Log (Wrapped in $ for serialization)
  const addLog = $((msg: string) => {
    console.log(`[AdMob] ${msg}`);
    // Add new log to the top and keep only last 50
    state.logs = [
      `${new Date().toLocaleTimeString().split(" ")[0]} ${msg}`,
      ...state.logs,
    ].slice(0, 50);
  });

  // --- CLIENT-SIDE INITIALIZATION ---
  // useVisibleTask$ ensures this runs ONLY in the browser, not on the server.
  useVisibleTask$(() => {
    const onDeviceReady = async () => {
      const AdMob = window.admobNextGen;

      if (!AdMob) {
        addLog("Plugin not found (Running in Browser?)");
        return;
      }

      // 1. Request Consent & Configuration & Init
      addLog("Requesting Consent...");

      AdMob.requestConsentInfo(
        {
          debug: true, // true | false | Default/Production: false
          reset: false, // true | false | Default/Production: false
          tagForUnderAgeOfConsent: false // true | false | Default: false
        },
        () => {
          // Consent OK
          AdMob.initialize(
            {
              maxAdContentRating: "", // 'G' | 'PG' | 'T' | 'MA' | Default: ""
              tagForChildDirectedTreatment: false, // true | false | Default: null
              tagForUnderAgeOfConsent: false, // true | false | Default: null
            },
            () => {
              addLog("✅ SDK INITIALIZED");
              state.isReady = true;

              // Setup Event Listeners
              document.addEventListener("on.banner.load", () =>
                addLog("Event: Banner Loaded"),
              );
              document.addEventListener("on.interstitial.dismissed", () =>
                addLog("Event: Interstitial Closed"),
              );
              document.addEventListener("on.rewarded.earned", (e: any) =>
                addLog(`Event: Reward ${e.amount}`),
              );
              document.addEventListener("on.appopen.loaded", () =>
                addLog(
                  `Event: AppOpen Loaded: ${window.admobNextGen?.showAppOpenAd()}`,
                ),
              );
            },
            (err: any) => addLog(`Init Failed: ${err}`),
          );
        },
        (err: any) => {
          // Consent Failed (Proceed anyway)
          addLog(`Consent Error: ${JSON.stringify(err)}`);
          AdMob.initialize(
            {
              maxAdContentRating: "", // 'G' | 'PG' | 'T' | 'MA' | Default: ""
              tagForChildDirectedTreatment: false, // true | false | Default: null
              tagForUnderAgeOfConsent: false, // true | false | Default: null
            },
            () => {
              state.isReady = true;
            },
            () => {},
          );
        },
      );
    };

    document.addEventListener("deviceready", onDeviceReady);

    // Cleanup function
    return () => document.removeEventListener("deviceready", onDeviceReady);
  });

  // Complete API method/Event: https://github.com/swaplab-engine/cordova-plugin-admob-nextgen/tree/main/simple-example/www/js

  // --- AD ACTIONS ---

  const showBanner = $(() => {
    window.admobNextGen?.createBanner({
      adUnitId: "ca-app-pub-3940256099942544/9214589741",
      position: "bottom",    // 'top' or 'bottom'
      size: "ADAPTIVE",      // 'BANNER', 'LARGE_BANNER', 'MEDIUM_RECTANGLE', 'ADAPTIVE', 'FULL_BANNER', 'LEADERBOARD'
      isOverlapping: false,  // true = Overlay, false = Push Webview
      collapsible: false,    // true = Enable Collapsible Format (High Revenue)
      retryInterval: 5000,   // optional: Anti-spam delay (ms) Disable: 0
      isAutoShow: true,
      isCapacitor: true,
    });
    addLog("Action: Show Banner");
  });

  const removeBanner = $(() => {
    window.admobNextGen?.removeBanner();
    addLog("Action: Remove Banner");
  });

  const showInterstitial = $(() => {
    window.admobNextGen?.createInterstitial({
      adUnitId: "ca-app-pub-3940256099942544/1033173712",
      isAutoShow: true,
      retryInterval: 5000,   // optional: Anti-spam delay (ms) Disable: 0
    });
    addLog("Action: Show Interstitial");
  });

  const showRewarded = $(() => {
    window.admobNextGen?.createRewarded({
      adUnitId: "ca-app-pub-3940256099942544/5224354917",
      isAutoShow: true,
      retryInterval: 5000,   // optional: Anti-spam delay (ms) Disable: 0
    });
    addLog("Action: Show Rewarded");
  });

  const showNativeTop = $(() => {
    window.admobNextGen?.createNativeAd({
      adUnitId: "ca-app-pub-3940256099942544/2247696110",
      view: "banner_top",
      isOverlapping: false, // Push content down
      retryInterval: 5000,   // optional: Anti-spam delay (ms) Disable: 0
    });
    addLog("Action: Show Native Top");
  });

  const showAppOpen = $(() => {
    window.admobNextGen?.loadAppOpenAd({
      adUnitId: "ca-app-pub-3940256099942544/9257395921", // Correct App Open ID
      isAutoShow: false,
      retryInterval: 5000,   // optional: Anti-spam delay (ms) Disable: 0
    });
    addLog("Action: Load App Open");
  });

  const removeNative = $(() => {
    window.admobNextGen?.removeNativeAd();
    addLog("Action: Hide Native");
  });

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      {/* STATUS CARD */}
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
          backgroundColor: "#fff",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        }}
      >
        <h3
          style={{
            margin: "0 0 10px 0",
            color: "#666",
            fontSize: "14px",
            textTransform: "uppercase",
          }}
        >
          SDK Status
        </h3>
        <h1
          style={{
            margin: 0,
            color: state.isReady ? "#16a34a" : "#d97706",
            fontSize: "24px",
          }}
        >
          {state.isReady ? "● READY" : "● INITIALIZING..."}
        </h1>
      </div>

      {/* LOG CONSOLE */}
      <div
        style={{
          backgroundColor: "#111827",
          color: "#4ade80",
          fontFamily: "monospace",
          fontSize: "12px",
          height: "200px",
          overflowY: "auto",
          padding: "12px",
          borderRadius: "8px",
          marginBottom: "20px",
          border: "1px solid #374151",
        }}
      >
        {state.logs.length === 0 && (
          <span style={{ color: "#6b7280" }}>Waiting for logs...</span>
        )}
        {state.logs.map((log, i) => (
          <div
            key={i}
            style={{ borderBottom: "1px solid #1f2937", padding: "2px 0" }}
          >
            {log}
          </div>
        ))}
      </div>

      {/* CONTROLS GRID */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}
      >
        <button onClick$={showBanner} style={btnPrimary}>
          Show Banner
        </button>
        <button onClick$={removeBanner} style={btnDanger}>
          Hide Banner
        </button>

        <button
          onClick$={showInterstitial}
          style={{ ...btnWarning, gridColumn: "span 2" }}
        >
          Show Interstitial
        </button>

        <button
          onClick$={showRewarded}
          style={{ ...btnPurple, gridColumn: "span 2" }}
        >
          Show Rewarded
        </button>

        <button onClick$={showNativeTop} style={btnDark}>
          Native Top
        </button>
        <button onClick$={removeNative} style={btnSecondary}>
          Hide Native
        </button>

        <button
          onClick$={showAppOpen}
          style={{ ...btnSuccess, gridColumn: "span 2" }}
        >
          Load App Open
        </button>
      </div>
    </div>
  );
});

// --- STYLES ---
const baseBtn = {
  padding: "14px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
  transition: "opacity 0.2s",
  color: "white",
};

const btnPrimary = { ...baseBtn, backgroundColor: "#2563eb" };
const btnDanger = { ...baseBtn, backgroundColor: "#dc2626" };
const btnWarning = { ...baseBtn, backgroundColor: "#d97706", color: "white" };
const btnPurple = { ...baseBtn, backgroundColor: "#7e22ce" };
const btnDark = { ...baseBtn, backgroundColor: "#1f2937" };
const btnSecondary = { ...baseBtn, backgroundColor: "#4b5563" };
const btnSuccess = { ...baseBtn, backgroundColor: "#16a34a" };
