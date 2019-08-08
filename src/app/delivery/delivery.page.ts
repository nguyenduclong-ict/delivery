import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  AlertController,
  ModalController,
  ToastController
} from "@ionic/angular";
import { OrderDetailPage } from "../order-detail/order-detail.page";
import { GlobalVariablesService } from "../services/global-variables.service";
import { ConfigService } from "../services/config.service";
import { BroadcastService } from "../services/broadcast.service";
import { ChanelService } from "../services/chanel.service";
import { ResApiService } from "../services/res-api.service";
var dateFormat = require("dateformat");

@Component({
  selector: "app-delivery",
  templateUrl: "./delivery.page.html",
  styleUrls: ["./delivery.page.scss"]
})
export class DeliveryPage implements OnInit {
  urlListShipper;
  urlListOrderOfShip;
  urlChangeOrderStatus;

  shippers: any[] = [];
  routers: any[] = [];
  orders: any[] = [];
  date: Date;
  shipperNid: any = "";
  orderNid: any = "";
  location = {
    lat: 0,
    lng: 0
  };

  options = {
    headers: {
      "Content-Type": "+json"
    }
  };

  constructor(
    private http: HttpClient,
    private alertController: AlertController,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private globalVariables: GlobalVariablesService,
    private config: ConfigService,
    private broadcast: BroadcastService,
    private chanel: ChanelService,
    private mhttp: ResApiService
  ) {
    this.urlListShipper = this.config.urlListShipper;
    this.urlListOrderOfShip = this.config.urlListOrderOfShip;
    this.urlChangeOrderStatus = this.config.urlChangeOrderStatus;

    this.date = dateFormat(new Date(), "yyyy-mm-dd");
  }

  // Lay danh sach shipper
  getListShipper() {
    this.mhttp.getWithCache(this.urlListShipper, this.options, response => {
      this.shippers = response.nodes;
    });
  }
  // Lay danh sach don hang
  getListOrderOfShipper() {
    if (!this.shipperNid) return;
    console.log("getListOrderOfShipper");
    let shipper = this.shipperNid;
    let date = dateFormat(this.date, "yyyy-mm-dd");
    let url = `${this.urlListOrderOfShip}/${shipper}/${date}`;
    this.http.get(url).subscribe((data: any) => {
      this.orders = data.nodes;
    });
  }

  async presentToast(message, cssClass = "") {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      cssClass: cssClass
    });
    toast.present();
  }

  ngOnInit() {
    this.initialize();
  }

  async initialize() {
    this.getListShipper();
    this.shipperNid = await this.globalVariables.getShipperNid();
    this.getListOrderOfShipper();
  }

  shipperChange(event) {
    if (!event.target.value) return;
    let shipperNid = event.target.value;
    this.shipperNid = shipperNid;
    this.broadcast.pushMessage(this.chanel.GLOBAL_VARIABLES_CHANEL, {
      action: "CHANGE_SHIPPER_NID",
      data: shipperNid
    });
    this.getListOrderOfShipper();
  }

  async showOrderDetail(order) {
    const modal = await this.modalCtrl.create({
      component: OrderDetailPage,
      componentProps: {
        order: order
      }
    });
    modal.present();
  }

  // Event button giao don click
  onGiaoDonClick() {}

  // Event button tra don click
  onTraDonClick() {}

  // put giao don to server
  putGiaoDon() {}

  // put tra don to server
  putTraDon() {}

  async presentAlert(message, buttons) {
    let alert = await this.alertController.create({
      header: "Alert",
      message: message,
      buttons: buttons
    });
    alert.present();
  }
}
