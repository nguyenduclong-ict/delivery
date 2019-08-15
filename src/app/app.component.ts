import { Component, ViewChild, ElementRef } from "@angular/core";

import { Platform } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { GlobalVariablesService } from "./services/global-variables.service";
import { MqttClientService } from "./services/mqtt-client.service";
import { Device } from "@ionic-native/device/ngx";
@Component({
  selector: "app-root",
  templateUrl: "app.component.html"
})
export class AppComponent {
  public appPages = [
    {
      title: "Đơn đã nhận",
      url: "/delivery",
      icon: "car"
    },
    {
      title: "Đơn chưa nhận",
      url: "/delivery-free",
      icon: "list"
    },
    {
      title: "Đơn đã giao",
      url: "/delivery-success",
      icon: "list-box"
    }
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private globalVaribles: GlobalVariablesService,
    private mqttClient: MqttClientService,
    private device: Device
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.globalVaribles.initialize();
      this.statusBar.styleDefault();
      this.statusBar.backgroundColorByHexString("#ffffff");
      this.splashScreen.hide();
      if (
        (this.platform.is("android") &&
          this.device.version.split(".").shift() < "9") ||
        this.platform.is("ios")
      ) {
        this.enableBackgroundMode();
      }
      this.mqttClient.startMqttOnline();
    });
  }

  enableBackgroundMode() {
    let cordovaPlugins: any = window.cordova.plugins;
    let bgMode: any = cordovaPlugins.backgroundMode;
    bgMode.enable();
    bgMode.on("enable", () => {
      console.log("background mode activated !!!");
      bgMode.disableWebViewOptimizations();
      bgMode.disableBatteryOptimizations();
    });
  }
}
