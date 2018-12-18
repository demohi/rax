// import { createElement, Component } from 'rax';
// import HeaderBar from './HeaderBar';
// import TabBar from './TabBar';
import Client, { createClient } from './Renderer';
import qs from 'querystring';
import resolvePathname from 'resolve-pathname';
import { warn } from '../debug';
import getAppConfig from './getAppConfig';

const ROUTE_HASH_PREFIX = '!/';
const ROUTE_HASH_REG = /^#?!\//;
const EXTERNAL_URL_REG = /^([\w\d]+:)\/\//;
const appConfig = getAppConfig();

export function setupUserInterface() {

}

export default class UIIDEContainer {
  static getInitialPageName(appConfig) {
    const hashRoute = location.hash.replace(ROUTE_HASH_REG, '');
    if (hashRoute !== '') {
      return hashRoute;
    }

    return Object.keys(appConfig.pages)[0];
  }

  constructor(appConfig) {
    const client = createClient(UIIDEContainer.getInitialPageName(appConfig));
    this.state = {
      currentPageName: client.pageName,
      currentClientId: client.clientId,
      routeStack: [client],
    };

    this.initialPageName = client.pageName;
  }

  push(pageName) {
    const { currentPageName } = this.state;
    if (isExternalURL(pageName)) {
      return location.href = pageName;
    }

    // Compatible with absolute page path.
    if (pageName[0] === '/') {
      pageName = pageName.slice(1);
    }

    // Compatible with relative page path.
    if (pageName[0] === '.') {
      pageName = resolvePathname(pageName, currentPageName);
    }

    // Change the url hash.
    location.hash = ROUTE_HASH_PREFIX + pageName;

    let pageQuery;
    if (/\?/.test(pageName)) {
      let queryString;
      [pageName, queryString] = pageName.split('?');
      pageQuery = qs.parse(queryString);
    }

    const client = createClient(pageName, pageQuery);
    // this.setState({
    //   routeStack: [...this.state.routeStack, client],
    //   currentClientId: client.clientId,
    //   currentPageName: client.pageName,
    // });
  }

  /**
   * Handle navigate from worker.
   */
  onRoute = (data) => {
    const { navigateTo, navigateType } = data;
    switch (navigateType) {
      case 'navigate':
        this.push(navigateTo);
        break;

      case 'redirect':
        this.redirect(navigateTo);
        break;

      case 'switchTab':
        this.switchTab(navigateTo);
        break;

      case 'navigateBack':
        this.navigateBack();
        break;

      default:
        warn('Unknown navigate type', data);
    }
  }

  /**
   * Navigate to another page.
   * @param pageName
   */
  changeCurrentPage = (pageName) => {
    // this.setState({ currentPageName: pageName });
  };

  /**
   * Navigate to perv page.
   */
  prev = () => {
    // todo: prev page
  };

  renderClients() {
    const { currentPageName, routeStack } = this.state;
    // return routeStack.map((client) => <Client
    //   {...client}
    //   key={client.clientId}
    //   active={currentPageName === client.pageName}
    // />);
  }

  render() {
    const { config } = this.props;
    const { currentPageName } = this.state;

    return [
      // <HeaderBar
      //   appWindow={config.window}
      //   onPrev={this.prev}
      //   showPrev={this.initialPageName !== currentPageName}
      // />,
      // <div id="main" style={styles.main} data-main>{this.renderClients()}</div>,
      // <TabBar
      //   tabBarList={config.tabBar.list}
      //   currentPageName={currentPageName}
      //   changeCurrentPage={this.changeCurrentPage}
      // />
    ];
  }
}

const styles = {
  main: {
    display: 'flex',
    position: 'absolute',
    top: 75,
    bottom: 97,
    left: 0,
    right: 0,
    margin: 0,
  },
};

function isExternalURL(str) {
  return EXTERNAL_URL_REG.test(str);
}
