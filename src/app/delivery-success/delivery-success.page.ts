import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  AlertController,
  ModalController,
  ToastController
} from "@ionic/angular";
import { OrderDetailPage } from "../order-detail/order-detail.page";
import { ConfigService } from "../services/config.service";
import { GlobalVariablesService } from "../services/global-variables.service";
import { ResApiService } from "../services/res-api.service";
var dateFormat = require("dateformat");

@Component({
  selector: "app-delivery-success",
  templateUrl: "./delivery-success.page.html",
  styleUrls: ["./delivery-success.page.scss"]
})
export class DeliverySuccessPage implements OnInit {
  urlListShipper;
  urlListOrderSuccess;
  urlChangeOrderStatus;

  options = {
    headers: {
      "Content-Type": "+json"
    }
  };

  constructor(
    private alertController: AlertController,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private config: ConfigService,
    private globalVariables: GlobalVariablesService,
    private mhttp: ResApiService
  ) {
    this.urlChangeOrderStatus = this.config.urlChangeOrderStatus;
    this.urlListOrderSuccess = this.config.urlListOrderSuccess;
    this.urlListShipper = this.config.urlListShipper;
    this.date = dateFormat(new Date(), "yyyy-mm-dd");
  }

  shippers: any[] = [];
  routers: any[] = [];
  orders: any[] = [];
  date: any;
  shipperNid: any = "";
  orderNid: any = "";
  location = { lat: 0, lng: 0 };
  // Lay danh sach shipper
  getListShipper() {
    this.mhttp.getWithCache(this.urlListShipper, this.options, response => {
      this.shippers = response.nodes;
      this.shippers.unshift({ title: "Tất cả", nid: "all" });
    });
  }
  // Lay danh sach don hang
  async getListOrdersSuccess(page = 0, loading = true) {
    let date = dateFormat(this.date, "yyyy-mm-dd");
    let url =
      this.urlListOrderSuccess + `/${this.shipperNid}/${date}?page=${page}`;
    console.log(url);
    return new Promise(resolve => {
      this.mhttp.getWithCache(
        url,
        this.options,
        data => {
          if (page == 0) this.orders = [];
          this.orders = [...this.orders, ...data.nodes];
          if (data.nodes.length == 0) this.presentToast("Không còn dữ liệu");
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

  // initialize Page
  async initialize() {
    await this.getListShipper();
    this.shipperNid = await this.globalVariables.getShipperNid();
    this.getListOrdersSuccess();
  }

  //
  shipperChange(event) {
    if (!event.target.value) return;
    let shipperNid = event.target.value;
    this.shipperNid = shipperNid;
    this.getListOrdersSuccess(0);
  }

  //
  async showOrderDetail(order) {
    const modal = await this.modalCtrl.create({
      component: OrderDetailPage,
      componentProps: { order: order }
    });
    modal.present();
  }

  // Nhận đơn hàng
  onClickNhanDon(item) {
    this.presentAlert("Nhận đơn này?", [
      {
        text: "Nhận",
        role: "ok",
        handler: () => this.putNhanDon(item)
      },
      "Hủy"
    ]);
    if (!this.shipperNid) {
      this.presentAlert("Vui lòng chọn shipper!", ["CLOSE"]);
      return;
    }
  }

  putNhanDon = function(item) {
    // Data put
    let data = {
      status: this.globalVariables.orderStatusList.RECIVED.tid,
      nid: item.nid,
      shipperNid: this.shipperNid
    };
    this.mhttp
      .put(this.urlChangeOrderStatus, JSON.stringify(data), this.options)
      .then((result: any) => {
        console.log(result);
        // Lấy thông tin kết quả trả về gồm nid, status, shipper
        let resultNid = result.nid;
        let resultShipperNid = result.field_delivery_shippers.und
          ? result.field_delivery_shippers.und[0]["nid"]
          : "";
        let resultStatus = result.field_delivery_status.und
          ? result.field_delivery_status.und[0]["tid"]
          : "";
        console.log({ resultNid, resultStatus, resultShipperNid });
        console.log(data);
        // Nếu kết quả trả về khớp, => thông báo nhận đơn thành công
        if (
          data.nid == resultNid &&
          data.status == resultStatus &&
          data.shipperNid == resultShipperNid
        ) {
          this.presentToast("Đã nhận đơn hàng", "toast-success");
        } else {
          // Nhận đơn thất bại
          this.presentToast("Lỗi, Vui lòng thử lại!", "toast-danger");
        }
      })
      .catch((err: Error) => {
        console.log(err);
        this.presentToast("Lỗi, Vui lòng thử lại!", "toast-danger");
      });
  };

  async presentAlert(message, buttons = []) {
    let alert = await this.alertController.create({
      header: "Thông báo",
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
    this.getListOrdersSuccess(nextPage, false).then(result => {
      event.target.complete();
    });
  }
}
