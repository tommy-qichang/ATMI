import React from 'react';
import { Button, Col, Icon, Input, message, Modal, Progress, Row, Select, Table, Popconfirm } from 'antd';
//import {SketchPicker} from 'react-color';
import StudyList from './StudyList';
import styles from '../../styles/ManagementPanel.css';
import axios from "axios";
//import InfiniteScroll from 'react-infinite-scroller';

export default class MainManagementPanel extends React.Component {

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
        //showInstanceDetail: false,
        hideColorPicker: true,
        colorBlockColor: "#FF8000",
        colorPickerColor: "#FF8000",
        labelCandidatesBuffer: [],
        annotatorCandidatesBuffer: [],
        hideAddLabelControls: false,
        hideAddAnnotatorControls: false,
        userTableData: [],
        instanceTableData: [],
        hideMainPanel: false,
        hideStudyList: true,
        defaultNewLabelValue: 1
    };

    newUsername = null;
    newInstanceName = null;
    newInstanceModality = "CT";
    newInstanceDescription = null;
    newInstancePath = null;
    newLabelName = null;
    newLabelValue = null;
    newAnnotatorCandidate = null;
    modifyInstanceDescription = null;
    modifyInstancePath = null;
    labelCandidatesBuffer = [];
    annotatorCandidatesBuffer = [];
    existingMaxLabelValue = 0;

    //For forntend dev
/*     
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

  */
/*     userTableData = [
        {
            username: "fuhua06@gmail.com",
            usertype: "Admin"
        },
        {
            username: "598561408@qq.com",
            usertype: "Annotator"
        }
    ]; */

    listAllUsers = () => {
        axios.get("/user/").then(res => {
            let userTableData = []
            const user = res.data;
            for (let i = 0; i < user.length; i++) {
                userTableData.push({
                    username: user[i].email,
                    nickname: user[i].name,
                    usertype: user[i].user_type == 0 ? "Admin" : "Annotator"
                })
            }
            this.setState({"userTableData": userTableData})
        }).catch(error => {
            message.error('List user error');
            console.log(error)
        })
    };

    componentDidMount() {
        this.listAllUsers();
        this.listAllInstance();
    }

    listAllInstance = () => {
        axios.get("/instances").then(res => {
            let instanceTableData = [];
            const instances = res.data;
            for (let i = 0; i < instances.length; i++) {
                let progress = Math.round((instances[i]['annotated_num'] / instances[i]['study_num']) * 100);
                instanceTableData.push({
                    'instanceid': instances[i]['instance_id'],
                    'name': instances[i]['name'],
                    'modality': instances[i]['modality'],
                    'description': instances[i]['description'],
                    'progress': progress,
                    'data_path': instances[i]['data_path']
                });
            }
            this.setState({"instanceTableData": instanceTableData})
        }).catch(error => {
            message.error('Instance list error');
            console.log(error)
        })
    };

    onNewUserButtonClick = e => {
        this.setState({
            showAddUser: true
        });
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

    onUserTablePageChange = page => {
        this.setState({
            currentUserTablePage: page,
        });
        //window.scrollTo(0,0); 
    };

    onNewInstanceButtonClick = e => {
        this.setState({
            showAddInstance: true
        });
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

    onInstanceTablePageChange = page => {
        this.setState({
            currentInstanceTablePage: page,
        });
        //window.scrollTo(0,0); 
    };

    handleAddUserOk = e => {
        this.checkEmail();
        //Add user into the backend

        this.listAllUsers();
    };

    handleAddUserCancel = e => {
        this.setState({
            showAddUser: false
        });
    };

    checkEmail = () => {
        let reg = /^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i;
        if (!this.newUsername || !this.newUsername.input) {
            return;
        }
        let username = this.newUsername.input.value;
        if (reg.test(username)) {
            this.proccessAddUser(username);
        } else {
            message.error("Please enter username of email format", 2);
        }
    };

    proccessAddUser = username => {
        message.success("Sucessfully added user and sent email to user", 2);
        this.setState({
            showAddUser: false
        });
    };

    handleAddInstanceOk = e => {
        //Add instance into the backend
        //New added labels are cached in this.labelCandidatesBuffer
        //New added annotatos are cached in this.annotatorCandidatesBuffer
        let cleanValue = this.newInstanceName.input.value.replace(/[\ ]/g,"").replace(/\s*/g, "");
        if(cleanValue === "") 
        {
            message.error("Instance name can not be empty");
            return;
        }

/*         console.log("this.newInstanceName: ", this.newInstanceName.input.value);
        console.log("this.newInstanceModality: ", this.newInstanceModality);
        console.log("this.newInstanceDescription: ", this.newInstanceDescription.textAreaRef.value);
        console.log("this.this.labelCandidatesBuffer: ", this.labelCandidatesBuffer);
        console.log("this.annotatorCandidatesBuffer: ", this.annotatorCandidatesBuffer); */

        let newInstanceData = {
            name: this.newInstanceName.input.value, 
            modality: this.newInstanceModality, 
            description:this.newInstanceDescription.textAreaRef.value
        };

        //Uncomment when the backend is ready
/*         axios.post(newInstanceData).then(res => {
           
        }).catch(error => {
            message.error('Add instance error');
            console.log(error);
        }); */

        

        this.labelCandidatesBuffer = [];
        this.annotatorCandidatesBuffer = [];
        this.newInstanceModality = "CT";
        this.existingMaxLabelValue = 0;
        this.setState({
            showAddInstance: false,
            hideColorPicker: true,
            labelCandidatesBuffer: [],
            annotatorCandidatesBuffer: [],
            hideAddLabelControls: false,
            hideAddAnnotatorControls: false,
            defaultNewLabelValue: 1
        });
    };

    handleAddInstanceCancel = e => {
        this.labelCandidatesBuffer = [];
        this.annotatorCandidatesBuffer = [];
        this.newInstanceModality = "CT";
        this.existingMaxLabelValue = 0;
        this.setState({
            showAddInstance: false,
            hideColorPicker: true,
            labelCandidatesBuffer: [],
            annotatorCandidatesBuffer: [],
            hideAddLabelControls: false,
            hideAddAnnotatorControls: false,
            defaultNewLabelValue: 1
        });
    };

    onAddInstanceModalClick = e => {
        this.setState({
            hideColorPicker: true
        });
    };

    handleLoadDICOM = e => {

    };

    onLabelPlusIconClick = e => {
        this.setState({
            hideAddLabelControls: !this.state.hideAddLabelControls
        });
    };

    onLabelCloseIconClick = e => {
        //console.log("e.target.dataset.index: ", e.currentTarget.dataset.index);
        let deletedValue = this.labelCandidatesBuffer[e.currentTarget.dataset.index].value;        
        this.labelCandidatesBuffer.splice(e.currentTarget.dataset.index, 1);
        if(this.labelCandidatesBuffer.length === 0)
        {
            this.existingMaxLabelValue = 0;
        }
        else if(deletedValue === this.existingMaxLabelValue)
        {
            let secondMaxValue = 1;
            this.labelCandidatesBuffer.forEach(element => {
                if(element.value > secondMaxValue)
                {
                    secondMaxValue = element.value;
                }
            });
            this.existingMaxLabelValue = secondMaxValue;
        }

        this.setState({
            labelCandidatesBuffer: this.labelCandidatesBuffer,
            defaultNewLabelValue: this.existingMaxLabelValue + 1
        });
    };

    handleAddLabel = e => {
        //Verify the input
        if(this.newLabelName.input.value.replace(/[\ ]/g,"").replace(/\s*/g, "") === "")
        {
            message.error("Label name can not be empty");
            return;
        }
        if(this.newLabelValue.input.value.replace(/[\ ]/g,"").replace(/\s*/g, "") === "")
        {
            message.error("Label value can not be empty");
            return;
        }
        let inputValue = parseInt(this.newLabelValue.input.value);
        if(!inputValue)
        {
            message.error("Label value must be a number");
            return;
        }
        if(this.labelCandidatesBuffer.findIndex((element, index, arr) => {
            return element.value === inputValue;
        }) > -1) 
        {
            message.error("This value of label has already existed");
            return;
        }

        this.labelCandidatesBuffer.push({
            name: this.newLabelName.input.value,
            value: parseInt(this.newLabelValue.input.value),
            //color: this.state.colorBlockColor
        });

        this.existingMaxLabelValue = 
        parseInt(this.newLabelValue.input.value)>this.existingMaxLabelValue?
        parseInt(this.newLabelValue.input.value):this.existingMaxLabelValue;

        this.setState({
            labelCandidatesBuffer: this.labelCandidatesBuffer,
            defaultNewLabelValue: this.existingMaxLabelValue + 1
            //colorBlockColor: "#FF8000"
        });

        this.newLabelName.input.value = "";
        this.newLabelValue.input.value = "";
    };

    onAnnotatorPlusIconClick = e => {
        this.setState({
            hideAddAnnotatorControls: !this.state.hideAddAnnotatorControls
        });
    };

    
    onAnnotatorCloseIconClick = e => {
        //console.log("e.target.dataset.index: ", e.currentTarget.dataset.index);
        this.annotatorCandidatesBuffer.splice(e.currentTarget.dataset.index, 1);
        this.setState({
            annotatorCandidatesBuffer: this.annotatorCandidatesBuffer
        });
    };

    handleAddAnnotator = e => {
        this.annotatorCandidatesBuffer.push(
            this.newAnnotatorCandidate.input.value
        );
        this.setState({
            annotatorCandidatesBuffer: this.annotatorCandidatesBuffer,
        });
        this.newAnnotatorCandidate.input.value = "";
    };

    handleModifyInstanceOk = e => {
        //Modify instance in the backend
        //Modified labels are cached in this.labelCandidatesBuffer
        //Modified annotatos are cached in this.annotatorCandidatesBuffer

        this.labelCandidatesBuffer = [];
        this.annotatorCandidatesBuffer = [];
        this.setState({
            showModifyInstance: false,
            hideColorPicker: true,
            labelCandidatesBuffer: [],
            annotatorCandidatesBuffer: [],
            hideAddLabelControls: false,
            hideAddAnnotatorControls: false
        });
    };

    handleModifyInstanceCancel = e => {
        this.labelCandidatesBuffer = [];
        this.annotatorCandidatesBuffer = [];
        this.setState({
            showModifyInstance: false,
            hideColorPicker: true,
            labelCandidatesBuffer: [],
            annotatorCandidatesBuffer: [],
            hideAddLabelControls: false,
            hideAddAnnotatorControls: false
        });
    };

    onInstanceDetailClick = e => {
        this.props.onInstanceDetailClick();
    };

    onModifyInstanceClick = (record) => {
        //Load instance data from the backend
        //The parameter "record" means the table record of the instance
        
        this.setState({
            showModifyInstance: true
        });
    };

    onDeleteUserConfirm = (record) => {
        //Delete record from the backend
        axios.delete(`/users/${record.username}`).then(res => {
            this.listAllUsers();
            message.success('User has been deleted', 2);
        }).catch(error => {
            message.error('Delete user error');
            console.log(error);
        });
    };

    onDeleteInstanceConfirm = (record) => {
        //Delete record from the backend
        axios.delete(`/instances/${record.instanceid}`).then(res => {
            this.listAllInstance();
            message.success('Instance has been deleted', 2); 
        }).catch(error => {
            message.error('Delete Instance error');
            console.log(error);
        });
    };

    onNewInstanceModalityChange = (value) => {
        this.newInstanceModality = value;
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
                    <Popconfirm title="Delete User?" onConfirm={() => this.onDeleteUserConfirm(record)} /* data-hscode={record.HSCode} */ okText="Yes" cancelText="No">
                    <a href="javascript:;"><img src="./assets/static/img/delete.png" title='Delete this user'
                        alt='Delete User' style={{
                            width: 18,
                            height: 18
                        }}></img></a>
                     </Popconfirm>
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
                    <a href="javascript:;" title="Show studies list" style={{ color: "#0099FF" }}
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
                    <Progress percent={text} showInfo={false} strokeColor="#87d068" />
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
                                }}></img></a>
                        </Col>
                        <Col span={6}>
                            <a href="javascript:;"><img src="./assets/static/img/details.png" title='Show studies list'
                                alt='Show studies list' style={{ width: 18, height: 18 }}
                                onClick={this.onInstanceDetailClick}></img></a>
                        </Col>
                        <Col span={6}>
                            <a href="javascript:;"><img src="./assets/static/img/modify.png" title='Modify' alt='Modify'
                                style={{ width: 18, height: 18 }}
                                onClick={() => this.onModifyInstanceClick(record)}></img></a>
                        </Col>
                        <Col span={6}>
                        <Popconfirm title="Delete Instance?" onConfirm={() => this.onDeleteInstanceConfirm(record)} /* data-hscode={record.HSCode} */ okText="Yes" cancelText="No">
                            <a href="javascript:;"><img src="./assets/static/img/delete.png"
                                title='Delete this instance' alt='Delete Instance' style={{
                                    width: 18,
                                    height: 18
                                }}></img></a>
                        </Popconfirm>
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
                    <Col span={8}>
                        <Button icon="plus" type="primary" ghost
                            onClick={this.onNewUserButtonClick}>
                            New User
                        </Button>
                    </Col>
                    <Col span={8}>
                        <div style={{ textAlign: "center" }}>
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
                            /* dataSource={this.userTableData} */
                            /* bordered  */
                            size="middle"
                            loading={this.state.userTableLoading}
                            actionToken={this.state.userTableActionToken}
                            onRow={this.onUserTableRow}
                            //rowClassName={this.setRowClassName}
                            locale={{
                                filterTitle: 'Filter',
                                filterConfirm: 'Confirm',
                                filterReset: 'Reset',
                                emptyText: 'No Data',
                            }}
                            pagination={{
                                current: this.state.currentUserTablePage,
                                onChange: this.onUserTablePageChange,
                                showSizeChanger: true,
                                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                            }}
                        />
                    </Col>
                </Row>
                <br />
                <Row type="flex" justify="center" align="middle">
                    <Col span={8}>
                        <Button icon="plus" type="primary" ghost
                            onClick={this.onNewInstanceButtonClick}>
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
                            //dataSource={this.instanceTableData}
                            dataSource={this.state.instanceTableData}
                            /* bordered  */
                            size="middle"
                            loading={this.state.instanceTableLoading}
                            actionToken={this.state.instanceTableActionToken}
                            onRow={this.onInstanceTableRow}
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
                                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                            }}
                        />
                    </Col>
                </Row>
                <Modal
                    title={(<div style={{ height: 12 }}>Add User</div>)}
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
                    bodyStyle={{ marginTop: 6, paddingTop: 6 }}
                >
                    <Row type="flex" justify="start">
                        <Col span={24}>
                            <div style={{ fontSize: 'x-small', fontWeight: 'bold' }}>
                                Username
                            </div>
                        </Col>
                    </Row>
                    <div style={{ height: 6 }} />
                    <Row>
                        <Col>
                            <Input placeholder="Please enter username (email format)"
                                ref={target => (this.newUsername = target)} />
                        </Col>
                    </Row>
                    <div style={{ height: 6 }} />
                    <Row type="flex" justify="start">
                        <Col span={24}>
                            <div style={{ fontSize: 'x-small', fontWeight: 'bold' }}>
                                User Type
                            </div>
                        </Col>
                    </Row>
                    <div style={{ height: 6 }} />
                    <Row>
                        <Col>
                            <Select defaultValue="admin" style={{ width: '100%' }}>
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
                    title={(<div style={{ height: 12 }}>Create Instance</div>)}
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
                    bodyStyle={{ marginTop: 6, paddingTop: 6 }}
                >
                    <div className={styles.infinitecontainer}>
                        <div onClick={this.onAddInstanceModalClick}>
                            <Row type="flex" justify="start">
                                <Col span={24}>
                                    <div style={{ fontSize: 'x-small', fontWeight: 'bold' }}>
                                        Instance Name
                                    </div>
                                </Col>
                            </Row>
                            <div style={{ height: 6 }} />
                            <Row>
                                <Col>
                                    <Input placeholder="Please enter instance name"
                                        ref={target => (this.newInstanceName = target)} />
                                </Col>
                            </Row>
                            <div style={{ height: 6 }} />
                            <Row type="flex" justify="start">
                                <Col span={24}>
                                    <div style={{ fontSize: 'x-small', fontWeight: 'bold' }}>
                                        Modality
                                    </div>
                                </Col>
                            </Row>
                            <div style={{ height: 6 }} />
                            <Row>
                                <Col>
                                    <Select defaultValue="CT" style={{ width: '100%' }}
                                     /* ref={target => (this.newInstanceModality = target)} */
                                     onChange={this.onNewInstanceModalityChange}>
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
                            <div style={{ height: 6 }} />
                            <Row type="flex" justify="start">
                                <Col span={24}>
                                    <div style={{ fontSize: 'x-small', fontWeight: 'bold' }}>
                                        Description(Optional)
                                    </div>
                                </Col>
                            </Row>
                            <div style={{ height: 6 }} />
                            <Row>
                                <Col>
                                    <Input.TextArea rows={3} placeholder="Please enter description"
                                        ref={target => (this.newInstanceDescription = target)} />
                                </Col>
                            </Row>
                            <div style={{ height: 6 }} />
                            {/* <Row type="flex" justify="start">
                                <Col span={24}>
                                    <div style={{ fontSize: 'x-small', fontWeight: 'bold' }}>
                                        Path
                                    </div>
                                </Col>
                            </Row>
                            <div style={{ height: 6 }} />
                            <Row type="flex" justify="space-between">
                                <Col span={18}>
                                    <Input placeholder="Please enter the path"
                                        ref={target => (this.newInstancePath = target)} />
                                </Col>
                                <Col span={6}>
                                    <div style={{ float: "right" }}>
                                        <Button type="primary" onClick={this.handleLoadDICOM}>
                                            Load
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                            <div style={{ height: 6 }} /> */}
                            <Row type="flex" justify="space-between">
                                <Col span={18}>
                                    <div style={{ fontSize: 'x-small', fontWeight: 'bold' }}>
                                        Label
                                    </div>
                                </Col>
                                <Col span={6}>
                                    <div style={{ float: "right" }}>
                                        <Icon type="plus"
                                            style={{ width: 18, height: 18 }}
                                            onClick={this.onLabelPlusIconClick}
                                        />
                                    </div>
                                </Col>
                            </Row>

                            <Row type="flex" justify="start">
                                <Col span={24}>
                                    <div className={styles.borderSpan}>
                                        <div className={styles.border} />
                                    </div>
                                </Col>
                            </Row>

                            <div hidden={this.state.hideAddLabelControls}>
                                <Row type="flex" justify="start" gutter={8}>
                                    <Col span={10}>
                                        <div style={{ color: "#ccc" }}>
                                            Name
                                        </div>
                                    </Col>
                                    <Col span={4}>
                                        <div style={{ color: "#ccc" }}>
                                            Value
                                        </div>
                                    </Col>
                                    <Col span={3}>
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
                                                        <div style={{ fontStyle: "italic" }}>
                                                            {label.name}
                                                        </div>
                                                    </Col>
                                                    <Col span={4}>
                                                        <div style={{ fontStyle: "italic" }}>
                                                            {label.value}
                                                        </div>
                                                    </Col>
                                                    <Col span={3}>
                                                    </Col>
                                                    <Col>
                                                        <div style={{ border: "0.2px solid #ccc" }}
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
                                                <div style={{ height: 2 }} />
                                            </div>
                                        );
                                    })}
                                <Row type="flex" justify="start" gutter={8}>
                                    <Col span={10}>
                                        <Input placeholder="Label name"
                                            size="small"
                                            style={{ fontStyle: "italic" }}
                                            ref={target => (this.newLabelName = target)} />
                                    </Col>
                                    <Col span={4}>
                                        <Input placeholder={this.state.defaultNewLabelValue}
                                            size="small"
                                            style={{ fontStyle: "italic" }}
                                            ref={target => (this.newLabelValue = target)} />
                                    </Col>
                                    <Col span={3}>
                                    </Col>
                                    <Col>
                                        <Button size="small" onClick={this.handleAddLabel}>
                                            Add
                                        </Button>
                                    </Col>
                                </Row>
                            </div>

                            <div style={{ height: 6 }} />

                            <Row type="flex" justify="space-between">
                                <Col span={18}>
                                    <div style={{ fontSize: 'x-small', fontWeight: 'bold' }}>
                                        Add Annotator
                                    </div>
                                </Col>
                                <Col span={6}>
                                    <div style={{ float: "right" }}>
                                        <Icon type="plus"
                                            style={{ width: 18, height: 18 }}
                                            onClick={this.onAnnotatorPlusIconClick}
                                        />
                                    </div>
                                </Col>
                            </Row>

                            <Row type="flex" justify="start">
                                <Col span={24}>
                                    <div className={styles.borderSpan}>
                                        <div className={styles.border} />
                                    </div>
                                </Col>
                            </Row>

                            <div hidden={this.state.hideAddAnnotatorControls}>
                                <Row type="flex" justify="start">
                                    <Col>
                                        <div style={{ color: "#ccc" }}>
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
                                                        <div style={{ fontStyle: "italic" }}>
                                                            {annotator}
                                                        </div>
                                                    </Col>
                                                    <Col>
                                                        <div style={{ border: "0.2px solid #ccc" }}
                                                            onClick={this.onAnnotatorCloseIconClick}
                                                            data-index={index}
                                                        >
                                                            <Icon type="close"
                                                            />
                                                        </div>
                                                    </Col>
                                                </Row>
                                                <div style={{ height: 2 }} />
                                            </div>
                                        );
                                    })}
                                <Row type="flex" justify="start" gutter={8}>
                                    <Col span={17}>
                                        <Input placeholder="Username of annotator"
                                            size="small"
                                            style={{ fontStyle: "italic" }}
                                            ref={target => (this.newAnnotatorCandidate = target)} />
                                    </Col>
                                    <Col>
                                        <Button size="small" onClick={this.handleAddAnnotator}>
                                            Add
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </div>
                </Modal>

                <Modal
                    title={(<div style={{ height: 12 }}>Modify Instance</div>)}
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
                    bodyStyle={{ marginTop: 6, paddingTop: 6 }}
                >
                    <div className={styles.infinitecontainer}>
                        <div onClick={this.onModifyInstanceModalClick}>
                            <Row type="flex" justify="start">
                                <Col span={24}>
                                    <div style={{ fontSize: 'x-small', fontWeight: 'bold' }}>
                                        Instance Name
                                    </div>
                                </Col>
                            </Row>
                            <div style={{ height: 6 }} />
                            <Row>
                                <Col>
                                    <Input value="0001001"
                                        disabled={true}
                                    />
                                </Col>
                            </Row>
                            <div style={{ height: 6 }} />
                            <Row type="flex" justify="start">
                                <Col span={24}>
                                    <div style={{ fontSize: 'x-small', fontWeight: 'bold' }}>
                                        Modality
                                    </div>
                                </Col>
                            </Row>
                            <div style={{ height: 6 }} />
                            <Row>
                                <Col>
                                    <Select defaultValue="CT" style={{ width: '100%' }}>
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
                            <div style={{ height: 6 }} />
                            <Row type="flex" justify="start">
                                <Col span={24}>
                                    <div style={{ fontSize: 'x-small', fontWeight: 'bold' }}>
                                        Description(Optional)
                                    </div>
                                </Col>
                            </Row>
                            <div style={{ height: 6 }} />
                            <Row>
                                <Col>
                                    <Input.TextArea rows={3} placeholder="Please enter description"
                                        ref={target => (this.modifyInstanceDescription = target)} />
                                </Col>
                            </Row>
                            <div style={{ height: 6 }} />
                            <Row type="flex" justify="start">
                                <Col span={24}>
                                    <div style={{ fontSize: 'x-small', fontWeight: 'bold' }}>
                                        Path
                                    </div>
                                </Col>
                            </Row>
                            <div style={{ height: 6 }} />
                            <Row type="flex" justify="space-between">
                                <Col span={18}>
                                    <Input placeholder="Please enter the path"
                                        ref={target => (this.modifyInstancePath = target)} />
                                </Col>
                                <Col span={6}>
                                    <div style={{ float: "right" }}>
                                        <Button type="primary" onClick={this.handleLoadDICOM}>
                                            Load
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                            <div style={{ height: 6 }} />
                            <Row type="flex" justify="space-between">
                                <Col span={18}>
                                    <div style={{ fontSize: 'x-small', fontWeight: 'bold' }}>
                                        Label
                                    </div>
                                </Col>
                                <Col span={6}>
                                    <div style={{ float: "right" }}>
                                        <Icon type="plus"
                                            style={{ width: 18, height: 18 }}
                                            onClick={this.onLabelPlusIconClick}
                                        />
                                    </div>
                                </Col>
                            </Row>

                            <Row type="flex" justify="start">
                                <Col span={24}>
                                    <div className={styles.borderSpan}>
                                        <div className={styles.border} />
                                    </div>
                                </Col>
                            </Row>

                            <div hidden={this.state.hideAddLabelControls}>
                                <Row type="flex" justify="start" gutter={8}>
                                    <Col span={10}>
                                        <div style={{ color: "#ccc" }}>
                                            Name
                                        </div>
                                    </Col>
                                    <Col span={4}>
                                        <div style={{ color: "#ccc" }}>
                                            Value
                                        </div>
                                    </Col>
                                    <Col span={3}>
                                        <div style={{ color: "#ccc" }}>
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
                                                        <div style={{ fontStyle: "italic" }}>
                                                            {label.name}
                                                        </div>
                                                    </Col>
                                                    <Col span={4}>
                                                        <div style={{ fontStyle: "italic" }}>
                                                            {label.value}
                                                        </div>
                                                    </Col>
                                                    <Col span={3}>
                                                    </Col>
                                                    <Col>
                                                        <div style={{ border: "0.2px solid #ccc" }}
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
                                                <div style={{ height: 2 }} />
                                            </div>
                                        );
                                    })}
                                <Row type="flex" justify="start" gutter={8}>
                                    <Col span={10}>
                                        <Input placeholder="Label name"
                                            size="small"
                                            style={{ fontStyle: "italic" }}
                                            ref={target => (this.newLabelName = target)} />
                                    </Col>
                                    <Col span={4}>
                                        <Input placeholder="1"
                                            size="small"
                                            style={{ fontStyle: "italic" }}
                                            ref={target => (this.newLabelValue = target)} />
                                    </Col>
                                    <Col span={3}>
                                    </Col>
                                    <Col>
                                        <Button size="small" onClick={this.handleAddLabel}>
                                            Add
                                        </Button>
                                    </Col>
                                </Row>
                            </div>

                            <div style={{ height: 6 }} />

                            <Row type="flex" justify="space-between">
                                <Col span={18}>
                                    <div style={{ fontSize: 'x-small', fontWeight: 'bold' }}>
                                        Add Annotator
                                    </div>
                                </Col>
                                <Col span={6}>
                                    <div style={{ float: "right" }}>
                                        <Icon type="plus"
                                            style={{ width: 18, height: 18 }}
                                            onClick={this.onAnnotatorPlusIconClick}
                                        />
                                    </div>
                                </Col>
                            </Row>

                            <Row type="flex" justify="start">
                                <Col span={24}>
                                    <div className={styles.borderSpan}>
                                        <div className={styles.border} />
                                    </div>
                                </Col>
                            </Row>

                            <div hidden={this.state.hideAddAnnotatorControls}>
                                <Row type="flex" justify="start">
                                    <Col>
                                        <div style={{ color: "#ccc" }}>
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
                                                        <div style={{ fontStyle: "italic" }}>
                                                            {annotator}
                                                        </div>
                                                    </Col>
                                                    <Col>
                                                        <div style={{ border: "0.2px solid #ccc" }}
                                                            onClick={this.onAnnotatorCloseIconClick}
                                                            data-index={index}
                                                        >
                                                            <Icon type="close"
                                                            />
                                                        </div>
                                                    </Col>
                                                </Row>
                                                <div style={{ height: 2 }} />
                                            </div>
                                        );
                                    })}
                                <Row type="flex" justify="start" gutter={8}>
                                    <Col span={17}>
                                        <Input placeholder="Username of annotator"
                                            size="small"
                                            style={{ fontStyle: "italic" }}
                                            ref={target => (this.newAnnotatorCandidate = target)} />
                                    </Col>
                                    <Col>
                                        <Button size="small" onClick={this.handleAddAnnotator}>
                                            Add
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
        )
    }
}
