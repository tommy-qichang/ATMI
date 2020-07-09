import React from 'react';
import {message} from 'antd';
import StudyList from './StudyList';
import MainManagementPanel from './MainManagementPanel';
import styles from '../../styles/ManagementPanel.css';
import axios from "axios";


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
        //showInstanceDetail: false,
        hideColorPicker: true,
        colorBlockColor: "#FF8000",
        colorPickerColor: "#FF8000",
        labelCandidatesBuffer: [],
        annotatorCandidatesBuffer: [],
        hideAddLabelControls: true,
        hideAddAnnotatorControls: true,
        userTableData: [],
        hideMainPanel: false,
        hideStudyList: true
    };

    modifyInstanceDescription = null;
    modifyInstancePath = null; 
    colorPicker = null;

    componentDidMount() {
        this.listAllUsers();
    }

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
                })
            }
            this.setState({"instanceTableData": instanceTableData})
        }).catch(error => {
            message.error('Instance list error');
            console.log(error)
        })
    };

    onInstanceDetailClick = e => {
        this.setState({
            //showInstanceDetail: true
            hideMainPanel: true,
            hideStudyList: false
        });
    };

    goBackToMainPanel = e => {
        this.setState({
            //showInstanceDetail: true
            hideMainPanel: false,
            hideStudyList: true
        });
    }

    render() {
        return (
            <div>
                <div hidden={this.state.hideMainPanel}>
                <MainManagementPanel 
                onInstanceDetailClick={this.onInstanceDetailClick}/>
            </div>
            <div hidden={this.state.hideStudyList}>
                <StudyList 
                goBackToMainPanel={this.goBackToMainPanel}
                />
            </div>
            </div>)
    }


} 