import { Injectable } from "@angular/core";
import {
  LoadingController,
  AlertController,
  ToastController
} from "@ionic/angular";
@Injectable({
  providedIn: "root"
})
export class MyLibrariesService {
  constructor(
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastCtrl: ToastController
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
  async presentToast(message, cssClass = "", duration = 100000) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: duration,
      cssClass: cssClass
    });
    toast.present();
  }
}
