import React from 'react';
import {Button, Col, Icon, Input, message, Modal, Progress, Row, Select, Table} from 'antd';
import {SketchPicker} from 'react-color';
import styles from '../../styles/ManagementPanel.css';
import axios from "axios";
//import InfiniteScroll from 'react-infinite-scroller';


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
        instanceNameEntered: "",   //Instance name of the table row that mouse enters into
        showAddUser: false,
        showAddInstance: false,
        showModifyInstance: false,
        showInstanceDetail: false,
        hideColorPicker: true,
        colorBlockColor: "#FF8000",
        colorPickerColor: "#FF8000",
        labelCandidatesBuffer: [],
        annotatorCandidatesBuffer: [],
        hideAddLabelControls: true,
        hideAddAnnotatorControls: true,
        userTableData: []
    };

    newUsername = null;
    newInstanceName = null;
    newInstanceDescription = null;
    modifyInstanceDescription = null;
    newInstancePath = null;
    modifyInstancePath = null;
    newLabelName = null;
    newLabelValue = null;
    colorPicker = null;
    labelCandidatesBuffer = [];
    annotatorCandidatesBuffer = [];
    // userTableData = [];
    // userTableData = [
    //     {
    //         username: "calkufu@hotmail.com",
    //         userType: "Admin"
    //     },
    //     {
    //         username: "fuhua06@gmail.com",
    //         userType: "Annotator"
    //     }
    // ];


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
        }
    ];


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

    componentDidMount() {
        this.listAllUsers()
    }

    listAllUsers = () => {
        axios.get("/user/").then(res => {
            let userTableData = []
            const user = res.data;
            for (let i = 0; i < user.length; i++) {
                userTableData.push({username: user[i].email, nickname: user[i].name, usertype: user[i].user_type==0?"Admin":"Annotator"})
            }
            this.setState({"userTableData": userTableData})
        }).catch(error => {
            message.error('List user error');
            console.log(error)
        })


    }


    onUserTablePageChange = page => {
        this.setState({
            currentUserTablePage: page,
        });
        //window.scrollTo(0,0); 
    };

    onInstanceTablePageChange = page => {
        this.setState({
            currentInstanceTablePage: page,
        });
        //window.scrollTo(0,0); 
    };

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
    };


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
    };

    onNewUserButtonClick = e => {
        this.setState({
            showAddUser: true
        });
    };

    handleAddUserOk = e => {
        this.checkEmail();
    };

    handleAddUserCancel = e => {
        this.setState({
            showAddUser: false
        });
    };

    checkEmail = () => {
        let reg = /^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i;
        if (!this.newUsername) {
            return;
        }
        let username = this.newUsername.value;
        if (reg.test(username)) {
            this.proccessAddUser(username);
        } else {
            message.error("Please enter username of email format", 2);
        }
    }

    proccessAddUser = username => {
        message.success("Sucessfully added user and sent email to user", 2);
        this.setState({
            showAddUser: false
        });
    }

    /*     setRowClassName = (record) => {
            console.log("this.state.usernameEntered: ", this.state.usernameEntered);
            return record.username === this.state.usernameEntered ? '.highightTableRow' : '';
        } */

    handleAddInstanceOk = e => {
        this.labelCandidatesBuffer = [];
        this.annotatorCandidatesBuffer = [];
        this.setState({
            showAddInstance: false,
            hideColorPicker: true,
            labelCandidatesBuffer: [],
            annotatorCandidatesBuffer: [],
            hideAddLabelControls: true,
            hideAddAnnotatorControls: true
        });
    }

    handleModifyInstanceOk = e => {
        this.labelCandidatesBuffer = [];
        this.annotatorCandidatesBuffer = [];
        this.setState({
            showModifyInstance: false,
            hideColorPicker: true,
            labelCandidatesBuffer: [],
            annotatorCandidatesBuffer: [],
            hideAddLabelControls: true,
            hideAddAnnotatorControls: true
        });
    }

    onNewInstanceButtonClick = e => {
        this.setState({
            showAddInstance: true
        });
    }

    handleAddInstanceCancel = e => {
        this.labelCandidatesBuffer = [];
        this.annotatorCandidatesBuffer = [];
        this.setState({
            showAddInstance: false,
            hideColorPicker: true,
            labelCandidatesBuffer: [],
            annotatorCandidatesBuffer: [],
            hideAddLabelControls: true,
            hideAddAnnotatorControls: true
        });
    }

    handleModifyInstanceCancel = e => {
        this.labelCandidatesBuffer = [];
        this.annotatorCandidatesBuffer = [];
        this.setState({
            showModifyInstance: false,
            hideColorPicker: true,
            labelCandidatesBuffer: [],
            annotatorCandidatesBuffer: [],
            hideAddLabelControls: true,
            hideAddAnnotatorControls: true
        });
    }

    handleLoadDICOM = e => {

    }

    handleAddLabel = e => {
        this.labelCandidatesBuffer.push({
            name: this.newLabelName.state.value,
            value: this.newLabelValue.state.value,
            color: this.state.colorBlockColor
        });
        this.setState({
            labelCandidatesBuffer: this.labelCandidatesBuffer,
            colorBlockColor: "#FF8000"
        });
        this.newLabelName.state.value = "";
        this.newLabelValue.state.value = "";
    }

    handleAddAnnotator = e => {
        this.annotatorCandidatesBuffer.push(
            this.newAnnotatorCandidate.state.value
        );
        this.setState({
            annotatorCandidatesBuffer: this.annotatorCandidatesBuffer,
        });
        this.newAnnotatorCandidate.state.value = "";
    }

    onAddInstanceModalClick = e => {
        this.setState({
            hideColorPicker: true
        });
    }

    onAddInstanceModalClick = e => {
        this.setState({
            hideColorPicker: true
        });
    }

    onColorBlockClick = e => {
        e.stopPropagation();
        if (!this.state.hideColorPicker) {
            //console.log("this.colorPicker", this.colorPicker);
            this.setState({
                colorBlockColor: this.colorPicker.state.hex
            });
        } else {
            this.setState({
                colorPickerColor: this.state.colorBlockColor
            });
        }
        this.setState({
            hideColorPicker: !this.state.hideColorPicker
        });
    }

    onColorPickerClick = e => {
        e.stopPropagation();
    }

    onLabelPlusIconClick = e => {
        this.setState({
            hideAddLabelControls: !this.state.hideAddLabelControls
        });
    }

    onAnnotatorPlusIconClick = e => {
        this.setState({
            hideAddAnnotatorControls: !this.state.hideAddAnnotatorControls
        });
    }

    onLabelCloseIconClick = e => {
        //console.log("e.target.dataset.index: ", e.currentTarget.dataset.index);
        this.labelCandidatesBuffer.splice(e.currentTarget.dataset.index, 1);
        this.setState({
            labelCandidatesBuffer: this.labelCandidatesBuffer
        });
    }

    onAnnotatorCloseIconClick = e => {
        //console.log("e.target.dataset.index: ", e.currentTarget.dataset.index);
        this.annotatorCandidatesBuffer.splice(e.currentTarget.dataset.index, 1);
        this.setState({
            annotatorCandidatesBuffer: this.annotatorCandidatesBuffer
        });
    }

    onModifyInstanceClick = e => {
        this.setState({
            showModifyInstance: true
        });
    }

    onInstanceDetailClick = e => {
        this.setState({
            showInstanceDetail: true
        });
    }

    handleInstanceDetailOk = e => {
        this.setState({
            showInstanceDetail: false
        });
    }

    userTableColumns = [
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            width: "34%",
            align: "center",
            className: "table",
            render: (text, record) => (
                <div
                    className={(record.username === this.state.usernameEntered) ? styles.highightTableRow : styles.font}>
                    {text}
                </div>
            )
        },
        {
            title: 'User Type',
            dataIndex: 'usertype',
            key: 'usertype',
            width: "33%",
            align: "center",
            className: "table",
            render: (text, record) => (
                <div
                    className={(record.username === this.state.usernameEntered) ? styles.highightTableRow : styles.font}>
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
                    <a href="javascript:;"><img src="./assets/static/img/delete.png" title='Delete this user'
                                                alt='Delete User' style={{
                        width: 18,
                        height: 18
                    }} /* onClick={this.onFavoritesButtonClick} */></img></a>
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
                <div
                    className={(record.name === this.state.instanceNameEntered) ? styles.highightTableRow : styles.font}>
                    <a href="javascript:;" title="Show studies list" style={{color: "#0099FF"}}
                       onClick={this.onInstanceDetailClick} data-instancename={text}>
                        {text}
                    </a>
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
                <div
                    className={(record.name === this.state.instanceNameEntered) ? styles.highightTableRow : styles.font}>
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
                <div
                    className={(record.name === this.state.instanceNameEntered) ? styles.highightTableRow : styles.font}>
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
                <div
                    className={(record.name === this.state.instanceNameEntered) ? styles.highightTableRow : styles.font}>
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
                            <a href="javascript:;"><img src="./assets/static/img/download.png" title='Download'
                                                        alt='Download' style={{
                                width: 18,
                                height: 18
                            }} /* onClick={this.onFavoritesButtonClick} */></img></a>
                        </Col>
                        <Col span={6}>
                            <a href="javascript:;"><img src="./assets/static/img/details.png" title='Show studies list'
                                                        alt='Show studies list' style={{width: 18, height: 18}}
                                                        onClick={this.onInstanceDetailClick}></img></a>
                        </Col>
                        <Col span={6}>
                            <a href="javascript:;"><img src="./assets/static/img/modify.png" title='Modify' alt='Modify'
                                                        style={{width: 18, height: 18}}
                                                        onClick={this.onModifyInstanceClick}></img></a>
                        </Col>
                        <Col span={6}>
                            <a href="javascript:;"><img src="./assets/static/img/delete.png"
                                                        title='Delete this instance' alt='Delete Instance' style={{
                                width: 18,
                                height: 18
                            }} /* onClick={this.onFavoritesButtonClick} */></img></a>
                        </Col>
                    </Row>
                </div>
            )
        }
    ];

    studiesListTableColumns = [
        {
            title: 'Study Name',
            dataIndex: 'name',
            key: 'name',
            width: "16%",
            align: "center"
        },
        {
            title: 'Study Path',
            dataIndex: 'path',
            key: 'path',
            width: "24%",
            align: "center"
        },
        {
            title: 'Annotators',
            dataIndex: 'annotators',
            key: 'annotators',
            width: "16%",
            align: "center"
        },
        {
            title: 'Auditors',
            dataIndex: 'auditors',
            key: 'auditors',
            width: "16%",
            align: "center"
        },
        {
            title: 'Total Files Number',
            dataIndex: 'filesNo',
            key: 'filesNo',
            width: "10%",
            align: "center"
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: "18%",
            align: "center"
        }
    ];


    render() {
        return (
            <div>
                <Row type="flex" justify="center" align="middle">
                    <Col span={8}>
                        <Button icon="plus" type="primary" ghost
                                onClick={this.onNewUserButtonClick}>
                            New User
                        </Button>
                    </Col>
                    <Col span={8}>
                        <div style={{textAlign: "center"}}>
                            <h2 className={styles.font}>User List</h2>
                        </div>
                    </Col>
                    <Col span={8}>

                    </Col>
                </Row>
                <Row type="flex" justify="start">
                    <Col span={24}>
                        <Table columns={this.userTableColumns}
                               dataSource={this.state.userTableData}
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
                <br/>
                <Row type="flex" justify="center" align="middle">
                    <Col span={8}>
                        <Button icon="plus" type="primary" ghost
                                onClick={this.onNewInstanceButtonClick}>
                            New Instance
                        </Button>
                    </Col>
                    <Col span={8}>
                        <div style={{textAlign: "center"}}>
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
                <Modal
                    title={(<div style={{height: 12}}>Add User</div>)}
                    width="30%"
                    visible={this.state.showAddUser}
                    onOk={this.handleAddUserOk}
                    onCancel={this.handleAddUserCancel}
                    footer={[
                        <Button key="submit" type="primary" onClick={this.handleAddUserOk}>
                            Save
                        </Button>,
                        <Button key="back" onClick={this.handleAddUserCancel}>
                            Cancel
                        </Button>,
                    ]}
                    bodyStyle={{marginTop: 6, paddingTop: 6}}
                >
                    {/*                     <Row type="flex" justify="start">
                        <Col span={24}>
                            批量输入申报名称
                    </Col>
                    </Row> */}
                    {/*                     <div style={{ height: 3 }} /> */}
                    <Row type="flex" justify="start">
                        <Col span={24}>
                            <div style={{fontSize: 'x-small', fontWeight: 'bold'}}>
                                Username
                            </div>
                        </Col>
                    </Row>
                    <div style={{height: 6}}/>
                    <Row>
                        <Col>
                            <Input placeholder="Please enter username (email format)"
                                   ref={target => (this.newUsername = target)}/>
                        </Col>
                    </Row>
                    <div style={{height: 6}}/>
                    <Row type="flex" justify="start">
                        <Col span={24}>
                            <div style={{fontSize: 'x-small', fontWeight: 'bold'}}>
                                User Type
                            </div>
                        </Col>
                    </Row>
                    <div style={{height: 6}}/>
                    <Row>
                        <Col>
                            <Select defaultValue="admin" style={{width: '100%'}}>
                                <Select.Option value="admin">
                                    Admin
                                </Select.Option>
                                <Select.Option value="annotator">
                                    Annotator
                                </Select.Option>
                            </Select>
                        </Col>
                    </Row>
                </Modal>

                <Modal
                    title={(<div style={{height: 12}}>Create Instance</div>)}
                    width="35%"
                    visible={this.state.showAddInstance}
                    onOk={this.handleAddInstanceOk}
                    onCancel={this.handleAddInstanceCancel}
                    destroyOnClose={true}
                    footer={[
                        <Button key="submit" type="primary" onClick={this.handleAddInstanceOk}>
                            Save
                        </Button>,
                        <Button key="back" onClick={this.handleAddInstanceCancel}>
                            Cancel
                        </Button>,
                    ]}
                    bodyStyle={{marginTop: 6, paddingTop: 6}}
                >
                    <div className={styles.infinitecontainer}>
                        {/*                         <InfiniteScroll
                            initialLoad={false}
                            pageStart={0}
                            useWindow={false}
                        > */}
                        <div onClick={this.onAddInstanceModalClick}>
                            <Row type="flex" justify="start">
                                <Col span={24}>
                                    <div style={{fontSize: 'x-small', fontWeight: 'bold'}}>
                                        Instance Name
                                    </div>
                                </Col>
                            </Row>
                            <div style={{height: 6}}/>
                            <Row>
                                <Col>
                                    <Input placeholder="Please enter instance name"
                                           ref={target => (this.newInstanceName = target)}/>
                                </Col>
                            </Row>
                            <div style={{height: 6}}/>
                            <Row type="flex" justify="start">
                                <Col span={24}>
                                    <div style={{fontSize: 'x-small', fontWeight: 'bold'}}>
                                        Modality
                                    </div>
                                </Col>
                            </Row>
                            <div style={{height: 6}}/>
                            <Row>
                                <Col>
                                    <Select defaultValue="CT" style={{width: '100%'}}>
                                        <Select.Option value="CT">
                                            CT
                                        </Select.Option>
                                        <Select.Option value="ultrasound">
                                            Ultra-Sound
                                        </Select.Option>
                                        <Select.Option value="MRI">
                                            MRI
                                        </Select.Option>
                                        <Select.Option value="xray">
                                            X-ray
                                        </Select.Option>
                                        <Select.Option value="other">
                                            Other
                                        </Select.Option>
                                    </Select>
                                </Col>
                            </Row>
                            <div style={{height: 6}}/>
                            <Row type="flex" justify="start">
                                <Col span={24}>
                                    <div style={{fontSize: 'x-small', fontWeight: 'bold'}}>
                                        Description(Optional)
                                    </div>
                                </Col>
                            </Row>
                            <div style={{height: 6}}/>
                            <Row>
                                <Col>
                                    <Input.TextArea rows={3} placeholder="Please enter description"
                                                    ref={target => (this.newInstanceDescription = target)}/>
                                </Col>
                            </Row>
                            <div style={{height: 6}}/>
                            <Row type="flex" justify="start">
                                <Col span={24}>
                                    <div style={{fontSize: 'x-small', fontWeight: 'bold'}}>
                                        Path
                                    </div>
                                </Col>
                            </Row>
                            <div style={{height: 6}}/>
                            <Row type="flex" justify="space-between">
                                <Col span={18}>
                                    <Input placeholder="Please enter the path"
                                           ref={target => (this.newInstancePath = target)}/>
                                </Col>
                                <Col span={6}>
                                    <div style={{float: "right"}}>
                                        <Button type="primary" onClick={this.handleLoadDICOM}>
                                            Load
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                            <div style={{height: 6}}/>
                            <Row type="flex" justify="space-between">
                                <Col span={18}>
                                    <div style={{fontSize: 'x-small', fontWeight: 'bold'}}>
                                        Label
                                    </div>
                                </Col>
                                <Col span={6}>
                                    <div style={{float: "right"}}>
                                        <Icon type="plus"
                                              style={{width: 18, height: 18}}
                                              onClick={this.onLabelPlusIconClick}
                                        />
                                    </div>
                                </Col>
                            </Row>

                            <Row type="flex" justify="start">
                                <Col span={24}>
                                    <div className={styles.borderSpan}>
                                        <div className={styles.border}/>
                                    </div>
                                </Col>
                            </Row>

                            <div hidden={this.state.hideAddLabelControls}>
                                <Row type="flex" justify="start" gutter={8}>
                                    <Col span={10}>
                                        <div style={{color: "#ccc"}}>
                                            Name
                                        </div>
                                    </Col>
                                    <Col span={4}>
                                        <div style={{color: "#ccc"}}>
                                            Value
                                        </div>
                                    </Col>
                                    <Col span={3}>
                                        <div style={{color: "#ccc"}}>
                                            Color
                                        </div>
                                    </Col>
                                    <Col>
                                    </Col>
                                </Row>
                                {(this.state.labelCandidatesBuffer.length > 0)
                                &&
                                this.state.labelCandidatesBuffer.map((label, index) => {
                                    return (
                                        <div>
                                            <Row type="flex" justify="start" gutter={8}>
                                                <Col span={10}>
                                                    <div style={{color: "#ccc", fontStyle: "italic"}}>
                                                        {label.name}
                                                    </div>
                                                </Col>
                                                <Col span={4}>
                                                    <div style={{color: "#ccc", fontStyle: "italic"}}>
                                                        {label.value}
                                                    </div>
                                                </Col>
                                                <Col span={3}>
                                                    <div style={{
                                                        backgroundColor: label.color,
                                                        width: "3.5vmin",
                                                        height: "96%"
                                                    }}
                                                         onClick={this.onColorBlockClick}/>
                                                </Col>
                                                <Col>
                                                    <div style={{border: "0.2px solid #ccc"}}
                                                         onClick={this.onLabelCloseIconClick}
                                                         data-index={index}
                                                    >
                                                        <Icon type="close"
                                                            //onClick={this.onLabelCloseIconClick}
                                                            //data-index={index}
                                                        />
                                                    </div>
                                                </Col>
                                            </Row>
                                            <div style={{height: 2}}/>
                                        </div>
                                    );
                                })}
                                <Row type="flex" justify="start" gutter={8}>
                                    <Col span={10}>
                                        <Input placeholder="Label name"
                                               size="small"
                                               style={{fontStyle: "italic"}}
                                               ref={target => (this.newLabelName = target)}/>
                                    </Col>
                                    <Col span={4}>
                                        <Input placeholder="1"
                                               size="small"
                                               style={{fontStyle: "italic"}}
                                               ref={target => (this.newLabelValue = target)}/>
                                        <div hidden={this.state.hideColorPicker}
                                             style={{position: "absolute", zIndex: 2}}
                                             onClick={this.onColorPickerClick}
                                        >
                                            <SketchPicker
                                                ref={target => (this.colorPicker = target)}
                                                color={this.state.colorPickerColor}
                                            />
                                        </div>
                                    </Col>
                                    <Col span={3}>
                                        <div style={{
                                            backgroundColor: this.state.colorBlockColor,
                                            width: "3.5vmin",
                                            height: "98%"
                                        }}
                                             onClick={this.onColorBlockClick}/>
                                        {/*  <div hidden={this.state.hideColorPicker}
                                        style={{ position: "absolute", zIndex: 1 }}
                                        onClick={this.onColorPickerClick}
                                    >
                                        <SketchPicker
                                            ref={target => (this.colorPicker = target)}
                                            color={this.state.colorPickerColor}
                                        />
                                    </div> */}
                                    </Col>
                                    <Col>
                                        <Button size="small" onClick={this.handleAddLabel}>
                                            Add
                                        </Button>
                                    </Col>
                                </Row>
                            </div>

                            <div style={{height: 6}}/>

                            <Row type="flex" justify="space-between">
                                <Col span={18}>
                                    <div style={{fontSize: 'x-small', fontWeight: 'bold'}}>
                                        Add Annotator
                                    </div>
                                </Col>
                                <Col span={6}>
                                    <div style={{float: "right"}}>
                                        <Icon type="plus"
                                              style={{width: 18, height: 18}}
                                              onClick={this.onAnnotatorPlusIconClick}
                                        />
                                    </div>
                                </Col>
                            </Row>

                            <Row type="flex" justify="start">
                                <Col span={24}>
                                    <div className={styles.borderSpan}>
                                        <div className={styles.border}/>
                                    </div>
                                </Col>
                            </Row>

                            <div hidden={this.state.hideAddAnnotatorControls}>
                                <Row type="flex" justify="start">
                                    <Col>
                                        <div style={{color: "#ccc"}}>
                                            Username
                                        </div>
                                    </Col>
                                </Row>
                                {(this.state.annotatorCandidatesBuffer.length > 0)
                                &&
                                this.state.annotatorCandidatesBuffer.map((annotator, index) => {
                                    return (
                                        <div>
                                            <Row type="flex" justify="start" gutter={8}>
                                                <Col span={17}>
                                                    <div style={{color: "#ccc", fontStyle: "italic"}}>
                                                        {annotator}
                                                    </div>
                                                </Col>
                                                <Col>
                                                    <div style={{border: "0.2px solid #ccc"}}
                                                         onClick={this.onAnnotatorCloseIconClick}
                                                         data-index={index}
                                                    >
                                                        <Icon type="close"
                                                        />
                                                    </div>
                                                </Col>
                                            </Row>
                                            <div style={{height: 2}}/>
                                        </div>
                                    );
                                })}
                                <Row type="flex" justify="start" gutter={8}>
                                    <Col span={17}>
                                        <Input placeholder="Username of annotator"
                                               size="small"
                                               style={{fontStyle: "italic"}}
                                               ref={target => (this.newAnnotatorCandidate = target)}/>
                                    </Col>
                                    <Col>
                                        <Button size="small" onClick={this.handleAddAnnotator}>
                                            Add
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                        {/*  </InfiniteScroll> */}
                    </div>
                </Modal>

                <Modal
                    title={(<div style={{height: 12}}>Modify Instance</div>)}
                    width="35%"
                    visible={this.state.showModifyInstance}
                    onOk={this.handleModifyInstanceOk}
                    onCancel={this.handleModifyInstanceCancel}
                    destroyOnClose={true}
                    footer={[
                        <Button key="submit" type="primary" onClick={this.handleModifyInstanceOk}>
                            Save
                        </Button>,
                        <Button key="back" onClick={this.handleModifyInstanceCancel}>
                            Cancel
                        </Button>,
                    ]}
                    bodyStyle={{marginTop: 6, paddingTop: 6}}
                >
                    <div className={styles.infinitecontainer}>
                        {/*                         <InfiniteScroll
                            initialLoad={false}
                            pageStart={0}
                            useWindow={false}
                        > */}
                        <div onClick={this.onModifyInstanceModalClick}>
                            <Row type="flex" justify="start">
                                <Col span={24}>
                                    <div style={{fontSize: 'x-small', fontWeight: 'bold'}}>
                                        Instance Name
                                    </div>
                                </Col>
                            </Row>
                            <div style={{height: 6}}/>
                            <Row>
                                <Col>
                                    <Input value="0001001"
                                           disabled={true}
                                    />
                                </Col>
                            </Row>
                            <div style={{height: 6}}/>
                            <Row type="flex" justify="start">
                                <Col span={24}>
                                    <div style={{fontSize: 'x-small', fontWeight: 'bold'}}>
                                        Modality
                                    </div>
                                </Col>
                            </Row>
                            <div style={{height: 6}}/>
                            <Row>
                                <Col>
                                    <Select defaultValue="CT" style={{width: '100%'}}>
                                        <Select.Option value="CT">
                                            CT
                                        </Select.Option>
                                        <Select.Option value="ultrasound">
                                            Ultra-Sound
                                        </Select.Option>
                                        <Select.Option value="MRI">
                                            MRI
                                        </Select.Option>
                                        <Select.Option value="xray">
                                            X-ray
                                        </Select.Option>
                                        <Select.Option value="other">
                                            Other
                                        </Select.Option>
                                    </Select>
                                </Col>
                            </Row>
                            <div style={{height: 6}}/>
                            <Row type="flex" justify="start">
                                <Col span={24}>
                                    <div style={{fontSize: 'x-small', fontWeight: 'bold'}}>
                                        Description(Optional)
                                    </div>
                                </Col>
                            </Row>
                            <div style={{height: 6}}/>
                            <Row>
                                <Col>
                                    <Input.TextArea rows={3} placeholder="Please enter description"
                                                    ref={target => (this.modifyInstanceDescription = target)}/>
                                </Col>
                            </Row>
                            <div style={{height: 6}}/>
                            <Row type="flex" justify="start">
                                <Col span={24}>
                                    <div style={{fontSize: 'x-small', fontWeight: 'bold'}}>
                                        Path
                                    </div>
                                </Col>
                            </Row>
                            <div style={{height: 6}}/>
                            <Row type="flex" justify="space-between">
                                <Col span={18}>
                                    <Input placeholder="Please enter the path"
                                           ref={target => (this.modifyInstancePath = target)}/>
                                </Col>
                                <Col span={6}>
                                    <div style={{float: "right"}}>
                                        <Button type="primary" onClick={this.handleLoadDICOM}>
                                            Load
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                            <div style={{height: 6}}/>
                            <Row type="flex" justify="space-between">
                                <Col span={18}>
                                    <div style={{fontSize: 'x-small', fontWeight: 'bold'}}>
                                        Label
                                    </div>
                                </Col>
                                <Col span={6}>
                                    <div style={{float: "right"}}>
                                        <Icon type="plus"
                                              style={{width: 18, height: 18}}
                                              onClick={this.onLabelPlusIconClick}
                                        />
                                    </div>
                                </Col>
                            </Row>

                            <Row type="flex" justify="start">
                                <Col span={24}>
                                    <div className={styles.borderSpan}>
                                        <div className={styles.border}/>
                                    </div>
                                </Col>
                            </Row>

                            <div hidden={this.state.hideAddLabelControls}>
                                <Row type="flex" justify="start" gutter={8}>
                                    <Col span={10}>
                                        <div style={{color: "#ccc"}}>
                                            Name
                                        </div>
                                    </Col>
                                    <Col span={4}>
                                        <div style={{color: "#ccc"}}>
                                            Value
                                        </div>
                                    </Col>
                                    <Col span={3}>
                                        <div style={{color: "#ccc"}}>
                                            Color
                                        </div>
                                    </Col>
                                    <Col>
                                    </Col>
                                </Row>
                                {(this.state.labelCandidatesBuffer.length > 0)
                                &&
                                this.state.labelCandidatesBuffer.map((label, index) => {
                                    return (
                                        <div>
                                            <Row type="flex" justify="start" gutter={8}>
                                                <Col span={10}>
                                                    <div style={{color: "#ccc", fontStyle: "italic"}}>
                                                        {label.name}
                                                    </div>
                                                </Col>
                                                <Col span={4}>
                                                    <div style={{color: "#ccc", fontStyle: "italic"}}>
                                                        {label.value}
                                                    </div>
                                                </Col>
                                                <Col span={3}>
                                                    <div style={{
                                                        backgroundColor: label.color,
                                                        width: "3.5vmin",
                                                        height: "96%"
                                                    }}
                                                         onClick={this.onColorBlockClick}/>
                                                </Col>
                                                <Col>
                                                    <div style={{border: "0.2px solid #ccc"}}
                                                         onClick={this.onLabelCloseIconClick}
                                                         data-index={index}
                                                    >
                                                        <Icon type="close"
                                                            //onClick={this.onLabelCloseIconClick}
                                                            //data-index={index}
                                                        />
                                                    </div>
                                                </Col>
                                            </Row>
                                            <div style={{height: 2}}/>
                                        </div>
                                    );
                                })}
                                <Row type="flex" justify="start" gutter={8}>
                                    <Col span={10}>
                                        <Input placeholder="Label name"
                                               size="small"
                                               style={{fontStyle: "italic"}}
                                               ref={target => (this.newLabelName = target)}/>
                                    </Col>
                                    <Col span={4}>
                                        <Input placeholder="1"
                                               size="small"
                                               style={{fontStyle: "italic"}}
                                               ref={target => (this.newLabelValue = target)}/>
                                        <div hidden={this.state.hideColorPicker}
                                             style={{position: "absolute", zIndex: 1}}
                                             onClick={this.onColorPickerClick}
                                        >
                                            <SketchPicker
                                                ref={target => (this.colorPicker = target)}
                                                color={this.state.colorPickerColor}
                                            />
                                        </div>
                                    </Col>
                                    <Col span={3}>
                                        <div style={{
                                            backgroundColor: this.state.colorBlockColor,
                                            width: "3.5vmin",
                                            height: "98%"
                                        }}
                                             onClick={this.onColorBlockClick}/>
                                        {/*  <div hidden={this.state.hideColorPicker}
                                        style={{ position: "absolute", zIndex: 1 }}
                                        onClick={this.onColorPickerClick}
                                    >
                                        <SketchPicker
                                            ref={target => (this.colorPicker = target)}
                                            color={this.state.colorPickerColor}
                                        />
                                    </div> */}
                                    </Col>
                                    <Col>
                                        <Button size="small" onClick={this.handleAddLabel}>
                                            Add
                                        </Button>
                                    </Col>
                                </Row>
                            </div>

                            <div style={{height: 6}}/>

                            <Row type="flex" justify="space-between">
                                <Col span={18}>
                                    <div style={{fontSize: 'x-small', fontWeight: 'bold'}}>
                                        Add Annotator
                                    </div>
                                </Col>
                                <Col span={6}>
                                    <div style={{float: "right"}}>
                                        <Icon type="plus"
                                              style={{width: 18, height: 18}}
                                              onClick={this.onAnnotatorPlusIconClick}
                                        />
                                    </div>
                                </Col>
                            </Row>

                            <Row type="flex" justify="start">
                                <Col span={24}>
                                    <div className={styles.borderSpan}>
                                        <div className={styles.border}/>
                                    </div>
                                </Col>
                            </Row>

                            <div hidden={this.state.hideAddAnnotatorControls}>
                                <Row type="flex" justify="start">
                                    <Col>
                                        <div style={{color: "#ccc"}}>
                                            Username
                                        </div>
                                    </Col>
                                </Row>
                                {(this.state.annotatorCandidatesBuffer.length > 0)
                                &&
                                this.state.annotatorCandidatesBuffer.map((annotator, index) => {
                                    return (
                                        <div>
                                            <Row type="flex" justify="start" gutter={8}>
                                                <Col span={17}>
                                                    <div style={{color: "#ccc", fontStyle: "italic"}}>
                                                        {annotator}
                                                    </div>
                                                </Col>
                                                <Col>
                                                    <div style={{border: "0.2px solid #ccc"}}
                                                         onClick={this.onAnnotatorCloseIconClick}
                                                         data-index={index}
                                                    >
                                                        <Icon type="close"
                                                        />
                                                    </div>
                                                </Col>
                                            </Row>
                                            <div style={{height: 2}}/>
                                        </div>
                                    );
                                })}
                                <Row type="flex" justify="start" gutter={8}>
                                    <Col span={17}>
                                        <Input placeholder="Username of annotator"
                                               size="small"
                                               style={{fontStyle: "italic"}}
                                               ref={target => (this.newAnnotatorCandidate = target)}/>
                                    </Col>
                                    <Col>
                                        <Button size="small" onClick={this.handleAddAnnotator}>
                                            Add
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                        {/* </InfiniteScroll> */}
                    </div>
                </Modal>
                <Modal
                    title={(<div style={{height: 12}}>Studies List</div>)}
                    width="85%"
                    visible={this.state.showInstanceDetail}
                    onOk={this.handleInstanceDetailOk}
                    onCancel={this.handleInstanceDetailOk}
                    destroyOnClose={true}
                    footer={[
                        <Button key="submit" type="primary" onClick={this.handleInstanceDetailOk}>
                            Ok
                        </Button>,
                        <Button key="back" onClick={this.handleInstanceDetailOk}>
                            Cancel
                        </Button>,
                    ]}
                    bodyStyle={{marginTop: 6, paddingTop: 6}}
                >
                    <Row type="flex" justify="center" align="middle">
                        <Col span={24}>
                            <div style={{textAlign: "center"}}>
                                <h2>Studies List of Instance 0001001</h2>
                            </div>
                        </Col>
                    </Row>
                    <Row type="flex" justify="start">
                        <Col span={24}>
                            <Table columns={this.studiesListTableColumns}
                                   dataSource={this.studiesListTableData}
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
                </Modal>
            </div>)
    }


} 