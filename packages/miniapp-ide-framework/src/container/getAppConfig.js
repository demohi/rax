/**
 * Get the app config from container environment (window).
 * To compatible with old version of builder,
 * first read from APP_MANIFEST; Standard env variable
 * is from __MINIAPP_CONFIG__;
 */
import global from '../global';

const hasOwn = {}.hasOwnProperty;
const COMPATIBLE_APP_CONFIG_KEY = 'APP_MANIFEST';
const APP_CONFIG_KEY = '__MINIAPP_CONFIG__';
const WEB_ASSET_KEY = 'h5Assets';
const PLUGIN_ASSET_KEY = 'pluginAssets';

/**
 * Get appConfig.
 */
export default function getAppConfig(scope = global) {
  if (hasOwn.call(scope, COMPATIBLE_APP_CONFIG_KEY)) {
    return scope[COMPATIBLE_APP_CONFIG_KEY];
  } else if (hasOwn.call(scope, APP_CONFIG_KEY)) {
    return scope[APP_CONFIG_KEY];
  } else {
    throw new Error('页面信息未正确加载.');
  }
}

/**
 * Get url assets.
 * @return {{webAsset: String, pluginAssets: Array<String>}}
 */
export function getAssets() {
  const appConfig = getAppConfig();
  return {
    webAsset: appConfig[WEB_ASSET_KEY],
    pluginAssets: appConfig[PLUGIN_ASSET_KEY],
  };
}
