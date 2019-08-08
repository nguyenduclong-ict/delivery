import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ConfigService } from "./config.service";
import { Authv2Service } from "./authv2/authv2.service";
import { Storage } from "@ionic/storage";
import { MyLibrariesService } from "./my-libraries.service";
import { SwalService } from "./swal.service";

@Injectable({
  providedIn: "root"
})
export class ResApiService {
  constructor(
    private authv2: Authv2Service,
    private http: HttpClient,
    private storage: Storage,
    private mylib: MyLibrariesService,
    private swal: SwalService,
    private config : ConfigService
  ) {}

  async get(url, options?, cb?) {
    if (!options) options = await this.authv2.getHeader();
    console.log("GET ", url);
    return this.http.get(url, options).toPromise();
  }

  async getWithCache(url, options?, cb?, toast = false) {
    if (!options) options = await this.authv2.getHeader();
    let cached = await this.storage.get(
      "cache-" + this.authv2.appName + "-" + url
    );
    if (cb && cached) {
      let tmp = JSON.stringify(cached);
      tmp = JSON.parse(tmp);
      cb(tmp);
      return;
    }
    try {
      let data = await this.http.get(url, options).toPromise();
      // Kiểm tra xem data mới và cũ có thay đổi không ?
      let isUpdateCache = JSON.stringify(cached) !== JSON.stringify(data);
      console.log("get With cache " + url, {
        cached,
        data,
        updateCache: isUpdateCache
      });
      /* Nếu dữ liệu mới có sự thay đổi thì cập nhật lại cache */
      if (isUpdateCache) {
        console.log("Update cache for " + url, {
          oldData: cached,
          newData: data
        });
        await this.storage.set(
          "cache-" + this.authv2.appName + "-" + url,
          data
        );
        // Hiển thị thông báo đã cập nhật dữ liệu
        if (toast)
          this.swal.showToast({
            message: "Dữ liệu được cập nhật",
            position: "top-end"
          });
        if (cb) cb(data);
      }
    } catch (err) {
      if (!navigator.onLine && toast)
        this.swal.showToast({
          message: "Không có kết nối Internet!",
          position: "top-end"
        });
      console.log("GetWithCache" + url, err);
    }
  }

  async post(url, body, options?) {
    console.log("Post : ", url, body);
    if (!options) options = await this.authv2.getHeader();
    if (navigator.onLine == false) {
      this.mylib.presentAlert({
        message: "Không có kết nối internet, vui lòng thử lại sau"
      });
      throw "Network not avaliable";
    }
    return this.http.post(url, body, options).toPromise();
  }

  async put(url, body, options?) {
    if (!options) options = await this.authv2.getHeader();
    if (navigator.onLine == false) {
      this.mylib.presentAlert({
        message: "Không có kết nối internet, vui lòng thử lại sau"
      });
      throw "Network not avaliable";
    }
    return this.http.put(url, body, options).toPromise();
  }

  async postFile(
    file,
    filename = "file.jpeg",
    filepath = "public://mobile/file.jpeg",
    options?
  ) {
    if (!options) options = await this.authv2.getHeader();
    if (navigator.onLine == false) {
      this.mylib.presentAlert({
        message: "Không có kết nối internet, vui lòng thử lại sau"
      });
      throw "Network not avaliable";
    }
    let url = this.config.urlPostFile;
    let payload = {
      file: {
        filename,
        filepath,
        file
      }
    };
    return this.http.post(url, payload, options).toPromise();
  }
}
