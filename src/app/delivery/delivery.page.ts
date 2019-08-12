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
    this.broadcast.subscribe(
      this.chanel.DELIVERY_PAGE_CHANEL,
      this.onBroadcastReciveMessage.bind(this)
    );
  }

  onBroadcastReciveMessage({ action, data }) {
    console.log({ action, data });
    switch (action) {
      case "RELOAD_LIST":
        this.getListOrderOfShipper(0, data.loading);
        break;
      default:
        break;
    }
  }

  // Lay danh sach shipper
  getListShipper() {
    this.mhttp.getWithCache(this.urlListShipper, this.options, response => {
      this.shippers = response.nodes;
    });
  }
  // Lay danh sach don hang
  async getListOrderOfShipper(page = 0, loading = true) {
    if (!this.shipperNid) return;
    let shipper = this.shipperNid;
    let date = dateFormat(this.date, "yyyy-mm-dd");
    let url = `${this.urlListOrderOfShip}/${shipper}/${date}?page=${page}`;
    console.log("GET_LIST_ORDER_OF_SHIPPER", { url });
    return new Promise(resolve => {
      this.mhttp.getWithCache(
        url,
        this.options,
        data => {
          console.log(data);
          if (page == 0) this.orders = [];
          this.orders = [...this.orders, ...data.nodes];
          if (data.nodes.length == 0 && page != 0)
            this.presentToast("Không còn dữ liệu");
          resolve(true);
        },
        false,
        loading
      );
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
    this.getListOrderOfShipper(0);
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
  onGiaoDonClick(item) {
    this.presentAlert("Bạn có chắc giao đơn này cho nhà hàng chứ", [
      {
        text: "Giao",
        role: "ok",
        handler: () => this.putGiaoDon(item)
      },
      "Hủy"
    ]);
  }

  // Event button tra don click
  onTraDonClick(item) {
    this.presentAlert("Bạn có chắc trả đơn hàng này lại chứ", [
      {
        text: "Trả",
        role: "ok",
        handler: () => this.putTraDon(item)
      },
      "Hủy"
    ]);
  }

  // put giao don to server
  putGiaoDon = async function(item) {
    let shipperNid = await this.globalVariables.getShipperNid();
    // Data put
    let data = {
      status: this.globalVariables.orderStatusList.SUCCESS.tid,
      nid: item.nid,
      shipperNid: shipperNid
    };
    this.mhttp
      .put(this.urlChangeOrderStatus, JSON.stringify(data), this.options)
      .then((result: any) => {
        // Lấy thông tin kết quả trả về gồm nid, status, shipper
        let resultNid = result.nid;
        let resultShipperNid = result.field_delivery_shippers.und
          ? result.field_delivery_shippers.und[0]["nid"]
          : "";
        let resultStatus = result.field_delivery_status.und
          ? result.field_delivery_status.und[0]["tid"]
          : "";
        // Nếu kết quả trả về khớp, => thông giao đơn đơn thành công
        if (
          data.nid == resultNid &&
          data.status == resultStatus &&
          data.shipperNid == resultShipperNid
        ) {
          this.presentAlert("Giao đơn thành công", ["OK"]);
          // load lại danh sách
          let message = {
            action: "RELOAD_LIST",
            data: {
              loading: false
            }
          };
          this.broadcast.pushMessage(this.chanel.DELIVERY_PAGE_CHANEL, message);
        } else {
          // Giao đơn thất bại
          this.presentToast("Lỗi, Vui lòng thử lại!", "toast-danger");
        }
      })
      .catch((err: Error) => {
        console.log(err);
        this.presentToast("Lỗi, Vui lòng thử lại!", "toast-danger");
      });
  };

  // put tra don to server
  putTraDon = async function(item) {
    let shipperNid = await this.globalVariables.getShipperNid();
    // Data put
    let data = {
      status: this.globalVariables.orderStatusList.PENDING.tid,
      nid: item.nid,
      shipperNid: shipperNid
    };
    this.mhttp
      .put(this.urlChangeOrderStatus, JSON.stringify(data), this.options)
      .then((result: any) => {
        // Lấy thông tin kết quả trả về gồm nid, status, shipper
        let resultNid = result.nid;
        let resultShipperNid = result.field_delivery_shippers.und
          ? result.field_delivery_shippers.und[0]["nid"]
          : "";
        let resultStatus = result.field_delivery_status.und
          ? result.field_delivery_status.und[0]["tid"]
          : "";
        // Nếu kết quả trả về khớp, => thông báo trả đơn thành công
        if (
          data.nid == resultNid &&
          data.status == resultStatus &&
          data.shipperNid == resultShipperNid
        ) {
          this.presentAlert("Đã trả lại đơn hàng", ["OK"]);
          // load lại danh sách
          let message = {
            action: "RELOAD_LIST",
            data: {
              loading: false
            }
          };
          this.broadcast.pushMessage(this.chanel.DELIVERY_PAGE_CHANEL, message);
        } else {
          // Trả đơn thất bại
          this.presentToast("Lỗi, Vui lòng thử lại!", "toast-danger");
        }
      })
      .catch((err: Error) => {
        console.log(err);
        this.presentToast("Lỗi, Vui lòng thử lại!", "toast-danger");
      });
  };

  async presentAlert(message, buttons, header = "Chú ý") {
    let alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: buttons
    });
    alert.present();
  }

  // Infinite Scroll
  onInfinite(event) {
    let nextPage =
      this.orders.length % 10 == 0
        ? this.orders.length / 10
        : this.orders.length / 10 + 1;
    this.getListOrderOfShipper(nextPage, false).then(result => {
      event.target.complete();
    });
  }
}
