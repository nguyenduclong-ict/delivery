import { Component, ViewChild, ElementRef } from "@angular/core";

import { Platform } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { ConfigService } from "./services/config.service";
import { GlobalVariablesService } from "./services/global-variables.service";

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
      icon: "list"
    }
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private globalVaribles: GlobalVariablesService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.globalVaribles.initialize();
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
