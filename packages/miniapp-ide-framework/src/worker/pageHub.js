/**
 * Page Manager
 */
import { log, fatal } from '../debug';

/**
 * [PageName]: {
 *   factory: Fn.
 * }
 */
const PageHub = {};

/**
 * Get page by page name.
 * @param {String} pageName
 * @return {Object} page
 */
export function getPageByName(pageName) {
  if (!PageHub[pageName]) {
    fatal('Getting unknown page', pageName);
  }
  return PageHub[pageName] || null;
}

/**
 * Register a page.
 * @param {Object} descriptor
 * @param {Function} factory
 */
export function registerPage(descriptor, factory) {
  const { page: pageName } = descriptor;
  log('Register page', pageName);
  PageHub[pageName] = {
    ...descriptor,
    factory,
  };
}
