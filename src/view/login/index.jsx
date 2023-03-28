import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Row, Col, Input, Checkbox, Button, Icon } from "antd";
import "./index.less";
import { login } from "../../action";
import { SUCCESS } from "../../common/constant";
import {
  setUserInfo,
  setUserMenu,
  setUserPermissions,
  clear
} from "../../util";
import { APP_NAME } from "../../common/app";
import logoPng from '../../public/img/logo.png';
class Login extends Component {
  state = {
    name: "",
    password: "",
    notice: "",
    checked: true,
    loading: false
  };

  static propTypes = {
    history: PropTypes.object.isRequired,
    login: PropTypes.func.isRequired
  };

  componentDidMount() {
    (this.username.refs.input || this.username).focus();
    clear();
  }

  render() {
    const { loading, checked, notice } = this.state;
    return (
      <div className="bunddata-login">
        <p className="login_title">
          <img src={logoPng} />
        </p>
        <Row>
          <Col className="login-container">
            <div className="login-title">
              <span>{APP_NAME}</span>
            </div>
            <div className="login-content">
              <div className="login-form">
                <Row>
                  <Col span={18} push={3}>
                    <div>
                      <Input
                        ref={ref => (this.username = ref)}
                        prefix={<Icon type="user" />}
                        autoComplete={"off"}
                        maxLength="50"
                        placeholder="请输入用户名"
                        onChange={this.inputName}
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col span={18} push={3}>
                    <div>
                      <Input
                        autoComplete={"off"}
                        prefix={<Icon type="lock" />}
                        maxLength="50"
                        type="password"
                        placeholder="请输入密码"
                        onPressEnter={this.handleSubmit}
                        onChange={this.inputPassword}
                      />
                    </div>
                  </Col>
                </Row>
                <Row className={"row-checkbox"}>
                  <Col span={24} push={3}>
                    <Checkbox checked={checked} onChange={this.onChange}>
                      保持登录状态
                    </Checkbox>
                  </Col>
                </Row>
                <Row className={"row-error"}>
                  <span>{notice}</span>
                </Row>
                <Row>
                  <Col span={18} push={3}>
                    <Button
                      loading={loading}
                      type="primary"
                      className="login-form-button"
                      onClick={this.handleSubmit}
                    >
                      登录
                    </Button>
                  </Col>
                </Row>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    );
  }

  inputName = e => {
    this.setState({ name: e.target.value });
  };

  inputPassword = e => {
    this.setState({ password: e.target.value });
  };

  handleSubmit = async e => {
    e.preventDefault();
    const { loading, name, password } = this.state;
    if (loading) {
      return;
    }
    this.setState({ loading: true });
    try {
      this.setState({ loading: true });
      const { promise } = await this.props.login(name, password);
      promise
        .then(data => {
          const { actionStatus = "", content = {} } = data;
          if (actionStatus === SUCCESS) {
            const { userMenu = [] } = content;
            setUserInfo(content);
            setUserMenu(userMenu || []);
            let permissions = {};
            this.handleMenu(userMenu, userMenu, permissions);
            // console.log('permissions', permissions)
            setUserPermissions(permissions);
            this.props.history.push(this.targetUrl);
          }
        })
        .catch(data => {
          const { content = {} } = data;
          const { message: notice } = content;
          this.setState({ notice });
        });
    } catch (err) {
      this.setState({ loading: false });
    } finally {
      this.setState({ loading: false });
    }
  };

  onChange = () => {
    this.setState({ checked: !this.state.checked });
  };
  handleMenu = (children, parent, permissions) => {
    children.forEach(item => {
      if (item.children && item.children.length > 0) {
        this.handleMenu(item.children, item, permissions);
      } else {
        if (item.type === "ACTION") {
          const key = parent.url;
          if (!permissions[key]) {
            permissions[key] = [];
          }
          permissions[key].push(item);
        } else if (!this.targetUrl) {
          this.targetUrl = item.url;
        }
      }
    });
  };
}

function mapStateToProps(state) {
  return {};
}

function mapDispatchToProps(dispatch) {
  return {
    login: bindActionCreators(login, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
