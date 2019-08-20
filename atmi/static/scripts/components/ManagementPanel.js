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
                    <Col span={24}>
                        Welcome to ATMI, you have succcessfully logged in.
                   </Col>
                </Row>

            </div>)
    }


} 