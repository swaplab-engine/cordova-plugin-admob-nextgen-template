import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { AdMobPanel } from "~/components/admob-panel";

export default component$(() => {
  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#1f2937' }}>Qwik AdMob ⚡</h1>
        <p style={{ color: '#6b7280' }}>Next Gen Plugin Demo</p>
      </div>
      
      {/* Panggil Panel AdMob */}
      <AdMobPanel />
      
      <div style={{ textAlign: 'center', marginTop: '40px', fontSize: '12px', color: '#9ca3af' }}>
        Powered by Qwik + Capacitor
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Qwik AdMob Next Gen",
  meta: [
    {
      name: "description",
      content: "Demo of Cordova AdMob Next Gen plugin in Qwik",
    },
  ],
};