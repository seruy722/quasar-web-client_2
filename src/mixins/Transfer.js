import getFromSettings from "src/tools/settings";
import { get, find } from "lodash";

export default {
  methods: {
    statusColor(value) {
      const findLabel =
        find(getFromSettings("transferStatus"), { value }) ||
        find(getFromSettings("transferStatus"), { label: value });
      return get(findLabel, "color");
    },
  },
};
