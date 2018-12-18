import { log } from '../debug';

const Listeners = {};
const ClientHub = {};

export function addClient(clientId, client) {
  ClientHub[clientId] = client;
}

export function getClient(clientId) {
  return ClientHub[clientId];
}

/**
 * Add an event listener from client for worker.
 * @param {String} clientId
 * @param {String} evtName
 * @param {Function} callback
 */
export function addClientListener(clientId, evtName, callback) {
  if (!Listeners[clientId]) {
    Listeners[clientId] = {};
  }
  if (!Listeners[clientId][evtName]) {
    Listeners[clientId][evtName] = [];
  }

  Listeners[clientId][evtName].push(callback);
}

/**
 * Dispatch an event from worker to client.
 * @param {String} clientId
 * @param {String} evtName
 * @param {Object} payload
 */
export function dispatchEventToClient(clientId, evtName, payload) {
  log('Emit event to client', clientId, evtName, payload, Listeners[clientId]);
  if (!Listeners[clientId] || !Listeners[clientId][evtName]) {
    warn(`Emit an unregistered event, clientId: ${clientId}, evtName: ${evtName}`);
    return;
  }
  for (let i = 0, l = Listeners[clientId][evtName].length; i < l; i++) {
    Listeners[clientId][evtName][i](payload);
  }
}
