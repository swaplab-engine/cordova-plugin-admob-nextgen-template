'use client';

import { useEffect } from 'react';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { IonReactRouter } from '@ionic/react-router';
import { Route } from 'react-router-dom';
import Tabs from './pages/Tabs';

setupIonicReact({});

const AppShell = () => {

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const handler = async (status: MediaQueryListEvent) => {
      try {
        await StatusBar.setStyle({
          style: status.matches ? Style.Dark : Style.Light,
        });
      } catch {}
    };

    media.addEventListener('change', handler);

    return () => {
      media.removeEventListener('change', handler);
    };
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet id="main">
          <Route path="/" render={() => <Tabs />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default AppShell;
