import React from 'react';
import { Button, Col, Icon, Input, message, Modal, Progress, Row, Select, Table, Popconfirm, Checkbox } from 'antd';
//import {SketchPicker} from 'react-color';
import StudyList from './StudyList';
import styles from '../../styles/ListPanel.css';
import axios from "axios";
//import InfiniteScroll from 'react-infinite-scroller';
import Reg from '../utility/Reg';

export default class List extends React.Component {

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
        hideAddLabelControls: false,
        hideAddAnnotatorControls: false,
        userTableData: [],
        instanceTableData: [],
        studiesListTableData: [],
        hideMainPanel: false,
        hideStudyList: true,
        defaultNewLabelValue: 1,
        current_instance_id: "",
        userRightsMatrix: [], //To cache the user rights settings in creat/modify instance windows
        modifiedInstanceName: "",
        modifiedInstanceModality: "",
        modifiedInstanceDescription: "",
        hideProgressBar: true,
        showImportdcm: false,
        importingInstanceName: ""
    };

    newUserName = null;
    newInstanceName = null;
    newInstanceModality = "CT";
    newInstanceDescription = null;
    newInstancePath = null;
    newLabelName = null;
    newLabelValue = null;
    newAnnotatorCandidate = null;
    modifiedInstanceName = null;
    modifiedInstanceModality = null;
    modifiedInstanceDescription = null;
    modifyInstancePath = null;
    labelCandidatesBuffer = [];
    annotatorCandidatesBuffer = [];
    existingMaxLabelValue = 0;
    annotator_id = [];
    auditor_id = [];
    originalInstanceData = {}; //Original instance data before modified
    currentModifiedInstanceId = null;
    importingInstanceId = null; //Id of the instance that user imports dcm into
    dcmPath = null; //The folder path that user imports dcm from


    componentDidMount() {
        this.listAllUsers();
        this.listAllInstance();
    }

    componentDidUpdate() {
        //this.listAllUsers();
        //this.listAllInstance();
    }

    listAllUsers = () => {
        axios.get("/user/").then(res => {
            let userTableData = []
            const user = res.data;
            for (let i = 0; i < user.length; i++) {
                userTableData.push({
                    username: user[i].email,
                    nickname: user[i].name,
                    usertype: user[i].user_type == 0 ? "Admin" : "Annotator",
                    userid: user[i].user_id
                })
            }
            this.setState({ "userTableData": userTableData })
        }).catch(error => {
            message.error('List user error');
            console.log(error)
        });
    };


    listAllInstance = () => {
        axios.get("/instances").then(res => {
            let instanceTableData = [];
            const instances = res.data;
            for (let i = 0; i < instances.length; i++) {
                let progress = 0;
                if (instances[i]['study_num']) {
                    progress = Math.round((instances[i]['annotated_num'] / instances[i]['study_num']) * 100);
                }
                instanceTableData.push({
                    'instanceid': instances[i]['instance_id'],
                    'name': instances[i]['name'],
                    'modality': instances[i]['modality'],
                    'description': instances[i]['description'],
                    'progress': progress,
                    'data_path': instances[i]['data_path'],
                    'status': instances[i]['status']
                });
            }
            this.setState({ "instanceTableData": instanceTableData })
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
        let userRightsMatrix = [];
        this.state.userTableData.forEach(userRecord => {
            userRightsMatrix.push({
                username: userRecord.username,
                userid: userRecord.userid,
                isAnnotator: false,
                isAuditor: false
            });
        });
        this.setState({
            showAddInstance: true,
            userRightsMatrix
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
        //let reg = /^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i;
        let reg = Reg.checkEmail;
        if (!this.newUserName || !this.newUserName.input) {
            return;
        }
        let userName = this.newUserName.input.value;
        let dispName = this.newUserDispName.input.value;
        let userType = this.newUserType.rcSelect.state.value[0];
        //userType = (userType === "Admin") ? 0 : 1;
        if (reg.test(userName)) {
            this.proccessAddUser(userName, dispName, userType);
        } else {
            message.error("Please enter username of email format", 2);
        }
    };

    proccessAddUser = (username, dispname, type) => {
        axios.post("/user", { 'email': username, 'name': dispname, 'user_type': type }).then(res => {
            let url = res.data.url
            message.success("URL: " + url, 10);
            this.setState({
                showAddUser: false
            });
        }).catch(error => {
            message.error('User add error');
            console.log(error)
        });
    };

    handleAddInstanceOk = e => {
        //Add instance into the backend
        //New added labels are cached in this.labelCandidatesBuffer
        //New added annotatos are cached in this.annotatorCandidatesBuffer

        //let cleanValue = this.newInstanceName.input.value.replace(/[\ ]/g, "").replace(/\s*/g, "");
/*         if (cleanValue === "") {
            message.error("Instance name can not be empty");
            return;
        } */

        if (Reg.isStringEmpty(this.newInstanceName.input.value)) {
            message.error("Instance name can not be empty");
            return;
        }

        /*         console.log("this.newInstanceName: ", this.newInstanceName.input.value);
                console.log("this.newInstanceModality: ", this.newInstanceModality);
                console.log("this.newInstanceDescription: ", this.newInstanceDescription.textAreaRef.value);
                console.log("this.this.labelCandidatesBuffer: ", this.labelCandidatesBuffer);
                console.log("this.annotatorCandidatesBuffer: ", this.annotatorCandidatesBuffer); */

        let annotator_id = this.annotator_id.join("|");
        let auditor_id = this.auditor_id.join("|");
        let label_candidates = [];
        this.labelCandidatesBuffer.forEach(label => {
            label_candidates.push({
                label_type: 1,
                input_type: 0,
                text: label.name,
                contour_label_value: label.value
            });
        });

        let newInstanceData = {
            name: this.newInstanceName.input.value,
            modality: this.newInstanceModality,
            description: this.newInstanceDescription.textAreaRef.value,
            data_path: "",
            has_audit: 0,
            label_candidates,
            annotator_id,
            auditor_id,
            status: 0
        };

        //Uncomment when the backend is ready
        axios.post('/instances', newInstanceData).then(res => {
            console.log("res: ", res);
            if (res.status == 201) {
                message.success('Successfully added instance');
                this.listAllInstance();
            }
            else if (res.status == 409) {
                message.error('Instance name conflicts');
            }
        }).catch(error => {
            message.error('Add instance error');
            console.log(error);
        });

        this.labelCandidatesBuffer = [];
        this.annotatorCandidatesBuffer = [];
        this.newInstanceModality = "CT";
        this.existingMaxLabelValue = 0;
        this.annotator_id = [];
        this.auditor_id = [];
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
        if (this.labelCandidatesBuffer.length === 0) {
            this.existingMaxLabelValue = 0;
        }
        else if ((deletedValue === this.existingMaxLabelValue) && (deletedValue !== 0)) {
            let secondMaxValue = 1;
            this.labelCandidatesBuffer.forEach(element => {
                if (element.value > secondMaxValue) {
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
        if (Reg.isStringEmpty(this.newLabelName.input.value)) {
            message.error("Label name can not be empty");
            return;
        }
        if (Reg.isStringEmpty(this.newLabelValue.input.value)) {
            message.error("Label value can not be empty");
            return;
        }
        let inputValue = parseInt(this.newLabelValue.input.value);
        if (!inputValue) {
            message.error("Label value must be a number");
            return;
        }
        if (this.labelCandidatesBuffer.findIndex((element, index, arr) => {
            return element.value === inputValue;
        }) > -1) {
            message.error("This value of label has already existed");
            return;
        }

        this.labelCandidatesBuffer.push({
            name: this.newLabelName.input.value,
            value: parseInt(this.newLabelValue.input.value),
            //color: this.state.colorBlockColor
        });

        this.existingMaxLabelValue =
            parseInt(this.newLabelValue.input.value) > this.existingMaxLabelValue ?
                parseInt(this.newLabelValue.input.value) : this.existingMaxLabelValue;

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
        if (Reg.isStringEmpty(this.modifiedInstanceName.input.value)) {
            message.error("Instance name can not be empty");
            return;
        }

        let annotator_id = this.annotator_id.join("|");
        let auditor_id = this.auditor_id.join("|");
        let label_candidates = [];
        this.labelCandidatesBuffer.forEach(label => {
            label_candidates.push({
                label_type: 0,
                input_type: 0,
                text: label.name,
                contour_label_value: label.value
            });
        });

        let modifiedInstanceData = {
            name: this.modifiedInstanceName.input.value,
            modality: this.modifiedInstanceModality,
            description: this.modifiedInstanceDescription.textAreaRef.value,
            has_audit: this.originalInstanceData.has_audit,
            label_candidates,
            annotator_id,
            auditor_id,
            //status: this.originalInstanceData.status
        };

        //Uncomment when the backend is ready
        axios.put(`/instance/${this.currentModifiedInstanceId}`, modifiedInstanceData).then(res => {
            //console.log("res: ", res);
            if (res.status == 201) {
                message.success('Successfully modified instance');
                this.listAllInstance();
            }
            else {
                message.error('Modify instance error');
            }
        }).catch(error => {
            message.error('Modify instance error');
            console.log(error);
        });

        this.labelCandidatesBuffer = [];
        this.annotatorCandidatesBuffer = [];
        this.existingMaxLabelValue = 0;
        this.annotator_id = [];
        this.auditor_id = [];
        this.originalInstanceData = {};
        this.currentModifiedInstanceId = null;
        this.modifiedInstanceModality = null;
        this.setState({
            showModifyInstance: false,
            hideColorPicker: true,
            labelCandidatesBuffer: [],
            annotatorCandidatesBuffer: [],
            hideAddLabelControls: false,
            hideAddAnnotatorControls: false,
            defaultNewLabelValue: 1,
            userRightsMatrix: []
        });
    };

    handleModifyInstanceCancel = e => {
        this.labelCandidatesBuffer = [];
        this.annotatorCandidatesBuffer = [];
        this.existingMaxLabelValue = 0;
        this.annotator_id = [];
        this.auditor_id = [];
        this.originalInstanceData = {};
        this.currentModifiedInstanceId = null;
        this.modifiedInstanceModality = null;
        this.setState({
            showModifyInstance: false,
            hideColorPicker: true,
            labelCandidatesBuffer: [],
            annotatorCandidatesBuffer: [],
            hideAddLabelControls: false,
            hideAddAnnotatorControls: false,
            defaultNewLabelValue: 1,
            userRightsMatrix: []
        });
    };

    onInstanceDetailClick = e => {
        //this.props.onInstanceDetailClick();
        let instance_id = e.target.dataset.instanceid;
        let instance_name = e.target.dataset.instancename;

        // name: "Study 1",
        // path: "D:\\dev\\projects\\Git repositories\\ATMI\\",
        // annotators: "calkufu@hotmail.com",
        // auditors: "fuhua06@gmail.com",
        // filesNo: 5,
        // status: "Ready"

        axios.get("/instances/" + instance_id + "/studies").then(res => {
            let studyTableData = [];
            const studies = res.data;
            for (let i = 0; i < studies.length; i++) {
                status = studies[i].status;
                if (status === "1") status = "Ready to annotate.";
                else if (status === "2") status = "Auditing";
                else if (status === "3") status = "Finished";

                studyTableData.push({
                    name: studies[i].study_uid,
                    instance_id: instance_id,
                    study_id: studies[i].study_id,
                    annotators: studies[i].annotators,
                    auditors: studies[i].auditors,
                    status: status,
                    path: studies[i].folder_name.substring(2,50) + "...",
                    file_number: studies[i].total_files_number
                })
            }
            this.setState({
                showInstanceDetail: true,
                "studiesListTableData": studyTableData,
                current_instance_id: instance_name
            })
        }).catch(error => {
            message.error('Studies load error');
            console.log(error);
        });
    };

    onModifyInstanceClick = (record) => {
        //Load instance data from the backend
        //The parameter "record" means the table record of the instance
        axios.get("/instance/" + record.instanceid).then(res => {
            console.log("res.data: ", res.data);
            if (res.status === 200) {
                this.originalInstanceData = {
                    name: res.data.name,
                    modality: res.data.modality,
                    description: res.data.description,
                    has_audit: res.data.has_audit,
                    annotator_id: res.data.annotator_id,
                    auditor_id: res.data.auditor_id,
                    label_candidates: res.data.label_candidates,
                    status: res.data.status
                };

                this.currentModifiedInstanceId = record.instanceid;
                this.modifiedInstanceModality = this.originalInstanceData.modality;

                this.originalInstanceData.label_candidates.forEach(element => {
                    this.labelCandidatesBuffer.push({
                        name: element.text,
                        value: (element.contour_label_value) ? element.contour_label_value : 0
                    });
                });
                let existingMaxLabelValue = 0;
                this.labelCandidatesBuffer.forEach(element => {
                    if (element.value > existingMaxLabelValue) {
                        existingMaxLabelValue = element.value
                    }
                });
                this.existingMaxLabelValue = existingMaxLabelValue;

                let annotator_id = [];
                let auditor_id = [];
                if (this.originalInstanceData.annotator_id) {
                    annotator_id = this.originalInstanceData.annotator_id.split("|");
                    annotator_id.forEach(element => {
                        element = parseInt(element);
                    });
                }
                if (this.originalInstanceData.auditor_id) {
                    auditor_id = this.originalInstanceData.auditor_id.split("|");
                    auditor_id.forEach(element => {
                        element = parseInt(element);
                    });
                }

                let userRightsMatrix = [];
                this.state.userTableData.forEach(userRecord => {
                    userRightsMatrix.push({
                        username: userRecord.username,
                        userid: userRecord.userid,
                        isAnnotator: false,
                        isAuditor: false
                    });
                });

                annotator_id.forEach(id => {
                    let index = userRightsMatrix.findIndex((record, index, arr) => {
                        return id === record.userid;
                    });
                    if (index > 0) {
                        userRightsMatrix[index].isAnnotator = true;
                    }
                });
                auditor_id.forEach(id => {
                    let index = userRightsMatrix.findIndex((record, index, arr) => {
                        return id === record.userid;
                    });
                    if (index > 0) {
                        userRightsMatrix[index].isAuditor = true;
                    }
                });

                this.setState({
                    modifiedInstanceName: this.originalInstanceData.name,
                    modifiedInstanceModality: this.originalInstanceData.modality,
                    modifiedInstanceDescription: this.originalInstanceData.description,
                    labelCandidatesBuffer: this.labelCandidatesBuffer,
                    userRightsMatrix,
                    defaultNewLabelValue: existingMaxLabelValue + 1,
                    showModifyInstance: true
                });
            }
            else {
                message.error('Instance details load error');
            }
        }).catch(error => {
            message.error('Instance details load error');
            console.log(error);
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
        axios.delete(`/instance/${record.instanceid}`).then(res => {
            if (res.status === 200) {
                message.success('Instance has been deleted');
                this.listAllInstance();
            }
            else if (res.status === 404) {
                message.error('Instance not found');
            }

        }).catch(error => {
            message.error('Delete Instance error');
            console.log(error);
        });
    };

    onNewInstanceModalityChange = (value) => {
        this.newInstanceModality = value;
    }

    handleInstanceDetailOk = e => {
        this.setState({
            showInstanceDetail: false
        });
    }

    onAddAnnotatorCheckboxChange = (e, record, index) => {
        //console.log("e: ", e.target.checked);
        //console.log("record: ", record.username);
        this.state.userRightsMatrix[index].isAnnotator = !this.state.userRightsMatrix[index].isAnnotator;
        if (this.state.userRightsMatrix[index].isAnnotator) {
            this.annotator_id.push(record.userid);
        }
        else {
            let spliceIndex = annotator_id.findIndex((element, index, arr) => {
                return element === record.userid;
            });
            if (spliceIndex > -1) {
                annotator_id.splice(spliceIndex, 1);
            }
        }
        //console.log("userRightsMatrix: ", this.state.userRightsMatrix);
    }

    onAddAuditorCheckboxChange = (e, record, index) => {
        //console.log("e: ", e.target.checked);
        //console.log("record: ", record.username);
        this.state.userRightsMatrix[index].isAuditor = !this.state.userRightsMatrix[index].isAuditor;
        if (this.state.userRightsMatrix[index].isAuditor) {
            this.auditor_id.push(record.userid);
        }
        else {
            let spliceIndex = auditor_id.findIndex((element, index, arr) => {
                return element === record.userid;
            });
            if (spliceIndex > -1) {
                auditor_id.splice(spliceIndex, 1);
            }
        }
        //console.log("userRightsMatrix: ", this.state.userRightsMatrix);
    }

    onModifiedInstanceNameChange = e => {
        this.setState({
            modifiedInstanceName: e.target.value
        });
    }

    onModifiedInstanceModalityChange = (value) => {
        this.setState({
            modifiedInstanceModality: value
        });
        this.modifiedInstanceModality = value;
    }

    onModifiedInstanceDescriptionChange = e => {
        this.setState({
            modifiedInstanceDescription: e.target.value
        });
    }

    showStatusColor = (status) => {
        switch (status) {
            case 0:
                return "grey";
            case 1:
                return "grey";
            case 2:
                //return "#0066FF";
                return "grey";
            case 3:
                return "#4178ff";
            case 4:
                //return "yellow";
                return "#ffa754";
            case 5:
                //return "#00FF00";
                return "#378035";
            case 6:
                return "#ff8065";
            default:
                return "red";
        }
    }

    showStatusName = (status) => {
        switch (status) {
            case 0:
                return "Initialized";
            case 1:
                return "Initialized";
            case 2:
                return "Importing data";
            case 3:
                return "Ready to annotate";
            case 4:
                return "Annotating";
            case 5:
                return "Finished";
            case 6:
                return "Auditing";
            default:
                return "Unknown or error";
        }
    }

    onImportdcmClick = (record) => {
        this.importingInstanceId = record.instanceid;
        this.setState({
            importingInstanceName: record.name,
            showImportdcm: true
        });
    }

    handleImportdcmOk = e => {
        if(Reg.isStringEmpty(this.dcmPath.textAreaRef.value)) {
            message.error("Data path can not be empty");
            return;
        }

        axios.get(`/import/instance/${this.importingInstanceId}?data_path=${this.dcmPath.textAreaRef.value}`).then(res => {
            if(res.status === 201) {
                message.success('Successfully imported dcm');
                this.listAllInstance();
            }
        }).catch(error => {
            message.error('Import dcm error');
            console.log(error);
        });

        this.importingInstanceId = null;
        this.setState({
            showImportdcm: false,
            importingInstanceName: ""
        });
        //this.currentModifiedInstanceId;
    }

    handleImportdcmCancel = e => {
        this.importingInstanceId = null;
        this.setState({
            showImportdcm: false,
            importingInstanceName: ""
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
                    <a href="javascript:void(0);" title="Show studies list" style={{ color: "#0099FF" }}
                        onClick={this.onInstanceDetailClick} data-instancename={text}
                        data-instanceid={record.instanceid}>
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
            align: "left",
            className: "table",
            render: (text, record) => (
                <div className={(record.name === this.state.instanceNameEntered) ? styles.highightTableRow : styles.font}>
                    <Row type="flex" justify="start" align="middle">
                        <Col>
                            <div style={{
                                /* width: 8, height: 8, borderRadius: "50%", */
                                positon: "absolute", width: 10, height: 10, left: 3, borderRadius: 30, border: "1px solid #eee",
                                backgroundColor: this.showStatusColor(record.status)
                            }
                            } />
                        </Col>
                        <Col>
                            &nbsp; {this.showStatusName(record.status)}
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <div hidden={!(record.status === 4)}>
                                <Progress percent={record.progress} showInfo={false} strokeColor="#87d068" />
                            </div>
                        </Col>
                    </Row>
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
            title: 'Data Path',
            dataIndex: 'data_path',
            key: 'data_path',
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
                    <Row type="flex" justify="start" justifyjustify="space-between">
                        <Col span={6}>
                                 <a href="javascript:;" onClick={() => this.onImportdcmClick(record)}
                                    ><img src="./assets/static/img/import.png" title='Import dcm'
                                        alt='Import dcm' style={{
                                            width: 18,
                                            height: 18
                                        }} /></a>
                        </Col>
                        <Col span={6}>
                            <a href="javascript:;"><img src="./assets/static/img/details.png" title='Show studies list'
                                alt='Show studies list' style={{ width: 18, height: 18 }}
                                onClick={this.onInstanceDetailClick} data-instancename={text}
                                data-instanceid={record.instanceid} /></a>
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

    studiesListTableColumns = [
        {
            title: 'Study ID',
            dataIndex: 'name',
            key: 'name',
            width: "16%",
            align: "center",
            render: (text, record) => (
                <div>
                    <a href={"workbench/instance/" + record.instance_id + "/study/" + record.study_id} target="_blank"
                        title="Show studies list" style={{ color: "#0099FF" }}>
                        {text}
                    </a>
                </div>
            )
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
            dataIndex: 'file_number',
            key: 'file_number',
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

    addAnnotatorTableColumns = [
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            width: "50%",
            align: "center"
        },
        {
            title: 'Annotator',
            dataIndex: 'annotator',
            key: 'annotator',
            width: "25%",
            align: "center",
            render: (text, record, index) => (
                <div>
                    <Checkbox
                        defaultChecked={record.isAnnotator}
                        onChange={(e) => this.onAddAnnotatorCheckboxChange(e, record, index)}
                    />
                </div>
            )
        },
        {
            title: 'Auditor',
            dataIndex: 'auditor',
            key: 'auditor',
            width: "25%",
            align: "center",
            render: (text, record, index) => (
                <div>
                    <Checkbox
                        defaultChecked={record.isAuditor}
                        onChange={(e) => this.onAddAuditorCheckboxChange(e, record, index)}
                    />
                </div>
            )
        },
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
                                Email
                            </div>
                        </Col>
                    </Row>
                    <div style={{ height: 6 }} />
                    <Row>
                        <Col>
                            <Input placeholder="Please enter new user email"
                                ref={target => (this.newUserName = target)} />
                        </Col>
                    </Row>
                    <div style={{ height: 6 }} />
                    <Row type="flex" justify="start">
                        <Col span={24}>
                            <div style={{ fontSize: 'x-small', fontWeight: 'bold' }}>
                                Name
                            </div>
                        </Col>
                    </Row>
                    <div style={{ height: 6 }} />
                    <Row>
                        <Col>
                            <Input placeholder="Please enter username"
                                ref={target => (this.newUserDispName = target)} />
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
                            <Select defaultValue="0" style={{ width: '100%' }}
                                ref={target => (this.newUserType = target)}>
                                <Select.Option value="0">
                                    Admin
                                </Select.Option>
                                <Select.Option value="1">
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
                                    <div style={{ float: "right" }} hidden={!this.state.hideAddLabelControls}>
                                        <Icon type="plus"
                                            style={{ width: 18, height: 18 }}
                                            onClick={this.onLabelPlusIconClick}
                                        />
                                    </div>
                                    <div style={{ float: "right" }} hidden={this.state.hideAddLabelControls}>
                                        <Icon type="minus"
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
                                    <div style={{ float: "right" }} hidden={!this.state.hideAddAnnotatorControls}>
                                        <Icon type="plus"
                                            style={{ width: 18, height: 18 }}
                                            onClick={this.onAnnotatorPlusIconClick}
                                        />
                                    </div>
                                    <div style={{ float: "right" }} hidden={this.state.hideAddAnnotatorControls}>
                                        <Icon type="minus"
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
                                    <Col span={24}>
                                        <Table columns={this.addAnnotatorTableColumns}
                                            dataSource={this.state.userRightsMatrix}
                                            /* bordered  */
                                            size="small"
                                            //loading={this.state.instanceTableLoading}
                                            //actionToken={this.state.instanceTableActionToken}
                                            //onRow={this.onInstanceTableRow}
                                            //rowClassName={this.setRowClassName}
                                            pagination={{
                                                current: this.state.currentInstanceTablePage,
                                                onChange: this.onInstanceTablePageChange,
                                                showSizeChanger: true,
                                                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                                            }}
                                        />
                                    </Col>
                                </Row>
                                {/* <Row type="flex" justify="start">
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
                                </Row> */}
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
                                    <Input value={this.state.modifiedInstanceName}
                                        onChange={this.onModifiedInstanceNameChange}
                                        ref={target => (this.modifiedInstanceName = target)}
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
                                    <Select value={this.state.modifiedInstanceModality} style={{ width: '100%' }}
                                        onChange={this.onModifiedInstanceModalityChange}
                                    /* ref={target => (this.modifiedInstanceModality = target)} */
                                    >
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
                                        value={this.state.modifiedInstanceDescription}
                                        onChange={this.onModifiedInstanceDescriptionChange}
                                        ref={target => (this.modifiedInstanceDescription = target)} />
                                </Col>
                            </Row>
                            <div style={{ height: 6 }} />
                          {/*   <Row type="flex" justify="start">
                                <Col span={24}>
                                    <div style={{ fontSize: 'x-small', fontWeight: 'bold' }}>
                                        Data Importing
                                    </div>
                                </Col>
                            </Row>

                            <div style={{ height: 4 }} />

                            <Row type="flex" justify="start">
                                <Col span={24}>
                                    <div className={styles.borderSpan}>
                                        <div className={styles.border} />
                                    </div>
                                </Col>
                            </Row>

                            <div style={{ height: 4 }} />

                            <Row type="flex" justify="start" align="bottom">
                                <Col>
                                    <a href="javascript:;" onClick={this.onImportdcmClick}
                                    ><img src="./assets/static/img/import.png" title='Import dcm'
                                        alt='Import dcm' style={{
                                            width: 14,
                                            height: 14
                                        }} />Import dcm</a>
                                </Col>
                            </Row> */}

                            {/*  <Row type="flex" justify="space-between">
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
                            </Row> */}
                            <Row type="flex" justify="space-between">
                                <Col span={18}>
                                    <div style={{ fontSize: 'x-small', fontWeight: 'bold' }}>
                                        Label
                                    </div>
                                </Col>
                                <Col span={6}>
                                    <div style={{ float: "right" }} hidden={!this.state.hideAddLabelControls}>
                                        <Icon type="plus"
                                            style={{ width: 18, height: 18 }}
                                            onClick={this.onLabelPlusIconClick}
                                        />
                                    </div>
                                    <div style={{ float: "right" }} hidden={this.state.hideAddLabelControls}>
                                        <Icon type="minus"
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
                                    <div style={{ float: "right" }} hidden={!this.state.hideAddAnnotatorControls}>
                                        <Icon type="plus"
                                            style={{ width: 18, height: 18 }}
                                            onClick={this.onAnnotatorPlusIconClick}
                                        />
                                    </div>
                                    <div style={{ float: "right" }} hidden={this.state.hideAddAnnotatorControls}>
                                        <Icon type="minus"
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
                                    <Col span={24}>
                                        <Table columns={this.addAnnotatorTableColumns}
                                            dataSource={this.state.userRightsMatrix}
                                            /* bordered  */
                                            size="small"
                                            //loading={this.state.instanceTableLoading}
                                            //actionToken={this.state.instanceTableActionToken}
                                            //onRow={this.onInstanceTableRow}
                                            //rowClassName={this.setRowClassName}
                                            pagination={{
                                                current: this.state.currentInstanceTablePage,
                                                onChange: this.onInstanceTablePageChange,
                                                showSizeChanger: true,
                                                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                                            }}
                                        />
                                    </Col>
                                </Row>
                                {/* <Row type="flex" justify="start">
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
                                </Row> */}
                            </div>
                        </div>
                    </div>
                </Modal>

                <Modal
                    title={(<div style={{ height: 12 }}>Studies List</div>)}
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
                    bodyStyle={{ marginTop: 6, paddingTop: 6 }}
                >
                    <Row type="flex" justify="center" align="middle">
                        <Col span={24}>
                            <div style={{ textAlign: "center" }}>
                                <h2>Studies in {this.state.current_instance_id}</h2>
                            </div>
                        </Col>
                    </Row>
                    <Row type="flex" justify="start">
                        <Col span={24}>
                            <Table columns={this.studiesListTableColumns}
                                dataSource={this.state.studiesListTableData}
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
                                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                                }}
                            />
                        </Col>
                    </Row>
                </Modal>
                <Modal
                    title={(<div style={{ height: 12 }}>Import dcm</div>)}
                    width="30%"
                    visible={this.state.showImportdcm}
                    onOk={this.handleImportdcmOk}
                    onCancel={this.handleImportdcmCancel}
                    destroyOnClose={true}
                    footer={[
                        <Button key="submit" type="primary" onClick={this.handleImportdcmOk}>
                            Ok
                        </Button>,
                        <Button key="back" onClick={this.handleImportdcmCancel}>
                            Cancel
                        </Button>,
                    ]}
                    bodyStyle={{ marginTop: 6, paddingTop: 6 }}
                >
                    {/*                     <Row type="flex" justify="start">
                        <Col span={24}>
                            批量输入申报名称
                    </Col>
                    </Row> */}
                    {/*                     <div style={{ height: 3 }} /> */}
                    <Row type="flex" justify="start">
                        <Col span={24}>
                            <div style={{ fontSize: 'small' }}>
                                <strong>
                                    {this.state.importingInstanceName}
                                </strong>
                            </div>
                        </Col>
                    </Row>
                    <div style={{ height: 6 }} />
                    <Row type="flex" justify="start">
                        <Col span={24}>
                            <div style={{ fontSize: 'x-small' }}>
                                -Please put your dicom folder under ATMI/data folder.
                    </div>
                        </Col>
                    </Row>
                    <Row type="flex" justify="start">
                        <Col span={24}>
                            <div style={{ fontSize: 'x-small' }}>
                                -And then continue importing the data.
                    </div>
                        </Col>
                    </Row>
                    <div style={{ height: 6 }} />
                    <Row>
                        <Col>
                            <Input.TextArea rows={3} placeholder="Input your dicom folder here, starting after /data/"
                                ref={target => (this.dcmPath = target)} />
                        </Col>
                    </Row>
                </Modal>
            </div>
        );
    }
}


