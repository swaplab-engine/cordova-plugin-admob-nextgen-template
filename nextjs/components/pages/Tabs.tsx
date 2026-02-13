import { Redirect, Route, Switch } from 'react-router-dom';
import {
  IonRouterOutlet,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/react';
import { cog, flash, list, pricetag } from 'ionicons/icons'; // Tambahkan pricetag

import Home from './Feed';
import Lists from './Lists';
import ListDetail from './ListDetail';
import Settings from './Settings';
import Admob from './Admob'; // 1. IMPORT FILE BARU

const Tabs = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Switch>
          <Route path="/feed" render={() => <Home />} exact={true} />
          <Route path="/lists" render={() => <Lists />} exact={true} />
          <Route
            path="/lists/:listId"
            render={() => <ListDetail />}
            exact={true}
          />
          <Route path="/settings" render={() => <Settings />} exact={true} />
          
          {/* 2. TAMBAHKAN ROUTE */}
          <Route path="/admob" render={() => <Admob />} exact={true} />

          <Route path="" render={() => <Redirect to="/feed" />} exact={true} />
        </Switch>
      </IonRouterOutlet>
      
      <IonTabBar slot="bottom">
        <IonTabButton tab="tab1" href="/feed">
          <IonIcon icon={flash} />
          <IonLabel>Feed</IonLabel>
        </IonTabButton>

        {/* 3. TAMBAHKAN TOMBOL TAB */}
        <IonTabButton tab="tab-admob" href="/admob">
          <IonIcon icon={pricetag} />
          <IonLabel>AdMob</IonLabel>
        </IonTabButton>

        <IonTabButton tab="tab2" href="/lists">
          <IonIcon icon={list} />
          <IonLabel>Lists</IonLabel>
        </IonTabButton>
        <IonTabButton tab="tab3" href="/settings">
          <IonIcon icon={cog} />
          <IonLabel>Settings</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default Tabs;