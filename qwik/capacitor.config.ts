import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.qwik.template',
  appName: 'Qwik Template',
  webDir: 'dist',
  plugins: {
    AdMob: {
      APP_ID_ANDROID: "ca-app-pub-3940256099942544~3347511713",
      NEXT_GEN_SDK_VERSION: "1.2.0",
      UMP_VERSION: "4.0.0",
      APP_ID_IOS: "ca-app-pub-3940256099942544~1458002511"
    }
  },
  "cordova": {
    "preferences": {
      "android-minSdkVersion": "24"
    }
  }
};

export default config;