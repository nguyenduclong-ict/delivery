import { Injectable } from "@angular/core";
import { ConfigService } from "../config.service";
import { HttpClient } from "@angular/common/http";
import { ChanelService } from "../chanel.service";
import { BroadcastService } from "../broadcast.service";
import { Storage } from "@ionic/storage";
import { MyLibrariesService } from "../my-libraries.service";

@Injectable({
  providedIn: "root"
})
export class Authv2Service {
  appName;
  tokenUrl = this.config.domain + "/api/user/token.json";
  loginUrl = this.config.domain + "/api/user/login.json";
  logoutUrl = this.config.domain + "/api/user/logout.json";
  signupUrl = this.config.domain + "/api/user/register.json";
  token;
  cookie;

  constructor(
    private config: ConfigService,
    private http: HttpClient,
    private storage: Storage,
    private chanel: ChanelService,
    private broadcast: BroadcastService,
    private mylibs: MyLibrariesService
  ) {
    this.appName = this.config.appName;
    // this.initialize();
  }

  async initialize() {
    await this.getToken();
    await this.getCookie();
    console.log("Cookie", this.cookie);
    console.log("X-CSRF-Token", this.token);
  }

  async getAppVersion() {
    let version = await this.storage.get(this.appName + "_version");
    return version;
  }

  async setAppVersion(version) {
    this.storage.set(this.appName + "_version", version);
  }
  /**
   * get CSRF token
   */
  async getToken() {
    let token = await this.storage.get(this.appName + "_token");
    if (!token) {
      // Lay token moi tu server
      let data: any = await this.http.post(this.tokenUrl, {}).toPromise();
      if (data) {
        this.token = data.token;
        this.storage.set(this.appName + "_token", this.token);
      }
    } else this.token = token;
    return this.token;
  }

  /**
   * Signup new Account - return {ok : true/false , ?err}
   * @param name
   * @param mail
   * @param pass
   */
  async signup(name, mail, pass) {
    let data = {
      field_user_real_name: {
        und: {
          0: {
            value: name
          }
        }
      },
      pass,
      mail
    };
    console.log(data);
    return this.http.post(this.signupUrl, data, {}).toPromise();
  }

  /**
   * return cookie or null
   */
  async getCookie() {
    if (this.cookie) return this.cookie;
    // neu khong co cookie
    this.cookie = await this.storage.get(this.appName + "_cookie");
    return this.cookie;
  }

  /**
   * return <Promise> true or false
   */
  async checkLogin() {
    if (this.cookie) return true;
    else return false;
  }

  /**
   * return cookie or null if login fail
   * @param username
   * @param password
   */
  async loginWithUsername(username, password) {
    if (!navigator.onLine) {
      this.mylibs.presentAlert({
        message: "Bạn không có kết nối Internet, thử lại sau!"
      });
      return null;
    }
    var option = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    };
    console.log({ username, password });

    return new Promise((resolve, reject) => {
      this.http
        .post(this.loginUrl, { username, password }, option)
        .toPromise()
        .then((res: any) => {
          // Login Success
          console.log("Login Success", res);
          this.token = res.token;
          this.cookie = res.session_name + "=" + res.sessid;
          // Save Login infomation
          this.storage.set(this.appName + "_token", res.token);
          this.storage.set(this.appName + "_cookie", this.cookie);
          this.storage.set(this.appName + "_user", res.user);
          resolve(this.cookie);
        })
        .catch(error => reject(error));
    });
  }

  // Lấy thông tin user đã đăng nhập
  async getUserInfo() {
    let userInfo;
    userInfo = await this.storage.get(this.appName + "_user");
    if (!userInfo) userInfo = {};
    console.log(userInfo);
    try {
      userInfo.field_user_picture["und"][0].src =
        this.config.domain +
        "/sites/nsx.nguoilamnong.vn/files/" +
        userInfo.field_user_picture.und[0].filename;
    } catch {
      userInfo.field_user_picture["und"][0].src =
        "/assets/img/default-avatar.png";
    }
    return userInfo;
  }

  // Get Header
  async getHeader() {
    if (!this.cookie || !this.token) await this.initialize();
    return {
      headers: {
        "X-CSRF-Token": this.token,
        "Content-Type": "application/json",
        Accept: "application/json",
        Authentication: this.cookie
      }
    };
  }

  /**
   * return 'true' if success
   * or 'false' if fail
   */
  async logout() {
    this.cookie = null;
    this.token = null;
    return new Promise(async (resolve, reject) => {
      try {
        await this.storage.remove(this.appName + "_cookie");
        await this.storage.remove(this.appName + "_token");
        await this.storage.remove(this.appName + "_user");
        this.storage.forEach((value, key) => {
          if (key.indexOf("cache-" + this.appName + "-") == 0)
            this.storage.remove(key);
        });

        // Dang xuat thanh cong
        console.log("Dang xuat thanh cong");
        this.broadcast.pushMessage(this.chanel.LOGIN_CHANEL, {
          action : "logout",
          data: ""
        });
        resolve(true);
      } catch (err) {
        console.log("Dang xuat that bai ", err);
        resolve(false);
      }
    });
  }
}
