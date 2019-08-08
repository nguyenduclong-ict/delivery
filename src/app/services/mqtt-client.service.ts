import { Injectable } from "@angular/core";
import { MqttService } from "ngx-mqtt";
import { BroadcastService } from "./broadcast.service";
import { ChanelService } from "./chanel.service";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { GlobalVariablesService } from "./global-variables.service";

@Injectable({
  providedIn: "root"
})
export class MqttClientService {
  location: any = { lat: null, lng: null };
  interval;
  constructor(
    private geolocation: Geolocation,
    private globalVariables: GlobalVariablesService,
    private _mqttService: MqttService
  ) {}

  // start loop send location to server each 5 seconds
  startMqttOnline() {
    this.interval = setInterval(this.sendLocationToServer.bind(this), 5000);
  }

  // stop send location to server
  stopMqttOnline() {
    clearInterval(this.interval);
  }

  sendLocationToServer = async function() {
    let shipperNid = await this.globalVariables.getShipperNid();
    if (!shipperNid) return; // Nếu không có shipper nào được chọn thì không cần gửi

    // Gửi vị trí lên server MQTT
    let response: any = await this.geolocation.getCurrentPosition();
    this.location.lat = response.coords.latitude;
    this.location.lng = response.coords.longitude;

    let data: any = {
      shipperNid: shipperNid,
      location: this.location
    };

    let option: any = { qos: 2, retain: false };
    this._mqttService.unsafePublish("/delivery", JSON.stringify(data), option);
  };

  // Push notification shipper order-change
  mqttShipperChangeOrder(shipperNid) {
    let option: any = { qos: 2, retain: false };
    let data = { id: shipperNid };
    let topic = "/order-change";
    this._mqttService.unsafePublish(topic, JSON.stringify(data), option);
  }
}
