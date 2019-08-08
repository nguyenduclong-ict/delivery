import { Injectable } from "@angular/core";
import { ConfigService } from "./config.service";
import { ResApiService } from "./res-api.service";
import { BroadcastService } from "./broadcast.service";
import { ChanelService } from "./chanel.service";
import { Storage } from "@ionic/storage";

@Injectable({
  providedIn: "root"
})
export class GlobalVariablesService {
  // props
  shipperNid;
  orderStatusList = {
    ERROR: {
      tid: 16,
      text: "Lỗi"
    },
    SUCCESS: {
      tid: 15,
      text: "Đã giao"
    },
    PENDING: {
      tid: 10,
      text: "Lưu tạm"
    },
    RECIVED: {
      tid: 14,
      text: "Ship đã nhận"
    }
  };

  constructor(
    private config: ConfigService,
    private mhttp: ResApiService,
    private broadcast: BroadcastService,
    private chanel: ChanelService,
    private storage: Storage
  ) {
    this.broadcast.subscribe(
      this.chanel.GLOBAL_VARIABLES_CHANEL,
      this.onReciveMessage.bind(this)
    );
    this.initialize();
  }

  initialize() {}

  onReciveMessage({ action, data }) {
    console.log({ action, data });
    let key;
    switch (action) {
      case "CHANGE_SHIPPER_NID":
        key = this.config.appName + "-" + "SHIPPER_NID";
        this.shipperNid = data;
        this.storage.set(key, this.shipperNid);
        break;
      default:
        break;
    }
  }

  async getShipperNid() {
    if (this.shipperNid) return this.shipperNid;
    return new Promise(resolve => {
      let key = this.config.appName + "-" + "SHIPPER_NID";
      this.storage.get(key).then(nid => {
        this.shipperNid = nid;
        resolve(nid);
      });
    });
  }
}
