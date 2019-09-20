import React from 'react';
import { Row, Col, Button, Modal, Input, message } from 'antd';
import LoginForm from './LoginForm';
import ResetPasswordForm from './ResetPasswordForm';
//import SettingPanel from './SettingPanel';
import ManagementPanel from './ManagementPanel';


export default class UserManagement extends React.PureComponent {
    /*     constructor(props) {
            super(props);
            this.state = {
                hideLoginForm: false,   //Whether to hide LoginForm
                hideLResetPasswordForm: true,   //Whether to hide ResetPasswordForm
                hideLSettingPanel: true,   //Whether to hide SettingPanel
                hideManagementPanel: true,   //Whether to hide ManagementPanel
            };
        } */

    state = {
        hideLoginForm: false,   //Whether to hide LoginForm
        hideResetPasswordForm: true,   //Whether to hide ResetPasswordForm
        hideSettingPanel: true,   //Whether to hide SettingPanel
        hideManagementPanel: true,   //Whether to hide ManagementPanel
        ResetPasswordUsername: "",   //Username to be reset password for
    };

    componentDidMount() {
        if(window.location.search!=="") {
            this.setState({
                ResetPasswordUsername: window.location.search.substring(1),
            });
            this.toManagementMode("ResetPasswordForm");
        }
    }

    componentDidUpdate() {
         switch (this.props.userManagementMode) {
            case "LoginForm":
                this.setState({
                    hideLoginForm: false,
                    hideResetPasswordForm: true,
                    hideSettingPanel: true,
                    hideManagementPanel: true
                });
                break;
            case "ResetPasswordForm":
                this.setState({
                    hideLoginForm: true,
                    hideResetPasswordForm: false,
                    hideSettingPanel: true,
                    hideManagementPanel: true
                });
                break;
            case "SettingPanel":
                this.setState({
                    hideLoginForm: true,
                    hideResetPasswordForm: true,
                    hideSettingPanel: false,
                    hideManagementPanel: true
                });
                break;
            case "ManagementPanel":
                this.setState({
                    hideLoginForm: true,
                    hideResetPasswordForm: true,
                    hideSettingPanel: true,
                    hideManagementPanel: false
                });
                break;
            default:
                return;
        } 
    }

    onLoginSuccess = username => {
/*         this.setState({
            hideLoginForm: true,
            hideManagementPanel: false
        });  */
        this.props.onLoginSuccess(username);
        this.toManagementMode("ManagementPanel");
    }

    toManagementMode = mode => {
       this.props.toManagementMode(mode);
    }

    onResetPasswordSucceed = e => {
/*         this.setState({
            hideLoginForm: false,
            hideResetPasswordForm: true
        }); */
        this.toManagementMode("LoginForm");
    }

    render() {
        return (
            <div style={{ height: "auto", width: "99%" }}>
                <br />
                <Row type="flex" justify="center" align="middle" hidden={this.state.hideLoginForm}>
                    <Col>
                        <LoginForm
                            onLoginSuccess={this.onLoginSuccess}
                        />
                       {/*  <a href="javascript:;" onClick={this.toManagementMode("ResetPasswordForm")}>Reset Password</a> */}
                    </Col>
                </Row>
                <Row type="flex" justify="center" align="middle" hidden={this.state.hideResetPasswordForm}>
                    <Col>
                        <ResetPasswordForm
                            onResetPasswordSucceed={this.onResetPasswordSucceed}
                            username={this.state.ResetPasswordUsername}
                        />
                    </Col>
                </Row>
                {/* <Row type="flex" justify="center" align="middle" hidden={this.state.hideLSettingPanel}>
                    <Col span={24}>
                        <SettingPanel />
                    </Col>
                </Row> */}
                <Row type="flex" justify="center" align="middle" hidden={this.state.hideManagementPanel}>
                    <Col span={24}>
                        <ManagementPanel />
                    </Col>
                </Row>
            </div>
        );
    }
}