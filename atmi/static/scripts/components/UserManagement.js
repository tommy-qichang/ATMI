import React from 'react';
import { Row, Col, Button } from 'antd';
import LoginForm from './LoginForm';
import ResetPasswordForm from './ResetPasswordForm';
import SettingPanel from './SettingPanel';
import ManagementPanel from './ManagementPanel';


export default class UserManagement extends React.PureComponent {
    state = {
        hideLoginForm: false,   //Whether to hide LoginForm
        hideLResetPasswordForm: true,   //Whether to hide ResetPasswordForm
        hideLSettingPanel: true,   //Whether to hide SettingPanel
        hideManagementPanel: true,   //Whether to hide ManagementPanel
    };

    onLoginSuccess = e => {
        this.setState({
            hideLoginForm: true,
            hideManagementPanel: false
        });
    }

    render() {
        return (
            <div style={{ height: "auto", width: "99%" }}>
                <br />
                <Row type="flex" justify="center" align="middle" hidden={this.state.hideLoginForm}>
                    <Col span={24}>
                        <LoginForm
                            onLoginSuccess={this.onLoginSuccess}
                        />
                    </Col>
                </Row>
                <Row type="flex" justify="center" align="middle" hidden={this.state.hideLResetPasswordForm}>
                    <Col span={24}>
                        <ResetPasswordForm />
                    </Col>
                </Row>
                <Row type="flex" justify="center" align="middle" hidden={this.state.hideLSettingPanel}>
                    <Col span={24}>
                        <SettingPanel />
                    </Col>
                </Row>
                <Row type="flex" justify="center" align="middle" hidden={this.state.hideLManagementPanel}>
                    <Col span={24}>
                        <ManagementPanel />
                    </Col>
                </Row>
            </div>
        );
    }
}