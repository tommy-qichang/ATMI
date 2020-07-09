import React from 'react';
import { Button, Col, Icon, Input, message, Modal, Progress, Row, Select, Table } from 'antd';
import styles from '../../styles/ManagementPanel.css';
//import axios from "axios";

export default class StudyList extends React.Component {

    state = {
        nameEntered: "",    //Study name of the table row that mouse enters into
    }

    studiesListTableData = [
        {
            name: "Study 1",
            path: "D:\\dev\\projects\\Git repositories\\ATMI\\",
            annotators: "calkufu@hotmail.com",
            auditors: "fuhua06@gmail.com",
            filesNo: 5,
            status: "Ready"
        },
        {
            name: "Study 2",
            path: "D:\\dev\\projects\\AnnotationSystem\\",
            annotators: "calkufu@hotmail.com",
            auditors: "fuhua06@gmail.com",
            filesNo: 10,
            status: "Finish"
        },
        {
            name: "Study 3",
            path: "D:\\dev\\projects\\CornerstoneToolTest\\",
            annotators: "29375917@qq.com",
            auditors: "fuhua06@gmail.com",
            filesNo: 10,
            status: "Auditing"
        }
    ];

    onTableRow = (record) => {
        return {
            onMouseEnter: () => {
                this.setState({
                    nameEntered: record.name
                });
            },
            onMouseLeave: () => {
                this.setState({
                    nameEntered: ""
                });
            }
        }
    }

    onGoBackButtonClick = e => {
        this.props.goBackToMainPanel();
    }


    studiesListTableColumns = [
        {
            title: 'Study Name',
            dataIndex: 'name',
            key: 'name',
            width: "16%",
            align: "center",
            render: (text, record) => (
                <div
                    className={(record.name === this.state.nameEntered) ? styles.highightTableRow : styles.font}>
                    {text}
                </div>
            )
        },
        {
            title: 'Study Path',
            dataIndex: 'path',
            key: 'path',
            width: "24%",
            align: "center",
            render: (text, record) => (
                <div
                    className={(record.name === this.state.nameEntered) ? styles.highightTableRow : styles.font}>
                    {text}
                </div>
            )
        },
        {
            title: 'Annotators',
            dataIndex: 'annotators',
            key: 'annotators',
            width: "16%",
            align: "center",
            render: (text, record) => (
                <div
                    className={(record.name === this.state.nameEntered) ? styles.highightTableRow : styles.font}>
                    {text}
                </div>
            )
        },
        {
            title: 'Auditors',
            dataIndex: 'auditors',
            key: 'auditors',
            width: "16%",
            align: "center",
            render: (text, record) => (
                <div
                    className={(record.name === this.state.nameEntered) ? styles.highightTableRow : styles.font}>
                    {text}
                </div>
            )
        },
        {
            title: 'Total Files Number',
            dataIndex: 'filesNo',
            key: 'filesNo',
            width: "10%",
            align: "center",
            render: (text, record) => (
                <div
                    className={(record.name === this.state.nameEntered) ? styles.highightTableRow : styles.font}>
                    {text}
                </div>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: "18%",
            align: "center",
            render: (text, record) => (
                <div
                    className={(record.name === this.state.nameEntered) ? styles.highightTableRow : styles.font}>
                    {text}
                </div>
            )
        }
    ];

    render() {
        return (
            <div>
                <Row type="flex" justify="center" align="middle">
                    <Col span={8}>
                        <Button icon="arrow-left" type="primary" ghost
                            onClick={this.onGoBackButtonClick}>
                            Go Back
                        </Button>
                    </Col>
                    <Col span={8}>
                        <div style={{ textAlign: "center" }}>
                            <h2 className={styles.font}>
                                Studies List of Instance 0001001
                                    </h2>
                        </div>
                    </Col>
                    <Col span={8}>

                    </Col>
                </Row>
                <Row type="flex" justify="start">
                    <Col span={24}>
                        <Table columns={this.studiesListTableColumns}
                            dataSource={this.studiesListTableData}
                            /* bordered  */
                            size="middle"
                            //loading={this.state.instanceTableLoading}
                            //actionToken={this.state.instanceTableActionToken}
                            onRow={this.onTableRow}
                            //rowClassName={this.setRowClassName}
                            locale={{
                                filterTitle: 'Filter',
                                filterConfirm: 'Confirm',
                                filterReset: 'Reset',
                                emptyText: 'No Data',
                            }}
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
            </div>
        )
    }

}