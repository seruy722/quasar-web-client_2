import { cloneDeep } from "lodash";
export const getTransfersClient = (state) => state.transfersClient;
export const getTransfers = (state) => cloneDeep(state.transfers);
