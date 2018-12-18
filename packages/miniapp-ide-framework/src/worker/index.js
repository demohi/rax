/**
 * This file is run in a web worker environment.
 * Duty:
 *   1. register listeners, message from container.
 *   2. manage pages to render.
 */
import createDriver from 'driver-worker';
import global from '../global';
import { log, warn } from '../debug';
import { getPageByName } from './pageHub'
import { addClientListener, dispatchEventToClient } from './clientHub';
import { emitAppLifecycle, emitPageLifecycle } from './lifecycle';
import { createGlobalObject } from './globalObject';

const CONTAINER = 'AppContainer';
const CLIENT_REG = /^client/;

function isClientOrigin(origin) {
  return CLIENT_REG.test(origin);
}

/**
 * AppWorker, singleton.
 */
export default new class AppWorker {
  constructor() {
    /**
     * Listen message sent from container or client
     */
    addEventListener('message', this.messageHandler = this.createWorkerMessageHandler());

    const globalObjects = createGlobalObject();
    for (let key in globalObjects) {
      if (globalObjects.hasOwnProperty(key)) {
        global[key] = globalObjects[key];
      }
    }
  }

  createWorkerMessageHandler() {
    return function (evt) {
      const { data } = evt;
      if (data.origin === CONTAINER) {
        this.handleContainerMessage(data);
      } else if (isClientOrigin(data.origin)) {
        this.handleClientMessage(data);
      }
    }
  }

  /**
   * Handle message sent from container.
   * @param type
   * @param payload
   */
  handleContainerMessage({ type, payload }) {
    if (type === 'importScripts') { // Execute JavaScript from url.
      for (let i = 0, l = payload.urls.length; i < l; i ++) {
        importScripts(payload.urls[i]);
      }
      // WorkerReady means assets finish loading.
      this.sendMessageToContainer('workerReady');
    } else if (type === 'updatePageData') { // Update Page Data hook
      emitPageLifecycle('updatePageData', payload.clientId, payload.data);
    } else {
      warn('Unknown message from container to worker, type:', type, 'payload:', payload);
    }
  }

  /**
   * Handle message sent from one clinet.
   * @param type
   * @param payload
   */
  handleClientMessage({ type, payload }) {}

  /**
   * Send message from worker to container.
   * @param {String} type
   * @param {Object?} payload
   */
  sendMessageToContainer(type, payload) {
    postMessage({
      origin: 'AppWorker',
      target: 'AppContainer',
      type,
      payload,
    });
  }

  /**
   * Send message from worker to client.
   * @param {String} clientId
   * @param {String} type
   * @param {Object} payload
   */
  sendMessageToClient(clientId, type, payload) {
    postMessage({
      origin: 'AppWorker',
      target: clientId,
      type,
      payload,
    });
  }

  destroy() {
    removeEventListener('message', this.messageHandler);
  }
}

addEventListener('message', ({ data }) => {
  const { type, pageName, clientId } = data || {};
  switch (type) {
    case 'importScripts':
      importScripts(data.url);
      break;

    case 'init':
      // 初始化
      // domRender() 会触发一个 init,
      // 但是页面加载是异步的, 等待对应页面加载
      ready(() => {
        const rax = createRax();
        const { createElement, render } = rax;
        const { factory } = getPage(pageName, rax);

        const driver = createDriver({
          postMessage(message) {
            /**
             * w2r means
             *   worker2renderer
             */
            postMessage({
              type: 'w2r',
              pageName,
              clientId,
              data: message,
            });
          },
          addEventListener(evtName, callback) {
            clientOn(clientId, evtName, callback);
          },
        });

        let component;
        try {
          const { document, evaluator } = driver;
          component = applyFactory(factory, {
            clientId,
            pageName,
            rax,
            pageQuery: data.pageQuery,
            document,
            evaluator,
          });
        } catch (err) {
          console.error(err);
          component = applyFactory(
            getUnknownPageFactory(rax, {
              message: '加载出现了错误',
            })
          );
        }
        emitToClient(clientId, 'message', { data });
        // 页面加载时触发
        $emitPageLifecycle('load', clientId, data.pageQuery);
        render(createElement(component, {}), null, {
          driver,
        });

        // 初始化 ready 事件, after render
        $emitPageLifecycle('ready', clientId, {});
        self.__current_client_id__ = clientId;
      });

      break;

    case 'event':
    case 'return':
      emitToClient(clientId, 'message', { data });
      break;

    case 'callEnd':
      // ignore
      break;

    case 'app:lifecycle': {
      const { lifecycle } = data;
      $emitAppLifecycle(lifecycle, {});
      break;
    }
    case 'page:lifecycle': {
      const { clientId, lifecycle } = data;
      $emitPageLifecycle(lifecycle, clientId, {});
      if (lifecycle === 'show') {
        self.__current_client_id__ = clientId;
      }
      break;
    }

    case 'navigate': {
      postMessage({
        type: 'navigator',
        navigateType: data.navigateType,
        navigateTo: data.navigateTo,
      });
      break;
    }

  }
});
