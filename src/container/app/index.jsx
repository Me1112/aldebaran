/* eslint-disable spaced-comment */
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Route, Switch, Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { Menu, notification } from "antd";
import { Map } from "immutable";
import { routeList } from "../../router/index";
import "../../public/css/iconfont.css";
import "./index.less";
import NoMatch from "../../view/no_match";
import {
  getUserInfo,
  getUserName,
  logout,
  getUserMenu,
  getUserPermissions,
  isEmpty,
  isLeakageReportUser
} from "../../util";
import { clearErrorMessage } from "../../action/common";
import { getDecisionList } from "../../action/decision";
import { getParamsWarningConfig } from "../../action/policy";
import {
  setUserPermissions,
  getNotifyInfo,
  changeNotifyInfo,
  changeNotifyFrequency
} from "../../action";
import HeadDropdown from "../../component/head";

const { SubMenu } = Menu;
const IS_HIDDEN = isLeakageReportUser();
// 约定：
// 如果路由以此数组中的路由为开头，在菜单中就聚集到此路由，
// 例如： /policy/bazaar/collection/new, /policy/bazaar/collection/diff 都会匹配到/policy/bazaar/collection中
const NotMenuRouter = [
  "/policy/bazaar/collection",
  "/policy/bazaar/list",
  "/policy/bazaar/strategy",
  "/policy/bazaar/strategy-flow",
  "/policy/params",
  "/leakage/rule/management",
  "/leakage/execution/monitoring"
];
// const MenuListObj = {
//   system: [
//     {
//       title: '部门管理',
//       icon: 'anticon-team',
//       url: '/system/department'
//     },
//     {
//       title: '应用管理',
//       icon: 'anticon-book',
//       url: '/system/access'
//     },
//     {
//       title: '场景管理',
//       icon: 'anticon-appstore',
//       url: '/system/scene'
//     }, {
//       title: '用户管理',
//       icon: 'anticon-team',
//       url: '/system/user'
//     }, {
//       title: '日志管理',
//       icon: 'anticon-file-exception',
//       url: '/system/operation'
//     }, {
//       title: '菜单管理',
//       icon: 'anticon-layout',
//       url: '/system/module'
//     }
//   ],
//   risk: [
//     {
//       title: '风险大盘',
//       icon: 'anticon-monitor',
//       url: '/risk/market',
//       children: [
//         {
//           title: '事件趋势',
//           icon: '',
//           url: '/risk/market/event-trend'
//         }, {
//           title: '应用分布',
//           icon: '',
//           url: '/risk/market/app-distribution'
//         }, {
//           title: '风险趋势',
//           icon: '',
//           url: '/risk/market/risk-trend'
//         }, {
//           title: '规则分析',
//           icon: '',
//           url: '/risk/market/rule'
//         }, {
//           title: '区域分布',
//           icon: '',
//           url: '/risk/market/area'
//         }, {
//           title: '审核分布',
//           icon: '',
//           url: '/risk/market/audit'
//         }]
//     },
//     {
//       title: '事件监控',
//       icon: 'anticon-eye',
//       url: '/risk/event',
//       children: [{
//         title: '事件信息',
//         icon: '',
//         url: '/risk/event/list'
//       }, {
//         title: '名单管理',
//         icon: '',
//         url: '/risk/event/black/list'
//       }]
//     }, {
//       title: '任务中心',
//       icon: 'anticon-control',
//       url: '/risk/task',
//       children: [{
//         title: '策略审批',
//         icon: '',
//         url: '/risk/task/verification'
//       }, {
//         title: '事件核查',
//         icon: '',
//         url: '/risk/task/inspect'
//       }, {
//         title: '案件审核',
//         icon: '',
//         url: '/risk/task/audit'
//       }]
//     }, {
//       title: '案件中心',
//       icon: 'anticon-snippets',
//       url: '/risk/case',
//       children: [{
//         title: '案件申请',
//         icon: '',
//         url: '/risk/case/request'
//       }, {
//         title: '审核进度',
//         icon: '',
//         url: '/risk/case/progress'
//       }, {
//         title: '归档案件',
//         icon: '',
//         url: '/risk/case/archive'
//       }]
//     }, {
//       title: '知识图谱',
//       icon: 'anticon-alert',
//       url: '/risk/graph',
//       redirect: 'http://10.72.100.35/g',
//       iframe: true
//     }
//   ],
//   policy: [
//     {
//       title: '外部接入',
//       icon: 'anticon-link',
//       url: '/policy/joinup',
//       children: [{
//         title: '接入配置',
//         icon: '',
//         url: '/policy/joinup/config'
//       }, {
//         title: '测试数据',
//         icon: '',
//         url: '/policy/joinup/testing'
//       }]
//     },
//     {
//       title: '策略集市',
//       icon: 'anticon-shop',
//       url: '/policy/bazaar',
//       children: [{
//         title: '规则集',
//         icon: '',
//         url: '/policy/bazaar/collection'
//       }, {
//         title: '评分卡',
//         icon: '',
//         url: '/policy/bazaar/list'
//       }, {
//         title: '决策树',
//         icon: '',
//         url: '/policy/bazaar/strategy'
//       }, {
//         title: '决策流',
//         icon: '',
//         url: '/policy/bazaar/strategy-flow'
//       }]
//     }, {
//       title: '指标管理',
//       icon: 'anticon-control',
//       url: '/policy/index/indicators'
//     }, {
//       title: '基础字段',
//       icon: 'anticon-byte',
//       url: '/policy/basis/field'
//     }, {
//       title: '策略参数',
//       icon: 'anticon-sliders',
//       url: '/policy/params'
//     }
//   ]
// }

class App extends Component {
  state = {
    rootSubmenuKeys: [
      "rule",
      "event",
      "report",
      "black",
      "scorecard",
      "system"
    ],
    openKeys: [],
    MenuListObj: {}
  };

  static propTypes = {
    location: PropTypes.object,
    history: PropTypes.object.isRequired,
    error: PropTypes.any,
    clearErrorMessage: PropTypes.func.isRequired,
    setUserPermissions: PropTypes.func.isRequired,
    userPermissions: PropTypes.object,
    getDecisionList: PropTypes.func.isRequired,
    notifyFrequency: PropTypes.string,
    changeNotifyInfo: PropTypes.func.isRequired,
    changeNotifyFrequency: PropTypes.func.isRequired
  };

  componentDidMount() {
    this.props.getDecisionList();
    this.setOpenKeys(this.props);
    this.handleUserMenuSrcToMenuArr(this.userMenuSrc);
    this.handleUserPermissions();

    !IS_HIDDEN &&
      getParamsWarningConfig()
        .then(res => {
          // 获取平台配置信息
          const { content: notifyConfigList = [] } = res;
          const { notifyFrequency = "EVERY_TEN_MIN" } =
            notifyConfigList.find(
              notifyConfig => notifyConfig.notifyType === "PLATFORM"
            ) || {};
          this.props.changeNotifyFrequency({
            notifyFrequency
          });
          const latestNotifyTime = window.localStorage.getItem(
            "latestNotifyTime"
          );
          if (!latestNotifyTime) {
            this.initGetNotifyInfo(notifyFrequency);
          } else {
            clearInterval(this.notifyInterval);
            const NOTIFY_INTERVAL =
              notifyFrequency === "EVERY_TEN_MIN"
                ? 1000 * 60 * 10
                : 1000 * 60 * 60;
            if (notifyFrequency === "EVERY_TEN_MIN") {
              setTimeout(
                this.getNotifyInfo,
                NOTIFY_INTERVAL - (new Date().getTime() - latestNotifyTime)
              );
              this.notifyInterval = setInterval(
                this.getNotifyInfo,
                NOTIFY_INTERVAL
              );
            } else {
              const date = new Date(Number(latestNotifyTime));
              setTimeout(
                this.getNotifyInfo,
                1000 * (60 * 60 - (date.getMinutes() * 60 + date.getSeconds()))
              );
              this.notifyInterval = setInterval(
                this.getNotifyInfo,
                NOTIFY_INTERVAL
              );
            }
          }
        })
        .catch(data => {
          const { content = {} } = data;
          notification.warning(content);
        });
  }

  componentWillMount() {
    const { location } = this.props;
    const { pathname = "" } = location;
    const name = getUserName();
    this.userMenuSrc = getUserMenu() || [];
    if (name.length === 0) {
      logout();
    } else if (pathname === "/") {
      this.handleMenu(this.userMenuSrc);
      this.props.history.push(this.targetUrl);
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setOpenKeys(nextProps);
    const { notifyFrequency } = this.props;
    if (notifyFrequency !== nextProps.notifyFrequency) {
      console.log("notifyFrequency改变为:", nextProps.notifyFrequency);
      this.initGetNotifyInfo(nextProps.notifyFrequency);
    }
  }

  componentDidUpdate() {
    const { error } = this.props;
    if (error) {
      this.props.clearErrorMessage();
      notification.warning(error);
    }
    const iframe = document.getElementById("_iframe");
    if (iframe) {
      iframe.onload = function() {
        console.log("====", getUserInfo());
        iframe.contentWindow.postMessage(getUserInfo(), "*");
      };
    }
  }

  render() {
    const name = getUserName();
    if (name.length === 0) {
      logout();
      return null;
    }
    let {
      openKeys,
      levelOneMenuKey = "leakage",
      iframe,
      url,
      menuListObj = {}
    } = this.state;
    const { state = {}, pathname } = this.props.location;
    const leftMenus = menuListObj[levelOneMenuKey] || [];
    console.log("render menuListObj", menuListObj);
    console.log("render routeList", routeList);
    let { defaultSelectedKeys } = state;
    if (!defaultSelectedKeys) {
      const { pathRouterItemKey } = getMenusKeys(pathname);
      defaultSelectedKeys = [pathRouterItemKey];
      const NotMenuRouter = this.getNotMenuRouter(pathname);
      console.log("NotMenuRouter", NotMenuRouter);
      if (NotMenuRouter) {
        defaultSelectedKeys = [NotMenuRouter];
      }
    }
    console.log("openKeys", openKeys, this.props);
    return (
      <div className="cci-layout">
        <div className="cci-layout-head">
          <div className="logo-bg">
            <div className="logo" />
          </div>
          {!IS_HIDDEN && (
            <div className="menu-inline">
              <div
                className={`menu-inline-item ${
                  levelOneMenuKey === "leakage" ? "active" : ""
                }`}
                onClick={() => this.switchMenu("leakage")}
              >
                {/* <i className="anticon anticon-shield" /> */}
                Metkayina®智能化风控决策引擎平台
              </div>
              {/* <div className={`menu-inline-item ${levelOneMenuKey === 'policy' ? 'active' : ''}`}
                   onClick={() => this.switchMenu('policy')}>
                <i className="anticon anticon-dashboard" />
                策略配置
              </div>
              <div className={`menu-inline-item ${levelOneMenuKey === 'risk' ? 'active' : ''}`}
                   onClick={() => this.switchMenu('risk')}>
                <i className="anticon anticon-attachment" />
                风险分析
              </div>
              <div className={`menu-inline-item ${levelOneMenuKey === 'system' ? 'active' : ''}`}
                   onClick={() => this.switchMenu('system')}>
                <i className="anticon anticon-setting" />
                系统管理
              </div> */}
            </div>
          )}
          <HeadDropdown />
        </div>
        <div
          className="cci-layout-sider"
          style={{ width: IS_HIDDEN ? 0 : 200 }}
        >
          <Menu
            theme="light"
            mode="inline"
            inlineCollapsed={false}
            defaultOpenKeys={openKeys}
            openKeys={openKeys}
            onOpenChange={this.onOpenChange}
            defaultSelectedKeys={defaultSelectedKeys}
            selectedKeys={defaultSelectedKeys}
          >
            {leftMenus.map(item => {
              const {
                privilegeName: title,
                icon,
                url,
                children,
                iframe = false,
                redirect
              } = item;
              return !children ? (
                <Menu.Item key={url}>
                  <Link
                    to={{ pathname: url, state: { iframe, url: redirect } }}
                  >
                    {icon ? <i className={`anticon ${icon}`} /> : null}
                    <span className={"menu-title"}>{title}</span>
                  </Link>
                </Menu.Item>
              ) : (
                <SubMenu
                  key={url}
                  title={
                    <span>
                      {icon ? <i className={`anticon ${icon}`} /> : null}
                      <span>{title}</span>
                    </span>
                  }
                >
                  {children.map(child => {
                    const {
                      privilegeName: title,
                      icon,
                      url,
                      iframe = false,
                      redirect
                    } = child;
                    return (
                      <Menu.Item key={url}>
                        <Link
                          to={{
                            pathname: url,
                            state: { iframe, url: redirect }
                          }}
                        >
                          {icon ? <i className={`anticon ${icon}`} /> : null}
                          <span>{title}</span>
                        </Link>
                      </Menu.Item>
                    );
                  })}
                </SubMenu>
              );
            })}
          </Menu>
        </div>
        <div
          className="cci-layout-right"
          style={{ marginLeft: IS_HIDDEN ? 0 : 200 }}
        >
          {iframe ? (
            <iframe id="_iframe" src={`${url}?iframe=true`} />
          ) : (
            <Switch>
              {routeList}
              <Route component={NoMatch} />
            </Switch>
          )}
        </div>
      </div>
    );
  }

  initGetNotifyInfo = notifyFrequency => {
    const NOTIFY_INTERVAL =
      notifyFrequency === "EVERY_TEN_MIN" ? 1000 * 60 * 10 : 1000 * 60 * 60;
    clearInterval(this.notifyInterval);
    this.getNotifyInfo();
    if (notifyFrequency === "EVERY_TEN_MIN") {
      this.notifyInterval = setInterval(this.getNotifyInfo, NOTIFY_INTERVAL);
    } else {
      const date = new Date();
      setTimeout(() => {
        this.getNotifyInfo();
        this.notifyInterval = setInterval(this.getNotifyInfo, NOTIFY_INTERVAL);
      }, 1000 * (60 * 60 - (date.getMinutes() * 60 + date.getSeconds())));
    }
  };

  getNotifyInfo = () => {
    getNotifyInfo()
      .then(res => {
        const { content: notifyInfo = {} } = res;
        this.props.changeNotifyInfo({
          notifyInfo
        });
        window.localStorage.setItem(
          "latestNotifyTime",
          new Date().getTime().toString()
        );
      })
      .catch(data => {
        const { content = {} } = data;
        notification.warning(content);
      });
  };

  // 将权限存到rendex中，
  handleUserPermissions = () => {
    const { userPermissions } = this.props;
    if (isEmpty(userPermissions)) {
      this.props.setUserPermissions(getUserPermissions());
    }
  };

  handleUserMenuSrcToMenuArr = userMenu => {
    const { menuListObj = {} } = this.state;
    userMenu.forEach(item => {
      const { url, children } = item;
      if (!menuListObj[url]) {
        menuListObj[url] = [];
      }
      menuListObj[url] = children;
      this.setState({ menuListObj });
      console.log("menuListObj", menuListObj);
    });
  };

  handleMenu = children => {
    children.forEach(item => {
      const { children = [], url = "", type } = item;
      if (children.length > 0) {
        this.handleMenu(children);
      } else {
        if (type !== "ACTION" && !this.targetUrl) {
          this.targetUrl = url;
        }
      }
    });
  };

  getNotMenuRouter = pathname => {
    const pathRouter = pathname.split("/");
    pathRouter.splice(0, 1);
    // const keys = Object.keys(NotMenuRouter)
    for (let i = 0; i < pathRouter.length; i++) {
      // const keepPath = [...pathRouter]
      const path = `/${pathRouter.join("/")}`;
      if (NotMenuRouter.indexOf(path) > -1) {
        return path;
      }
      pathRouter.splice(pathRouter.length - 1, 1);
    }
  };

  switchMenu = key => {
    this.setState({ levelOneMenuKey: key });
  };

  //依据传入的值（props）进行修改openKeys
  setOpenKeys = data => {
    const { state = {}, pathname } = data.location;
    const { pathRouterMenuKey, pathRouterOpenKey } = getMenusKeys(pathname);
    let {
      openKeys = [pathRouterOpenKey],
      levelOneMenuKey = pathRouterMenuKey,
      iframe,
      url
    } = state;
    this.setState({
      openKeys,
      levelOneMenuKey,
      iframe,
      url
    });
  };

  onOpenChange = openKeys => {
    let openKey = [];
    if (openKeys.length > 0) {
      const keys = openKeys[openKeys.length - 1].split("/");
      openKey = [`/${keys[1]}/${keys[2]}`];
    }
    this.setState({
      openKeys: openKey
    });
  };
  logout = () => {
    logout();
    return false;
  };
}

//获取菜单key，依据pathname
function getMenusKeys(pathname) {
  const pathRouter = pathname.split("/");
  const pathRouterMenuKey = pathRouter[1];
  const pathRouterItemKey = pathname;
  const pathRouterOpenKey = `/${pathRouterMenuKey}/${pathRouter[2]}`;
  return {
    pathRouterItemKey,
    pathRouterMenuKey,
    pathRouterOpenKey
  };
}

function mapStateToProps(state) {
  const {
    black = Map({}),
    common = Map({}),
    event = Map({}),
    report = Map({}),
    rule = Map({}),
    score = Map({}),
    system = Map({}),
    decision = Map({})
  } = state;
  const { error: blackError } = black.toJS();
  const {
    error: commonError,
    userPermissions = {},
    notifyFrequency
  } = common.toJS();
  const { error: eventError } = event.toJS();
  const { error: reportError } = report.toJS();
  const { error: ruleError } = rule.toJS();
  const { error: scoreError } = score.toJS();
  const { error: systemError } = system.toJS();
  const { error: decisionError } = decision.toJS();
  return {
    notifyFrequency,
    userPermissions,
    error:
      blackError ||
      commonError ||
      eventError ||
      reportError ||
      ruleError ||
      scoreError ||
      systemError ||
      decisionError
  };
}

function mapDispatchToProps(dispatch) {
  return {
    clearErrorMessage: bindActionCreators(clearErrorMessage, dispatch),
    setUserPermissions: bindActionCreators(setUserPermissions, dispatch),
    getDecisionList: bindActionCreators(getDecisionList, dispatch),
    changeNotifyInfo: bindActionCreators(changeNotifyInfo, dispatch),
    changeNotifyFrequency: bindActionCreators(changeNotifyFrequency, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(App));
