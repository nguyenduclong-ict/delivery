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
import { ConfigService } from "../services/config.service";
import { GlobalVariablesService } from "../services/global-variables.service";
import { BroadcastService } from "../services/broadcast.service";
import { ChanelService } from "../services/chanel.service";
import { ResApiService } from "../services/res-api.service";
var dateFormat = require("dateformat");
@Component({
  selector: "app-delivery-free",
  templateUrl: "./delivery-free.page.html",
  styleUrls: ["./delivery-free.page.scss"]
})
export class DeliveryFreePage implements OnInit {
  urlListShipper;
  urlListOrderFree;
  urlChangeOrderStatus;

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
    private config: ConfigService,
    private broadcast: BroadcastService,
    private chanel: ChanelService,
    private globalVariables: GlobalVariablesService,
    private mhttp: ResApiService
  ) {
    this.urlChangeOrderStatus = this.config.urlChangeOrderStatus;
    this.urlListOrderFree = this.config.urlListOrderFree;
    this.urlListShipper = this.config.urlListShipper;

    this.date = dateFormat(new Date(), "yyyy-mm-dd");

    setInterval(() => {
      this.geolocation.getCurrentPosition().then(response => {
        this.location.lat = response.coords.latitude;
        this.location.lng = response.coords.longitude;
      });

      if (!this.shipperNid) return;
      console.log(this.location);

      let data: any = {
        shipperNid: this.shipperNid,
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

  shippers: any[] = [];
  routers: any[] = [];
  orders: any[] = [];
  date: any;
  shipperNid: any = "";
  orderNid: any = "";
  location = {
    lat: 0,
    lng: 0
  };
  // Lay danh sach shipper
  getListShipper() {
    this.mhttp.getWithCache(this.urlListShipper, this.options, response => {
      this.shippers = response.nodes;
    });
  }
  // Lay danh sach don hang
  getListOrdersFree() {
    let date = dateFormat(this.date, "yyyy-mm-dd");
    let url = `${this.urlListOrderFree}/${date}`;
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
    this.getListOrdersFree();
    this.initialize();
  }

  // initialize Page
  async initialize() {
    this.shipperNid = await this.globalVariables.getShipperNid();
  }

  shipperChange(event) {
    if (!event.target.value) return;
    let shipperNid = event.target.value;
    this.shipperNid = shipperNid;
    this.broadcast.pushMessage(this.chanel.GLOBAL_VARIABLES_CHANEL, {
      action: "CHANGE_SHIPPER_NID",
      data: shipperNid
    });
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
    if (!this.shipperNid) {
      this.presentAlert("Vui lòng chọn shipper!", ["CLOSE"]);
      return;
    }
    let data = JSON.stringify({
      status: this.getStatusCode("Ship đã nhận"),
      nid: item.nid,
      shipper_nid: this.shipperNid
    });
    console.log(data);
    this.http
      .post(this.urlChangeOrderStatus, data, this.options)
      .toPromise()
      .then((result: any) => {
        console.log(result);
        if (result.success) {
          // Thành công
          this.orders.map(e => {
            if (e.nid === item.nid) e.status = this.getStatus(result.newStatus);
            return e;
          });
          this.orders = [...this.orders];
          this.presentToast("Đã nhận đơn hàng", "toast-success");
          this.mqttShipperChangeOrder();
          // Gửi thay đổi đơn hàng lên server
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

  async presentAlert(message, buttons = []) {
    let alert = await this.alertController.create({
      header: "Thông báo",
      message: message,
      buttons: buttons
    });
    alert.present();
  }
}
