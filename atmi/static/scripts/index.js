import React from 'react';
//import styles from './index.css';
import { Row, Col, Button } from 'antd';
import UserManagement from './components/UserManagement';
import 'antd/dist/antd.css';

export default class IndexPage extends React.PureComponent {
    state = {
        hideUserManagement: false,   //Whether to hide UserManagement related components
      }
    
    render() {
        return (
            <div style={{ height: "auto", width: "99%" }}>
                <br />
                <Row type="flex" justify="center" align="middle">
                <Col span={8}>
                <h1 style={{color: "#0099FF"}}>Annotation Tool for Medical Image</h1>
          </Col>
                </Row>
                <Row type="flex" justify="center" align="middle" hidden={this.state.hideUserManagement}>
          <Col span={24}>
              <UserManagement />
              </Col>
              </Row>
            </div>
        );
    }
}