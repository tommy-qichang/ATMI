import React from 'react';
import { Row, Col, Button, Modal, Input, message } from 'antd';
import LoginForm from './LoginForm';
//import ResetPasswordForm from './ResetPasswordForm';
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
        hideLResetPasswordForm: true,   //Whether to hide ResetPasswordForm
        hideLSettingPanel: true,   //Whether to hide SettingPanel
        hideManagementPanel: true,   //Whether to hide ManagementPanel
    };

    componentDidUpdate() {
        switch (this.props.userManagementMode) {
            case "LoginForm":
                this.setState({
                    hideLoginForm: false,
                    hideLResetPasswordForm: true,
                    hideLSettingPanel: true,
                    hideManagementPanel: true
                });
                break;
            case "ResetPasswordForm":
                this.setState({
                    hideLoginForm: true,
                    hideLResetPasswordForm: false,
                    hideLSettingPanel: true,
                    hideManagementPanel: true
                });
                break;
            case "LSettingPanel":
                this.setState({
                    hideLoginForm: true,
                    hideLResetPasswordForm: true,
                    hideLSettingPanel: false,
                    hideManagementPanel: true
                });
                break;
            case "ManagementPanel":
                this.setState({
                    hideLoginForm: true,
                    hideLResetPasswordForm: true,
                    hideLSettingPanel: true,
                    hideManagementPanel: false
                });
                break;
            default:
                return;
        }
    }

    onLoginSuccess = username => {
        this.setState({
            hideLoginForm: true,
            hideManagementPanel: false
        });
        this.props.onLoginSuccess(username);
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
                    </Col>
                </Row>
                {/* <Row type="flex" justify="center" align="middle" hidden={this.state.hideLResetPasswordForm}>
                    <Col span={24}>
                        <ResetPasswordForm />
                    </Col>
                </Row>
                <Row type="flex" justify="center" align="middle" hidden={this.state.hideLSettingPanel}>
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