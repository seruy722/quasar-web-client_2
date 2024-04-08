import { boot } from "quasar/wrappers";
import axios from "axios";
import { getUrl } from "src/tools/url";
import { LocalStorage } from "quasar";
import { getLSKey } from "src/tools/lsKeys";
import { isEmpty } from "lodash";

const axiosInstance = axios.create(getUrl("axiosData"));
export default boot(({ app }) => {
  axiosInstance.interceptors.request.use((request) => {
    const token = LocalStorage.getItem(getLSKey("authToken"));
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }

    const locale = LocalStorage.getItem(getLSKey("lang"));
    if (!isEmpty(locale)) {
      request.headers.Locale = locale.value;
    }

    return request;
  });

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
  );

  app.config.globalProperties.$axios = axiosInstance;
});

export { axiosInstance };
