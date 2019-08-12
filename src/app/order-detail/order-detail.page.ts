import { Component, OnInit } from "@angular/core";
import { ModalController, NavParams } from "@ionic/angular";

@Component({
  selector: "app-order-detail",
  templateUrl: "./order-detail.page.html",
  styleUrls: ["./order-detail.page.scss"]
})
export class OrderDetailPage implements OnInit {
  data: any;
  constructor(private modalCtrl: ModalController, params: NavParams) {
    this.data = params.get("order");
  }

  ngOnInit() {}

  onBtnBackClick() {
    console.log('go back');
    this.modalCtrl.dismiss();
  }
}
