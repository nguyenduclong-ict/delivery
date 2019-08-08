import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { IMqttMessage, MqttService } from "ngx-mqtt";
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
    private geolocation: Geolocation,
    private http: HttpClient,
    private _mqttService: MqttService,
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
    //
    setInterval(() => {
      this.geolocation.getCurrentPosition().then(response => {
        this.location.lat = response.coords.latitude;
        this.location.lng = response.coords.longitude;
      });

      if (!this.shipperNid) return;
      console.log(this.location);

      let data: any = {
        shipperNid: this.shipperNid,
        orders: this.orders,
        location: this.location
      };
      data = JSON.stringify(data);
      console.log(data);
      this._mqttService.unsafePublish("/delivery", data, {
        qos: 2,
        retain: false
      });
    }, 5000);
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
    this.getListShipper();
    this.initialize();
  }

  async initialize() {
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

  getStatusCode(status) {
    switch (status) {
      case "Lưu tạm":
        return 10;
      case "Ship đã nhận":
        return 14;
      case "Đã giao":
        return 15;
    }
  }

  getStatus(code) {
    switch (code) {
      case 10:
        return "Lưu tạm";
      case 14:
        return "Ship đã nhận";
      case 15:
        return "Đã giao";
    }
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

  nhanDon(item) {
    let data = JSON.stringify({
      status: this.getStatusCode("Ship đã nhận"),
      nid: item.nid
    });
    console.log(data);
    this.http
      .post(this.urlChangeOrderStatus, data, this.options)
      .toPromise()
      .then((result: any) => {
        if (result.success) {
          // Thành công
          this.orders.map(e => {
            if (e.nid === item.nid) e.status = this.getStatus(result.newStatus);
            return e;
          });
          this.orders = [...this.orders];
          this.presentToast("Thành công!", "toast-success");
          this.mqttShipperChangeOrder();
        } else {
          // Thất bại
          this.presentToast("Lỗi, Vui lòng thử lại!", "toast-danger");
        }
      })
      .catch((err: Error) => {
        console.log(err);
        this.presentToast("Lỗi, Vui lòng thử lại!", "toast-danger");
      });
  }
  mqttShipperChangeOrder() {
    this._mqttService.unsafePublish(
      "/order-change",
      JSON.stringify({ id: this.shipperNid }),
      {
        qos: 2,
        retain: false
      }
    );
  }
  traDon(item) {
    let data = JSON.stringify({
      status: this.getStatusCode("Lưu tạm"),
      nid: item.nid
    });

    console.log(data);
    this.http
      .post(this.urlChangeOrderStatus, data, this.options)
      .toPromise()
      .then((result: any) => {
        if (result.success) {
          // Thành công
          this.orders = this.orders.filter(e => {
            if (e.nid !== item.nid) return e;
          });
          this.presentToast("Thành công!", "toast-success");
          this.mqttShipperChangeOrder();
        } else {
          // Thất bại
          this.presentToast("Lỗi, Vui lòng thử lại!", "toast-danger");
        }
      })
      .catch((err: Error) => {
        console.log(err);
        this.presentToast("Lỗi, Vui lòng thử lại!", "toast-danger");
      });
  }

  xacNhanDaGiao(item) {
    let data = JSON.stringify({
      status: this.getStatusCode("Đã giao"),
      nid: item.nid
    });

    console.log(data);
    this.http
      .post(this.urlChangeOrderStatus, data, this.options)
      .toPromise()
      .then((result: any) => {
        if (result.success) {
          // Thành công
          this.orders.map(e => {
            if (e.nid === item.nid) e.status = this.getStatus(result.newStatus);
            return e;
          });
          this.orders = [...this.orders];
          this.presentToast("Thành công!", "toast-success");
          this.mqttShipperChangeOrder();
        } else {
          // Thất bại
          this.presentToast("Lỗi, Vui lòng thử lại!", "toast-danger");
        }
      })
      .catch((err: Error) => {
        console.log(err);
        this.presentToast("Lỗi, Vui lòng thử lại!", "toast-danger");
      });
  }

  async presentAlert(message, buttons) {
    let alert = await this.alertController.create({
      header: "Alert",
      message: message,
      buttons: buttons
    });
    alert.present();
  }
}
