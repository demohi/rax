import { log, warn } from '../debug';
import { sendMessageToWorker } from './';
import { onRoute } from './routes';
import { sendMessageToRenderer } from './rendererHub';

class MessageHandler {
  /**
   * Navigate message.
   * @param messageChanel
   * @param data
   */
  navigator(messageChanel, data) {
    this.appShell.onRoute(data);
  }

  console(messageChanel, data) {
    messageChanel.onConsole(data);
  }

  call(messageChanel, data) {
    const { module, method, params, callId } = data;
    // TODO: api
    console.error('TODO API CALL');
  }

  r$() {
    this.appShell = renderShell();
  }

  defaultHandler(messageChanel, data) {
    if (data.type) {
      const [type, clientId] = data.type.split('@');
      messageChanel.onModuleAPIEvent({ ...data, type });
    }
  }

  /**
   * Receive message from anywhere (worker or renderer)
   * @param evt
   */
  apply = (evt) => {
    const { data } = evt;
    if (data.target === 'AppContainer') {
      // todo ???
    } else if (data.target === 'AppWorker') {
      sendMessageToWorker(data.type, data.payload, { origin: data.origin });
    } else if (isClientOrigin(data.origin)) {
      sendMessageToRenderer(data);
    }
  }
}

export function createWorkerHandler(workerHandle) {
  const handler = new MessageHandler(workerHandle);
  return handler.apply;
}

const CLIENT_REG = /^client/;
function isClientOrigin(origin) {
  return CLIENT_REG.test(origin);
}
