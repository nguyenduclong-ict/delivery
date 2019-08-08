import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class SwalService {
  w: any = window;
  Swal = this.w.Swal;

  constructor() {}

  showAlert({ title = "", text = "", type = "", timer = 3000 }) {
    this.Swal.fire({
      title: title,
      text: text,
      type: type,
      timer: timer
    });
  }

  /**
   *
   * @param position 'top', 'top-start', 'top-end', 'center', 'center-start', 'center-end', 'bottom', 'bottom-start', or 'bottom-end'.
   * @param type  'warning', error, success, info, and question
   *
   **/
  showToast({ message, type = "", timer = 3000, position = "bottom" }) {
    const Toast = this.Swal.mixin({
      toast: true,
      position: position,
      showConfirmButton: false,
      background: "#eee",
      timer: timer
    });

    Toast.fire({
      type: type,
      text: message
    });
  }
}
