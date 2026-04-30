import logo from "./logo.svg";
import styles from "./App.module.css";
import { createSignal, onMount, onCleanup } from "solid-js";

function App() {
  const [status, setStatus] = createSignal("Waiting for Device Ready...");
  const [logs, setLogs] = createSignal([]);

  const addLog = (msg) => {
    console.log(msg);
    setLogs((prev) =>
      [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50),
    );
  };

  onMount(() => {
    document.addEventListener("deviceready", onDeviceReady, false);
  });

  onCleanup(() => {
    document.removeEventListener("deviceready", onDeviceReady);
  });

  const onDeviceReady = () => {
    setStatus("Device Ready. Checking Plugin...");
    const AdMob = window.admobNextGen;

    if (!AdMob) {
      setStatus("ERROR: AdMob Plugin not found!");
      return;
    }

    setupEventListeners();

    AdMob.setRequestConfiguration({
      maxAdContentRating: 'G',  // 'G' | 'PG' | 'T' | 'MA' | ""
      tagForChildDirectedTreatment: false, // true | false | null
      tagForUnderAgeOfConsent: false, // true | false | null
    });

    setStatus("Requesting Consent...");
    AdMob.requestConsentInfo(
      {
        debug: true,
        testDeviceIds: [],
        reset: false,
      },
      () => {
        addLog("Consent Info Ready.");
        initSdk(AdMob);
      },
      (err) => {
        addLog("Consent Error: " + JSON.stringify(err));
        initSdk(AdMob);
      },
    );
  };

  const initSdk = (AdMob) => {
    setStatus("Initializing SDK...");
    AdMob.initialize(
      () => {
        setStatus("SDK Ready! Select an ad format.");
        addLog(">>> AdMob Next Gen Initialized <<<");
      },
      (err) => {
        setStatus("SDK Init Failed!");
        addLog("Init Error: " + err);
      },
    );
  };

  const setupEventListeners = () => {
    // Banner specific events
    document.addEventListener("on.banner.load", (data) =>
      addLog(`Banner Loaded: ${data.width}x${data.height}`),
    );
    document.addEventListener("on.banner.failed.show", (e) =>
      addLog("Banner Fail: " + e.message),
    );

    // Other events
    document.addEventListener("on.interstitial.loaded", () =>
      addLog("Interstitial: LOADED"),
    );
    document.addEventListener("on.interstitial.dismissed", () =>
      addLog("Interstitial: DISMISSED"),
    );
    document.addEventListener("on.rewarded.loaded", () =>
      addLog("Rewarded: LOADED"),
    );
    document.addEventListener("on.rewarded.earned", (e) =>
      addLog(`REWARD: Earned ${e.amount} ${e.type}`),
    );
    document.addEventListener("on.rewarded.dismissed", () =>
      addLog("Rewarded: DISMISSED"),
    );
    document.addEventListener("on.appopen.loaded", () =>
      addLog("App Open: LOADED"),
    );
    document.addEventListener("on.appopen.dismissed", () =>
      addLog("App Open: DISMISSED"),
    );
    document.addEventListener("on.native.loaded", () =>
      addLog("Native: LOADED"),
    );
  };

  // ================= AD CONTROLS =================

  // 1. BANNER (PUSH CONTENT MODE)
  const showBanner = () => {
    window.admobNextGen.createBanner({
      adUnitId: 'ca-app-pub-3940256099942544/9214589741',
      position: 'bottom',       // 'top' or 'bottom'
      size: 'ADAPTIVE',         // 'BANNER', 'LARGE_BANNER', 'MEDIUM_RECTANGLE', 'ADAPTIVE', 'FULL_BANNER', 'LEADERBOARD'
      isOverlapping: false,     // true = Overlay, false = Push Webview
      collapsible: false,        // true = Enable Collapsible Format (High Revenue)
      retryInterval: 5000,      // Anti-spam delay (ms)
      isAutoShow: true
    });
    addLog("Requesting Banner (Push Mode)...");
  };

  const removeBanner = () => {
    window.admobNextGen.removeBanner();
    addLog("Banner removed");
  };

  // ... (Other functions remain the same: showInterstitial, showRewarded, etc.)
  const loadInterstitial = () => {
    window.admobNextGen.createInterstitial({
      adUnitId: "ca-app-pub-3940256099942544/1033173712",
      isAutoShow: false,
    });
    addLog("Loading Interstitial...");
  };
  const showInterstitial = () => window.admobNextGen.showInterstitial();


  const loadRewarded = () => {
    window.admobNextGen.createRewarded({
      adUnitId: "ca-app-pub-3940256099942544/5224354917",
      isAutoShow: false,
    });
    addLog("Loading Rewarded...");
  };
  const showRewarded = () => window.admobNextGen.showRewarded();


  const loadAppOpen = () => {
    window.admobNextGen.loadAppOpenAd({
      adUnitId: "ca-app-pub-3940256099942544/9257395921",
      isAutoShow: false,
    });
    addLog("Loading App Open...");
  };


  const showAppOpen = () => window.admobNextGen.showAppOpenAd();


  const showNative = () => {
    window.admobNextGen.createNativeAd({
      adUnitId: "ca-app-pub-3940256099942544/2247696110",
      view: "modal_center",
      isOverlapping: true,
    });
    addLog("Requesting Native...");
  };
  
  const removeNative = () => {
    window.admobNextGen.removeNativeAd();
    addLog("Native removed");
  };

  return (
    // Main container uses Flexbox to push footer to bottom
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        "min-height": "100vh", // Force full height
        "background-color": "#282c34",
        color: "white",
      }}
    >
      {/* CONTENT AREA (Grows to fill space) */}
      <div style={{ flex: 1, padding: "20px", "text-align": "center" }}>
        <img
          src={logo}
          class={styles.logo}
          alt="logo"
          style={{ height: "80px" }}
        />
        <p style={{ "font-weight": "bold", color: "#4caf50" }}>{status()}</p>

        {/* LOG PANEL */}
        <div
          style={{
            background: "#1e1e1e",
            color: "#0f0",
            padding: "10px",
            height: "150px",
            overflow: "scroll",
            "text-align": "left",
            "font-family": "monospace",
            "font-size": "11px",
            margin: "10px auto",
            border: "1px solid #555",
            "border-radius": "5px",
          }}
        >
          {logs().map((log) => (
            <div>{log}</div>
          ))}
        </div>

        {/* CONTROLS */}
        <div
          style={{
            display: "flex",
            "flex-direction": "column",
            gap: "10px",
            "margin-top": "20px",
          }}
        >
          <div style={btnGroupStyle}>
            <span style={labelStyle}>Banner:</span>
            <button onClick={showBanner}>Show (Push)</button>
            <button onClick={removeBanner} style={{ background: "#d32f2f" }}>
              Remove
            </button>
          </div>

          <div style={btnGroupStyle}>
            <span style={labelStyle}>Interstitial:</span>
            <button onClick={loadInterstitial}>Load</button>
            <button
              onClick={showInterstitial}
              style={{ background: "#ff9800" }}
            >
              Show
            </button>
          </div>

          <div style={btnGroupStyle}>
            <span style={labelStyle}>Rewarded:</span>
            <button onClick={loadRewarded}>Load</button>
            <button onClick={showRewarded} style={{ background: "#ff9800" }}>
              Show
            </button>
          </div>

          <div style={btnGroupStyle}>
            <span style={labelStyle}>App Open:</span>
            <button onClick={loadAppOpen}>Load</button>
            <button onClick={showAppOpen} style={{ background: "#ff9800" }}>
              Show
            </button>
          </div>

          <div style={btnGroupStyle}>
            <span style={labelStyle}>Native:</span>
            <button onClick={showNative}>Show</button>
            <button onClick={removeNative} style={{ background: "#d32f2f" }}>
              Remove
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER INDICATOR */}
      {/* This element is key. If banner pushes content, this will move UP. */}
      <div
        style={{
          padding: "15px",
          "background-color": "#ffeb3b",
          color: "#000",
          "text-align": "center",
          "font-weight": "bold",
          "border-top": "4px solid #f44336",
        }}
      >
        ⬇️ BOTTOM OF WEBVIEW ⬇️ <br />
        <span style={{ "font-size": "10px" }}>
          If banner is working correctly, this bar should sit ABOVE the ad.
        </span>
      </div>
    </div>
  );
}

// Styling
const btnGroupStyle = {
  display: "grid",
  "grid-template-columns": "80px 1fr 1fr",
  gap: "5px",
  "align-items": "center",
};

const labelStyle = {
  "font-size": "12px",
  "text-align": "right",
  "margin-right": "5px",
};

export default App;
