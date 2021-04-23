import React from 'react';
//import styles from './index.css';
import {Button, Col, message, Row} from 'antd';
import UserManagement from './components/UserManagement';
//import 'antd/dist/antd.css';
import styles from '../styles/index.css';
import axios from "axios";

export default class IndexPage extends React.PureComponent {
    state = {
        hideUserManagement: false,   //Whether to hide UserManagement related components
        username: "",  //username logged in
        loggedIn: false,  //Whether the user has logged in
        userManagementMode: "LoginForm"
    }

    onLoginSuccess = username => {
        this.setState({
            loggedIn: true,
            username,
            userManagementMode: "ListPanel"
        });
    }


    onLogoutButtonClick = e => {
        //localStorage.removeItem('jwtToken');
        message.success('Successfully logged out！', 2);
        this.setState({
            loggedIn: false,
            hideUserManagement: false,
            username: "",
            userManagementMode: "LoginForm"
        });
        axios.get("/logout")

    }

    toManagementMode = mode => {
        this.setState({
            userManagementMode: mode
        });
    }

    render() {
        return (
            <div /* style={{ height: "auto", width: "99%" }} */ className={styles.canvas}>
                <br/>
                <Row type="flex" justify="center" align="middle">
                    <Col span={7}>
                    </Col>
                    <Col span={10}>
                        <h1 className={styles.titleFont}>Annotation Tool for Medical Image</h1>
                    </Col>
                    <Col span={1}>
                    </Col>
                    <Col span={4}>
                        <label /* className={styles.font} */ className={styles.welcomeText}
                                                             hidden={!this.state.loggedIn}>{`Welcome，${this.state.username}`}</label>
                    </Col>
                    <Col span={2}>
                        <Button size="small" /* type="primary" */ 
                        ghost onClick={this.onLogoutButtonClick}
                                hidden={!this.state.loggedIn}>Log out</Button>
                    </Col>
                </Row>
                <div /* style={{width: "100%", height: "1px", border: "1px solid #ccc"}} */ className={styles.border}/>
                <Row type="flex" justify="center" align="middle" hidden={this.state.hideUserManagement}>
                    <Col span={24}>
                        <UserManagement
                            onLoginSuccess={this.onLoginSuccess}
                            userManagementMode={this.state.userManagementMode}
                            toManagementMode={this.toManagementMode}
                        />
                    </Col>
                </Row>
            </div>
        );
    }
}