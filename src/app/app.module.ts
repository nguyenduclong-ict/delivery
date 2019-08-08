import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { IonicStorageModule, Storage } from "@ionic/storage";
// import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { HttpClientModule } from '@angular/common/http';

import {
  IMqttMessage,
  MqttModule,
  IMqttServiceOptions
} from 'ngx-mqtt';
import { OrderDetailPage } from './order-detail/order-detail.page';

export const MQTT_SERVICE_OPTIONS : IMqttServiceOptions = { //: MqttServiceOptions  = {
  hostname: 'm16.cloudmqtt.com' ,
  port:     31019,
  path:     '/mqtt', 
  protocol: 'wss',
  username: 'ylwzkmxk',
  password: 'JRS9SIah0UlS'
};

@NgModule({
  declarations: [AppComponent, OrderDetailPage],
  entryComponents: [OrderDetailPage],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(),
    MqttModule.forRoot(MQTT_SERVICE_OPTIONS),
    AppRoutingModule,
    IonicStorageModule.forRoot()
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    // BarcodeScanner,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
