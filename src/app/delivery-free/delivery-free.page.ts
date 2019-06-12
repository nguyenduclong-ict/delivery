import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { IMqttMessage, MqttService } from "ngx-mqtt";
import { AlertController, ModalController, ToastController } from "@ionic/angular";
import { OrderDetailPage } from "../order-detail/order-detail.page";
var dateFormat = require("dateformat");
@Component({
  selector: "app-delivery-free",
  templateUrl: "./delivery-free.page.html",
  styleUrls: ["./delivery-free.page.scss"]
})
export class DeliveryFreePage implements OnInit {
  urlListShipper = "https://po.chuyengiaso.com/api/list-shipper";
  urlListOrder = "https://po.chuyengiaso.com/api/orders-free";
  urlChangeOrderStatus = "https://po.chuyengiaso.com/api/change-order-status";

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
    private toastCtrl: ToastController
  ) {
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
  date: Date = new Date();
  shipperNid: any = "";
  orderNid: any = "";
  location = {
    lat: 0,
    lng: 0
  };
  // Lay danh sach shipper
  getListShipper() {
    this.http.get(this.urlListShipper).subscribe((data: any) => {
      this.shippers = data.nodes;
    });
  }
  // Lay danh sach don hang
  getOrders() {
    let date = dateFormat(this.date, "yyyy-mm-dd");
    let url = `${this.urlListOrder}/${date}`;
    this.http.get(url).subscribe((data: any) => {
      this.orders = data.nodes;
      console.log(data.nodes);
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
  }

  shipperChange(event) {
    console.log("shipperChange");
    console.log(event.target.value);
    this.shipperNid = event.target.value;
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
    if(!this.shipperNid) {
      this.presentAlert('Vui lòng chọn shipper!', ['CLOSE']);
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

  refreshPage() {
    this.date = new Date();
    this.getOrders();
  }

  mqttShipperChangeOrder() {
    this._mqttService.unsafePublish("/order-change", JSON.stringify({ id: this.shipperNid }), {
      qos: 2,
      retain: false
    });
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
