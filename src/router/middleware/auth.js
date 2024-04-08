import access from "src/tools/access";
import { get } from "lodash";

export default function auth({
  next,
  store,
  to: {
    path,
    meta: { accessData },
  },
}) {
  let userAccess = get(store.getUser, "access");
  store.setToPath(path);
  if (!store.isUserAuth) {
    store
      .getUserModel()
      .then(() => {
        if (!userAccess) {
          userAccess = get(store.getUser, "access");
        }
        if (accessData && !access(userAccess, accessData)) {
          next({ name: "login" });
        } else {
          next();
        }
      })
      .catch(() => {
        next({ name: "login" });
      });
  } else {
    const accessFunc = access(userAccess, accessData);
    if (!accessFunc) {
      next(false);
    } else {
      next();
    }
  }
}
