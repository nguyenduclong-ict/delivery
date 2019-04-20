import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { IMqttMessage, MqttService } from "ngx-mqtt";
import {
  AlertController,
  NavController,
  ModalController
} from "@ionic/angular";
import { OrderDetailPage } from "../order-detail/order-detail.page";
import "rxjs/add/operator/map";
import { Router } from '@angular/router';

@Component({
  selector: "app-delivery",
  templateUrl: "./delivery.page.html",
  styleUrls: ["./delivery.page.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryPage implements OnInit {
  urlListShipper = "https://po.chuyengiaso.com/api/list-shipper/";
  urlListRouter = "https://po.chuyengiaso.com/api/list-router/";
  urlListOrder = "https://po.chuyengiaso.com/api/orders-of-router/";
  urlChangeOrderStatus = "https://po.chuyengiaso.com/api/change-order-status/";

  options = {
    headers: {
      "Content-Type": "application/json"
    }
  };

  constructor(
    private geolocation: Geolocation,
    private http: HttpClient,
    private _mqttService: MqttService,
    private alertController: AlertController,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private ref: ChangeDetectorRef,
    private router : Router
  ) {
    this.refreshSelect(0);
    this.refreshSelect(1);
    setInterval(() => {
      this.geolocation.getCurrentPosition().then(response => {
        this.location.lat = response.coords.latitude;
        this.location.lng = response.coords.longitude;
      });

      if (!this.shipperNid) return;
      console.log(this.location);

      let data: any = {
        shipperNid: this.shipperNid,
        routerNid: this.routerNid,
        orderNid: this.orderNid,
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

  @ViewChild("Router") Router;

  shippers: any[] = [];
  routers: any[] = [];
  orders: any[] = [];

  shipperNid: any = "";
  routerNid: any = "";
  orderNid: any = "";
  location = {
    lat: 0,
    lng: 0
  };
  // Lay danh sach shipper
  getListShipper() {
    //this.Router.nativeElement
    this.http.get(this.urlListShipper).subscribe((data: any) => {
      this.shippers = data.nodes;
      this.ref.detectChanges();
    });
  }

  refreshSelect(key) {
    switch (key) {
      case 0:
        this.shippers = [{ nid: -1, title: "Không có dữ liệu" }];
        break;
      case 1:
        this.routers = [{ nid: -1, title: "Không có dữ liệu" }];
        break;
      default:
        break;
    }
  }

  // Lay danh sach chuyen giao hang
  getRoutersOfShipper() {
    let url = this.urlListRouter + this.shipperNid;
    this.http.get(url).subscribe((data: any) => {
      if (data.nodes.length == 0) {
        this.routerNid = null;
      } else if (data.nodes.length > 0) {
        this.routers = data.nodes;
      }
      this.ref.detectChanges();
      console.log(this.routers);
    });
  }

  // Lay danh sach don hang
  getOrderOfRouter() {
    let url = this.urlListOrder + this.routerNid;
    this.http.get(url).subscribe((data: any) => {
      this.orders = data.nodes;
      console.log(data.nodes);
    });
  }

  ngOnInit() {
    this.getListShipper();
  }

  routerChange(event) {
    //this.routerNid = $event.target.value;
    console.log("routerChange");
    console.log(event.target.value);
    if(event.value == -1) this.routerNid = null;
    this.getOrderOfRouter();
  }

  shipperChange(event) {
    console.log("shipperChange");
    console.log(event.target.value);
    // this.shipperNid = event.target.value;
    this.getRoutersOfShipper();
  }

  checkStatus(status) {
    switch (status) {
      case "Lưu tạm":
        return 10;
      case "Đã nhận đủ hàng":
        return 12;
      case "Đã hoàn thành":
        return 15;
    }
  }

  getStatus(code) {
    switch (code) {
      case 10:
        return "Lưu tạm";
      case 12:
        return "Đã nhận đủ hàng";
      case 15:
        return "Đã hoàn thành";
    }
  }

  onOrderClick(order) {
    let buttons = [
      {
        text: "Xem thông tin",
        handler: async () => {
          // Xem thong tin đơn
          console.log("Xem thong tin");
          const modal = await this.modalCtrl.create({
            component: OrderDetailPage,
            componentProps: {
              order: order
            }
          });
          modal.present();
        }
      }
    ];
    if (this.checkStatus(order.status) == 10) {
      // Neu don chua duoc giao
      // Giao don
      buttons.push({
        text: "Giao đơn này",
        handler: async () => {
          console.log("Choose Giao đơn này");
          if (this.orderNid != null) {
            this.presentAlert("Lỗi! Hiện đang giao đơn khác!", ["OK"]);
          } else {
            this.http
              .post(this.urlChangeOrderStatus, { status: 12, nid: order.nid })
              .toPromise()
              .then((result: any) => {
                if (result.success) {
                  // Thành công
                  this.orderNid = null;
                  this.orders.map(e => {
                    if (e.nid === order.nid)
                      e.status = this.getStatus(result.newStatus);
                    return e;
                  });
                  this.presentAlert("Thành công!", ["OK"]);
                } else {
                  // Thất bại
                  this.presentAlert("Lỗi, Vui lòng thử lại!", ["OK"]);
                }
              })
              .catch((err: Error) => {
                console.log(err);
                this.presentAlert("Lỗi, Vui lòng thử lại!", ["OK"]);
              });
          }
        }
      });

      //
    } else if (this.checkStatus(order.status) == 12) {
      // Neu don dang giao
      // Xác nhận đã giao đơn này
      buttons.push({
        text: "Xác nhận đã giao",
        handler: async () => {
          this.http
            .post(this.urlChangeOrderStatus, { status: 15, nid: order.nid })
            .toPromise()
            .then((result: any) => {
              if (result.success) {
                // Thành công
                this.orderNid = null;
                this.orders.map(e => {
                  if (e.nid === order.nid)
                    e.status = this.getStatus(result.newStatus);
                  return e;
                });
                this.presentAlert("Thành công!", ["OK"]);
              } else {
                // Thất bại
                this.presentAlert("Lỗi, Vui lòng thử lại!", ["OK"]);
              }
            })
            .catch((err: Error) => {
              console.log(err);
              this.presentAlert("Lỗi, Vui lòng thử lại!", ["OK"]);
            });
        }
      });

      // Không giao đơn này nữa
      buttons.push({
        text: "Huỷ giao đơn này",
        handler: async () => {
          let data = JSON.stringify({
            status: 10,
            nid: order.nid
          });

          this.http
            .post(this.urlChangeOrderStatus, data, this.options)
            .toPromise()
            .then((result: any) => {
              if (result.success) {
                // Thành công
                this.orderNid = null;
                this.orders.map(e => {
                  if (e.nid === order.nid)
                    e.status = this.getStatus(result.newStatus);
                  return e;
                });
                this.presentAlert("Thành công!", ["OK"]);
              } else {
                // Thất bại
                this.presentAlert("Lỗi, Vui lòng thử lại!", ["OK"]);
              }
            })
            .catch((err: Error) => {
              console.log(err);
              this.presentAlert("Lỗi, Vui lòng thử lại!", ["OK"]);
            });
        }
      });
    }
    buttons.push({
      text: "Huỷ",
      handler: null
    });
    this.presentAlert("Lựa chọn của bạn?", buttons);
  }

  refreshPage() {
    this.refreshSelect(1);
    this.routerNid = null;
    this.shipperNid = null;
    this.orders = [];
  }

  onClick() {
    if (this.routers === []) {
      console.log("Empty");
    }
  }

  async presentAlert(message, buttons) {
    let alert = await this.alertController.create({
      header: "Alert",
      message: message,
      buttons: buttons
    });
    alert.present();
  }

  async showCurrentOrder() {
    if (this.orders == null) return;
    let order = this.orders.find(e => this.checkStatus(e.status) == 12);
    if (!order) return;

    const modal = await this.modalCtrl.create({
      component: OrderDetailPage,
      componentProps: {
        order: order
      }
    });
    modal.present();
  }
}
