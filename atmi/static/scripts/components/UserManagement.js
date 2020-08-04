import React from 'react';
import {Col, Row} from 'antd';
import LoginForm from './LoginForm';
import WrappedNormalResetPasswordForm from './ResetPasswordForm';
//import SettingPanel from './SettingPanel';
import ListPanel from './ListPanel';


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
        hideListPanel: true,   //Whether to hide ManagementPanel
        ResetPasswordUsername: "",   //Username to be reset password for
    };

    componentDidMount() {
        if (window.location.search !== "" || ATMI_STATUS.ini_admin) {
            let queries = window.location.search.substring(1).split("&");
            this.setState({
                ResetPasswordUsername: queries[0].split("=")[1],
            });
            this.toManagementMode("WrappedNormalResetPasswordForm");
        }else if (ATMI_STATUS.username !== '') {
            this.onLoginSuccess(ATMI_STATUS.username);
        }
    }

    componentDidUpdate() {
        switch (this.props.userManagementMode) {
            case "LoginForm":
                this.setState({
                    hideLoginForm: false,
                    hideResetPasswordForm: true,
                    hideSettingPanel: true,
                    hideListPanel: true
                });
                break;
            case "WrappedNormalResetPasswordForm":
                this.setState({
                    hideLoginForm: true,
                    hideResetPasswordForm: false,
                    hideSettingPanel: true,
                    hideListPanel: true
                });
                break;
            case "SettingPanel":
                this.setState({
                    hideLoginForm: true,
                    hideResetPasswordForm: true,
                    hideSettingPanel: false,
                    hideListPanel: true
                });
                break;
            case "ListPanel":
                this.setState({
                    hideLoginForm: true,
                    hideResetPasswordForm: true,
                    hideSettingPanel: true,
                    hideListPanel: false
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
        this.toManagementMode("ListPanel");
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
            <div style={{height: "auto", width: "99%"}}>
                <br/>
                <Row type="flex" justify="center" align="middle" hidden={this.state.hideLoginForm}>
                    <Col>
                        <LoginForm
                            onLoginSuccess={this.onLoginSuccess}
                        />
                        {/*  <a href="javascript:;" onClick={this.toManagementMode("WrappedNormalResetPasswordForm")}>Reset Password</a> */}
                    </Col>
                </Row>
                <Row type="flex" justify="center" align="middle" hidden={this.state.hideResetPasswordForm}>
                    <Col>
                        <WrappedNormalResetPasswordForm
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
                <Row type="flex" justify="center" align="middle" hidden={this.state.hideListPanel}>
                    <Col span={24}>
                        <ListPanel/>
                    </Col>
                </Row>
            </div>
        );
    }
}