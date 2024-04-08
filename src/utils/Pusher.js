import Pusher from "pusher-js";
import { onMounted, onUnmounted } from "vue";

export default function PusherFunc(store) {
  let channel = null;

  onMounted(() => {
    const pusher = new Pusher("47b7c9db3b44606e887f", {
      cluster: "eu",
    });

    channel = pusher.subscribe("transfer");
    channel.bind("Transfers", ({ transferData: { type, transfer } }) => {
      if (type === "store") {
        store.addTransfer(transfer);
      } else {
        store.updateTransfer(transfer);
      }
    });
  });

  onUnmounted(() => {
    channel.unbind("Transfers");
    store.setTransfers([]);
  });
}
