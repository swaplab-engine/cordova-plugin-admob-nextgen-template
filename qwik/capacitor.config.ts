import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.qwik.template',
  appName: 'Qwik Template',
  webDir: 'dist',
  plugins: {
    AdMob: {
      APP_ID_ANDROID: "ca-app-pub-3940256099942544~3347511713",
      NEXT_GEN_SDK_VERSION: "0.23.0-beta01",
      UMP_VERSION: "4.0.0"
    }
  },
  "cordova": {
    "preferences": {
      "android-minSdkVersion": "24"
    }
  }
};

export default config;