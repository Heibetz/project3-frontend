import axios from "axios";
import Utils from "../config/utils.js";
import AuthServices from "./authServices.js";
import Router from "../router.js";

// NOTE: backend runs on port 3125 in this project (server.js). Ensure dev API calls
// target that port so requests reach the Node backend instead of the default HTTP
// server on port 80. If your backend uses a different port, update here or set
// an environment variable.
var baseurl = "";
if (import.meta.env.DEV) {
  baseurl = "http://localhost:/tracker-t5/";
} else {
  baseurl = "/tracker-t5/";
}

const apiClient = axios.create({
  baseURL: baseurl,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  transformRequest: (data, headers) => {
    let user = Utils.getStore("user");
    if (user != null) {
      let token = user.token;
      let authHeader = "";
      if (token != null && token != "") authHeader = "Bearer " + token;
      headers["Authorization"] = authHeader;
    }
    return JSON.stringify(data);
  },
  transformResponse: function (data) {
    data = JSON.parse(data);
    // if (!data.success && data.code == "expired-session") {
    //   localStorage.deleteItem("user");
    // }
    if (data.message !== undefined && data.message.includes("Unauthorized")) {
      AuthServices.logoutUser(Utils.getStore("user"))
        .then((response) => {
          console.log(response);
          Utils.removeItem("user");
          Router.push({ name: "login" });
        })
        .catch((error) => {
          console.log("error", error);
        });
      // Utils.removeItem("user")
    }
    // console.log(Utils.getStore("user"))
    return data;
  },
});

export default apiClient;
