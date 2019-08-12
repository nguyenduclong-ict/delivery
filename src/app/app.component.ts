import { Component, ViewChild, ElementRef } from "@angular/core";

import { Platform } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { ConfigService } from "./services/config.service";
import { GlobalVariablesService } from "./services/global-variables.service";
import { MqttClientService } from "./services/mqtt-client.service";

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
    private mqttClient: MqttClientService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.globalVaribles.initialize();
      this.statusBar.styleDefault();
      this.statusBar.backgroundColorByHexString("#ffffff");
      this.splashScreen.hide();
      this.mqttClient.startMqttOnline();
    });
  }
}
