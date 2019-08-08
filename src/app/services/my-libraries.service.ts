import { Injectable } from "@angular/core";
import { LoadingController, AlertController } from "@ionic/angular";
@Injectable({
  providedIn: "root"
})
export class MyLibrariesService {
  constructor(
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {}

  async presentLoading({
    message = null,
    translucent = true,
    duration = 30000
  }) {
    let loading = await this.loadingController.create({
      duration: duration,
      message: message,
      translucent: translucent
    });
    await loading.present();
    return loading;
  }

  async presentAlert({
    header = "",
    subHeader = "",
    message = "",
    buttons = ["OK"]
  }: any) {
    const alert = await this.alertController.create({
      header: header,
      subHeader: subHeader,
      message: "<p>" + message + "</p>",
      buttons: buttons
    });
    return await alert.present();
  }
}
