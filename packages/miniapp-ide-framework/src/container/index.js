/**
 * In IDE, Worker impls as a web worker, renderer impls as an srcDoc iframe.
 * Each renderer is called as a client, which is instance of a miniapp page.
 *
 *             Worker
 *            /
 *       Container
 *      |        |
 * Renderer#1  Renderer#2 ...
 */
import spawnWorker from 'worker-loader?inline&fallback=false!babel-loader!../worker';
import { fatal } from "../debug";
import { createWorkerHandler } from './MessageHandler';
import { setupUserInterface } from './userInterface';
import { getAssets } from './getAppConfig';

/**
 * Spawn worker.
 */
export const rootWorker = spawnWorker();

/**
 * Send message from container to worker.
 * @param {String} type
 * @param {Object} payload
 * @param {Object} opts
 */
export function sendMessageToWorker(type, payload, opts = {}) {
  rootWorker.postMessage({
    origin: opts.origin || 'AppContainer',
    target: opts.target ||  'AppWorker',
    type,
    payload,
  });
}

/**
 * Setup container listener.
 */
rootWorker.addEventListener('message', createWorkerHandler(rootWorker));

const { webAsset, pluginAssets } = getAssets();
const urls = [];

if (!webAsset) {
  fatal('Web Asset URL Not Exists.');
  throw new Error('Can not load miniapp.');
}
urls.push(webAsset);
if (Array.isArray(pluginAssets)) {
  for (let i = 0, l = pluginAssets.length; i < l; i ++) {
    urls.unshift(pluginAssets[i]); // prepend url, load plugins before app.js
  }
}

/**
 * Tell worker to load urls by order.
 */
sendMessageToWorker('importScripts', { urls });
/**
 * Init UI
 */
setupUserInterface();

// TODO: @缇欧
// window.__update_page_data__ = (clientId, data) => {
//   workerHandle.postMessage({
//     type: 'updatePageData',
//     clientId,
//     data,
//   });
// };

