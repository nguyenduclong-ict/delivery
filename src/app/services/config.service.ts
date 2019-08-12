import { Injectable } from "@angular/core";
import { ResApiService } from "./res-api.service";

@Injectable({
  providedIn: "root"
})
export class ConfigService {
  appName = "BaAnDelivery";
  domain = "https://po.chuyengiaso.com";

  // MqttClient Config
  static MQTT_SERVICE_OPTIONS: any = {
    hostname: "m16.cloudmqtt.com",
    port: 31019,
    path: "/mqtt",
    protocol: "wss",
    username: "ylwzkmxk",
    password: "JRS9SIah0UlS"
  };

  //
  urlPostFile = this.domain + "/api/file.json";
  urlPostNode = this.domain + "/api/node.json";

  // URL GET LIST
  urlListNhaHang = this.domain + "/api/list-nha-hang"; // Danh sách nhà hàng kèm tọa độ
  urlListShipper = this.domain + "/api/list-shipper"; // DS shipper
  urlListOrderOfShip = this.domain + "/long/api/list-order-of-shipper"; // DS đơn hàng shipper đã nhận
  urlListOrderFree = this.domain + "/long/api/list-order-free"; // DS đơn hàng chưa có người nhận
  urlListOrderSuccess = this.domain + "/long/api/list-order-success"; // DS đơn hàng đã giao thành công
  urlChangeOrderStatus = this.domain + "/long/api/change-order-status"; // API thay đổi trạng thái đơn hàng

  constructor() {}
}
