import React from 'react';
import { Row, Col, Table, Button, Progress } from 'antd';
import styles from '../../styles/ManagementPanel.css';

export default class ManagementPanel extends React.Component {
    /*     constructor(props) {
            super(props);
        }
         */
    state = {
        userTableLoading: false,
        instanceTableLoading: false,
        userTableActionToken: 1,
        instanceTableActionToken: 1,
        currentUserTablePage: 1,
        currentInstanceTablePage: 1,
        usernameEntered: "",    //Username of the table row that mouse enters into
        instanceNameEntered: ""   //Instance name of the table row that mouse enters into
    };

    //userTableData = [];
    userTableData = [
        {
            username: "calkufu@hotmail.com",
            userType: "Admin"
        },
        {
            username: "fuhua06@gmail.com",
            userType: "Annotator"
        }
    ];

    instanceTableData = [
        {
            name: "001001",
            progress: 20,
            modality: "CT",
            type: "Brain",
            description: "Lorum ipsum..."
        },
        {
            name: "001002",
            progress: 80,
            modality: "Ultra-Sound",
            type: "Breasts",
            description: "Lorum ipsum..."
        },
    ];

    onUserTablePageChange = page => {
        this.setState({
            currentUserTablePage: page,
        });
        //window.scrollTo(0,0); 
    }

    onInstanceTablePageChange = page => {
        this.setState({
            currentInstanceTablePage: page,
        });
        //window.scrollTo(0,0); 
    }

    onUserTableRow = (record) => {
        return {
            onMouseEnter: () => {
                this.setState({
                    usernameEntered: record.username
                });
            },
            onMouseLeave: () => {
                this.setState({
                    usernameEntered: ""
                });
            }
        };
    }


    onInstanceTableRow = (record) => {
        return {
            onMouseEnter: () => {
                this.setState({
                    instanceNameEntered: record.name
                });
            },
            onMouseLeave: () => {
                this.setState({
                    instanceNameEntered: ""
                });
            }
        };
    }

    /*     setRowClassName = (record) => {
            console.log("this.state.usernameEntered: ", this.state.usernameEntered);
            return record.username === this.state.usernameEntered ? '.highightTableRow' : '';
        } */

    userTableColumns = [
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            width: "34%",
            align: "center",
            className: "table",
            render: (text, record) => (
                <div className={(record.username === this.state.usernameEntered) ? styles.highightTableRow : styles.font}>
                    {text}
                </div>
            )
        },
        {
            title: 'User Type',
            dataIndex: 'userType',
            key: 'userType',
            width: "33%",
            align: "center",
            className: "table",
            render: (text, record) => (
                <div className={(record.username === this.state.usernameEntered) ? styles.highightTableRow : styles.font}>
                    {text}
                </div>
            )
        },
        {
            title: 'Operations',
            dataIndex: 'operations',
            key: 'operations',
            width: "33%",
            align: "center",
            className: "table",
            render: (text, record) => (
                <div>
                    <a href="javascript:;"><img src="./assets/static/img/delete.png" title='Delete this user' alt='Delete User' style={{ width: 18, height: 18 }} /* onClick={this.onFavoritesButtonClick} */></img></a>
                </div>
            )
        }
    ];

    instanceTableColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: "17%",
            align: "center",
            className: "table",
            render: (text, record) => (
                <div className={(record.name === this.state.instanceNameEntered) ? styles.highightTableRow : styles.font}>
                    {text}
                </div>
            )
        },
        {
            title: 'Progress',
            dataIndex: 'progress',
            key: 'progress',
            width: "14%",
            align: "center",
            className: "table",
            render: (text, record) => (
                <div>
                    <Progress percent={text} showInfo={false} strokeColor="#87d068"/>
                </div>
            )
        },
        {
            title: 'Modality',
            dataIndex: 'modality',
            key: 'modality',
            width: "18%",
            align: "center",
            className: "table",
            render: (text, record) => (
                <div className={(record.name === this.state.instanceNameEntered) ? styles.highightTableRow : styles.font}>
                    {text}
                </div>
            )
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: "18%",
            align: "center",
            className: "table",
            render: (text, record) => (
                <div className={(record.name === this.state.instanceNameEntered) ? styles.highightTableRow : styles.font}>
                    {text}
                </div>
            )
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            width: "18%",
            align: "center",
            className: "table",
            render: (text, record) => (
                <div className={(record.name === this.state.instanceNameEntered) ? styles.highightTableRow : styles.font}>
                    {text}
                </div>
            )
        },
        {
            title: 'Operations',
            dataIndex: 'operations',
            key: 'operations',
            width: "15%",
            align: "center",
            className: "table",
            render: (text, record) => (
                <div>
                    <Row type="flex" justify="start" justify="space-between">
                        <Col span={6}>
                            <a href="javascript:;"><img src="./assets/static/img/download.png" title='Download' alt='Download' style={{ width: 18, height: 18 }} /* onClick={this.onFavoritesButtonClick} */></img></a>
                        </Col>
                        <Col span={6}>
                            <a href="javascript:;"><img src="./assets/static/img/details.png" title='Details' alt='Details' style={{ width: 18, height: 18 }} /* onClick={this.onFavoritesButtonClick} */></img></a>
                        </Col>
                        <Col span={6}>
                            <a href="javascript:;"><img src="./assets/static/img/modify.png" title='Modify' alt='Modify' style={{ width: 18, height: 18 }} /* onClick={this.onFavoritesButtonClick} */></img></a>
                        </Col>
                        <Col span={6}>
                            <a href="javascript:;"><img src="./assets/static/img/delete.png" title='Delete this instance' alt='Delete Instance' style={{ width: 18, height: 18 }} /* onClick={this.onFavoritesButtonClick} */></img></a>
                        </Col>
                    </Row>
                </div>
            )
        }
    ];


    render() {
        return (
            <div>
                <Row type="flex" justify="center" align="middle">
                    <Col>
                        <h3 className={styles.font}>Welcome to ATMI, you have succcessfully logged in. This is the Management Panel page.</h3>
                    </Col>
                </Row>
                <br />
                <Row type="flex" justify="center" align="middle">
                    <Col span={8}>
                        <Button icon="plus" type="primary" ghost>
                            New User
                        </Button>
                    </Col>
                    <Col span={8}>
                        <div style={{ textAlign: "center" }}>
                            <h2 className={styles.font}>Users List</h2>
                        </div>
                    </Col>
                    <Col span={8}>

                    </Col>
                </Row>
                <Row type="flex" justify="start">
                    <Col span={24}>
                        <Table columns={this.userTableColumns}
                            dataSource={this.userTableData}
                            /* bordered  */
                            size="middle"
                            loading={this.state.userTableLoading}
                            actionToken={this.state.userTableActionToken}
                            onRow={this.onUserTableRow}
                            //rowClassName={this.setRowClassName}
                            pagination={{
                                current: this.state.currentUserTablePage,
                                onChange: this.onUserTablePageChange,
                                showSizeChanger: true,
                                /*                                 itemRender:(page, type, originalElement) => {return(
                                                                    <div style={{color: "#ccc"}}>
                                                                        {originalElement}
                                                                    </div>
                                                                ) }, */
                                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                            }}
                        />
                    </Col>
                </Row>
                <br />
                <Row type="flex" justify="center" align="middle">
                    <Col span={8}>
                        <Button icon="plus" type="primary" ghost>
                            New Instance
                        </Button>
                    </Col>
                    <Col span={8}>
                        <div style={{ textAlign: "center" }}>
                            <h2 className={styles.font}>Instances List</h2>
                        </div>
                    </Col>
                    <Col span={8}>

                    </Col>
                </Row>
                <Row type="flex" justify="start">
                    <Col span={24}>
                        <Table columns={this.instanceTableColumns}
                            dataSource={this.instanceTableData}
                            /* bordered  */
                            size="middle"
                            loading={this.state.instanceTableLoading}
                            actionToken={this.state.instanceTableActionToken}
                            onRow={this.onInstanceTableRow}
                            //rowClassName={this.setRowClassName}
                            pagination={{
                                current: this.state.currentInstanceTablePage,
                                onChange: this.onInstanceTablePageChange,
                                showSizeChanger: true,
                                /*                                 itemRender:(page, type, originalElement) => {return(
                                                                    <div style={{color: "#ccc"}}>
                                                                        {originalElement}
                                                                    </div>
                                                                ) }, */
                                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                            }}
                        />
                    </Col>
                </Row>


            </div>)
    }


} 