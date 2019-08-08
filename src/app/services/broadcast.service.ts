import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class BroadcastService {
  static chanels = [];

  constructor() {}
  /**
   *  @param {String} chanel Tên chanel
   *  @param {Object} message {type : String, data : any}
   */
  pushMessage = (chanel, { action, data }: any) => {
    let index = BroadcastService.chanels.findIndex(e => e.name === chanel);
    if (index >= 0)
      BroadcastService.chanels[index].callbacks.forEach(callback =>
        callback({ action, data })
      );
  };

  // Register chanel
  registerChanel = name => {
    let index = BroadcastService.chanels.findIndex(e => e.name === name);
    if (index >= 0) return index;
    BroadcastService.chanels.push({ name, callbacks: [] });
    return BroadcastService.chanels.length - 1;
  };

  /**
   * @param callback ({action : string, data :any }) => {}
   */
  subscribe = (chanel, callback) => {
    let index = this.registerChanel(chanel);
    BroadcastService.chanels[index].callbacks.push(callback);
  };
}
