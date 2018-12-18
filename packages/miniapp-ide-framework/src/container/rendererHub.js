const RendererHub = {};

export function sendMessageToRenderer(clientId, payload) {
  const rendererHandle = getRenderer(clientId);
  if (rendererHandle) {
    rendererHandle.onmessage.call(this, payload);
  }
}

export function getRenderer(clientId) {
  return RendererHub[clientId];
}

export function setupRenderer(clientId, renderer) {
  RendererHub[clientId] = renderer;
}
