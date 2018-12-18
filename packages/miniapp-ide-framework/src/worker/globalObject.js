import global from '../global';
import getModule from './getModule';

// todo: api
const my = { todo: 'my' };
const CURRENT_CLIENT_ID = '__current_client_id__';
const windmillEnv = {};
const runtimeAPI = {
  $getCurrentActivePageId() {
    return global[CURRENT_CLIENT_ID];
  },
  $on(eventName, callback) {
    addEventListener(eventName, callback);
  },
  $emit(eventName, payload, clientId) {
    postMessage({
      type: eventName,
      data: payload,
      clientId
    });
  }
};

export function createGlobalObject() {
  return {
    require: getModule,
    my,

    __file_schema_prefix__: '',
    __windmill_environment__: windmillEnv,
    __WINDMILL_WORKER_RUNTIME_APIS__: runtimeAPI,
  };
}
