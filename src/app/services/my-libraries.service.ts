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

  /**
   * 
   * @param option {
      message: message,
      translucent: translucent,
      duration
    }
   */
  async presentLoading(option) {
    let loading = await this.loadingController.create(option);
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
