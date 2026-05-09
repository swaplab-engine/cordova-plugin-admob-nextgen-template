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
  useVisibleTask$(() => {
    const onDeviceReady = async () => {
      const AdMob = window.admobNextGen;

      if (!AdMob) {
        addLog("Plugin not found (Running in Browser?)");
        return;
      }

      addLog("Requesting Consent...");

      AdMob.requestConsentInfo(
        {
          debug: true, // true | false | Default/Production: false
          reset: false, // true | false | Default/Production: false
          tagForUnderAgeOfConsent: false, // true | false | Default: false
        },
        () => {
          AdMob.initialize(
            {
              maxAdContentRating: "", // 'G' | 'PG' | 'T' | 'MA' | Default: ""
              tagForChildDirectedTreatment: false, // true | false | Default: null
              tagForUnderAgeOfConsent: false, // true | false | Default: null
            },
            () => {
              addLog("✅ SDK INITIALIZED");
              state.isReady = true;

              document.addEventListener("on.banner.load", () =>
                addLog("Event: Banner Loaded")
              );
              document.addEventListener("on.interstitial.dismissed", () =>
                addLog("Event: Interstitial Closed")
              );
              document.addEventListener("on.rewarded.earned", (e: any) =>
                addLog(`Event: Reward ${e.amount}`)
              );
              document.addEventListener("on.appopen.loaded", () =>
                addLog(`Event: AppOpen Loaded: ${window.admobNextGen?.showAppOpenAd()}`)
              );
            },
            (err: any) => addLog(`Init Failed: ${err}`)
          );
        },
        (err: any) => {
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
            () => {}
          );
        }
      );
    };

    document.addEventListener("deviceready", onDeviceReady);
    return () => document.removeEventListener("deviceready", onDeviceReady);
  });

  // Complete API method/Event: https://github.com/swaplab-engine/cordova-plugin-admob-nextgen/tree/main/simple-example/www/js

  // --- AD ACTIONS ---
  const showBannerBottomPush = $(() => {
    window.admobNextGen?.createBanner({
      adUnitId: "ca-app-pub-3940256099942544/9214589741",
      position: "bottom",    // 'top' or 'bottom'
      size: "ADAPTIVE",      // 'BANNER', 'LARGE_BANNER', 'MEDIUM_RECTANGLE', 'ADAPTIVE', 'FULL_BANNER', 'LEADERBOARD'
      isOverlapping: false,  // true = Overlay, false = Push Webview
      collapsible: false,    // true = Enable Collapsible Format (High Revenue)
      retryInterval: 5000,   // optional: Anti-spam delay (ms) Disable: 0
      isAutoShow: true,
    });
    addLog("Action: Show Banner (Bottom - Push)");
  });

  const showBannerBottomOverlay = $(() => {
    window.admobNextGen?.createBanner({
      adUnitId: "ca-app-pub-3940256099942544/9214589741",
      position: "bottom",    // 'top' or 'bottom'
      size: "ADAPTIVE",      // 'BANNER', 'LARGE_BANNER', 'MEDIUM_RECTANGLE', 'ADAPTIVE', 'FULL_BANNER', 'LEADERBOARD'
      isOverlapping: true,  // true = Overlay, false = Push Webview
      collapsible: false,    // true = Enable Collapsible Format (High Revenue)
      retryInterval: 5000,   // optional: Anti-spam delay (ms) Disable: 0
      isAutoShow: true,
    });
    addLog("Action: Show Banner (Bottom - Overlay)");
  });

  const removeBanner = $(() => {
    window.admobNextGen?.removeBanner();
    addLog("Action: Remove Banner");
  });

  const showInterstitial = $(() => {
    window.admobNextGen?.createInterstitial({
      adUnitId: "ca-app-pub-3940256099942544/1033173712",
      isAutoShow: true,
      retryInterval: 5000,
    });
    addLog("Action: Show Interstitial");
  });

  const showRewarded = $(() => {
    window.admobNextGen?.createRewarded({
      adUnitId: "ca-app-pub-3940256099942544/5224354917",
      isAutoShow: true,
      retryInterval: 5000,
    });
    addLog("Action: Show Rewarded");
  });

  const showNativeTop = $(() => {
    window.admobNextGen?.createNativeAd({
      adUnitId: "ca-app-pub-3940256099942544/2247696110",
      view: "banner_top",
      isOverlapping: false,
      retryInterval: 5000,
    });
    addLog("Action: Show Native Top");
  });

  const showAppOpen = $(() => {
    window.admobNextGen?.loadAppOpenAd({
      adUnitId: "ca-app-pub-3940256099942544/9257395921",
      isAutoShow: false,
      retryInterval: 5000,
    });
    addLog("Action: Load App Open");
  });

  const removeNative = $(() => {
    window.admobNextGen?.removeNativeAd();
    addLog("Action: Hide Native");
  });

  return (
    <div style={{ position: "relative", minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
      {/* INDICATOR TOP */}
      <div style={indicatorTopStyles}>
        ▲ TOP EDGE OF WEBVIEW ▲
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div
        style={{
          padding: "60px 20px 80px 20px", // Padding to avoid overlap with fixed indicators
          fontFamily: "sans-serif",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        {/* STATUS CARD */}
        <div style={cardStyles}>
          <h3 style={labelStyles}>SDK Status</h3>
          <h1 style={{ margin: 0, color: state.isReady ? "#16a34a" : "#d97706", fontSize: "24px" }}>
            {state.isReady ? "● READY" : "● INITIALIZING..."}
          </h1>
        </div>

        {/* LOG CONSOLE */}
        <div style={consoleStyles}>
          {state.logs.length === 0 && <span style={{ color: "#6b7280" }}>Waiting for logs...</span>}
          {state.logs.map((log, i) => (
            <div key={i} style={{ borderBottom: "1px solid #1f2937", padding: "4px 0" }}>
              {log}
            </div>
          ))}
        </div>

        {/* CONTROLS GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {/* Added explicitly push vs overlay tests */}
          <button onClick$={showBannerBottomPush} style={btnPrimary}>
            Banner (PUSH)
          </button>
          <button onClick$={showBannerBottomOverlay} style={btnWarning}>
            Banner (OVERLAY)
          </button>
          
          <button onClick$={removeBanner} style={{ ...btnDanger, gridColumn: "span 2" }}>
            Hide Banner
          </button>

          <button onClick$={showInterstitial} style={{ ...btnPurple, gridColumn: "span 2" }}>
            Show Interstitial
          </button>

          <button onClick$={showRewarded} style={{ ...btnSuccess, gridColumn: "span 2" }}>
            Show Rewarded
          </button>

          <button onClick$={showNativeTop} style={btnDark}>
            Native Top
          </button>
          <button onClick$={removeNative} style={btnSecondary}>
            Hide Native
          </button>

          <button onClick$={showAppOpen} style={{ ...btnPrimary, gridColumn: "span 2", backgroundColor: "#0284c7" }}>
            Load App Open
          </button>
        </div>
      </div>

      {/* INDICATOR BOTTOM */}
      <div style={indicatorBottomStyles}>
        ▼ BOTTOM EDGE OF WEBVIEW ▼
      </div>
    </div>
  );
});

// --- STYLES ---

// Indicator Styles (The key to testing Push vs Overlay)
const indicatorTopStyles = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  backgroundColor: "#dc2626", // Red for visibility
  color: "#ffffff",
  textAlign: "center",
  padding: "8px",
  fontWeight: "bold",
  fontSize: "12px",
  zIndex: 9999,
  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
} as const;

const indicatorBottomStyles = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: "#2563eb", // Blue for visibility
  color: "#ffffff",
  textAlign: "center",
  padding: "12px",
  fontWeight: "bold",
  fontSize: "14px",
  zIndex: 9999,
  boxShadow: "0 -2px 4px rgba(0,0,0,0.2)",
} as const;

const cardStyles = {
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "20px",
  backgroundColor: "#fff",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
};

const labelStyles = {
  margin: "0 0 10px 0",
  color: "#6b7280",
  fontSize: "14px",
  textTransform: "uppercase",
} as const;

const consoleStyles = {
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
} as const;

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
const btnWarning = { ...baseBtn, backgroundColor: "#d97706" };
const btnPurple = { ...baseBtn, backgroundColor: "#7e22ce" };
const btnDark = { ...baseBtn, backgroundColor: "#1f2937" };
const btnSecondary = { ...baseBtn, backgroundColor: "#4b5563" };
const btnSuccess = { ...baseBtn, backgroundColor: "#16a34a" };