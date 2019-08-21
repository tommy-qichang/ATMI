import React from 'react';
import { Row, Col, Button } from 'antd';

export default class ManagementPanel extends React.Component {
/*     constructor(props) {
		super(props);
	}
     */
    render() {
        return (
            <div>
                <Row type="flex" justify="center" align="middle">
                    <Col span={8}>
                        <h3>Welcome to ATMI, you have succcessfully logged in.</h3>
                        <br />
                        <h3>This is Management Panel page.</h3>
                   </Col>
                </Row>
            </div>)
    }


} 