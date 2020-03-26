import React from 'react'
import styles from "./MainStudyList.css"

class MainStudyList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            instanceId: props.instanceId,
            studyList: [],
            selectStudy: -1,
            stack:props.stack
        };

    }

    renderList = (studyList) => {
        this.items = studyList.map((value, key) => {
            return <li key={key} onMouseOver={() => {
                this.setState({selectStudy: key})
            }} className={parseInt(this.state.stack['studyId'])===value[0]['study_id']?styles.selected:""}>
                <div>
                    {/*{value[0]['patient_uid']}-*/}
                    {value[0]['study_uid']}
                    <span className="arrow-right"></span>
                </div>
                <ul className={`${styles.series} ${this.state.selectStudy === key ? "" : styles.hide}`}>
                    {value.map((v, k) => {
                        return <li key={k} className={parseInt(this.state.stack['seriesId'])===v['series_id']?styles.selected:""}>
                            <a href={`/workbench/instance/${v['instance_id']}/study/${v['study_id']}/series/${v['series_id']}`}>
                            {v['series_description'].replace("_"," \n")}<br/>({v['series_files_number']} files)
                            </a>
                        </li>
                    })}

                </ul>
            </li>
        });
        return this.items;
    };

    retrieveList = () => {
        fetch(`/studies/instance_id=${this.state.instanceId}`, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((data) => {
            return data.json();
        }).then((data) => {
            this.setState({studyList: data});

        })
    };

    render() {
        return (
            <ul className={`${styles.studies} ${this.props.dispList ? "" : ""}`}>
                {this.renderList(this.state.studyList)}
            </ul>
        )
    }

    componentDidMount() {
        this.retrieveList();

    }


}

export default MainStudyList;