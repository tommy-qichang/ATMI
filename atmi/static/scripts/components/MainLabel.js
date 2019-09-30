import React from 'react'
import style from "./MainLabel.css"
import cornerstoneWrapper from "./CornerstoneWrapper"

class MainLabel extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            stack: props.stack,
            labels: props.stack.labels,
            currentLabel: props.stack.currentLabel,
            hasLabels: [],
            hiddenLabels: Array(props.stack.labels.length).fill(1).join(""),
            selectValue:{}
        };

        this.itemColors = cornerstoneWrapper.getAllSegmentsColor(this.state.labels.length);

    }

    deleteSegment = (idx) => {
        cornerstoneWrapper.deleteSegmentByIndex(idx + 1, this.props.stack.currentImageIdIndex);
        cornerstoneWrapper.saveSegments(this.props.stack.seriesId, this.props.stack.imageIds[this.props.stack.currentImageIdIndex])
    };
    toggleSegment = (idx) => {
        cornerstoneWrapper.toggleSegmentByIndex(idx + 1);
        let hiddenLabels = this.state.hiddenLabels.split("");
        hiddenLabels[idx] = hiddenLabels[idx] === "1" ? "0" : "1";
        this.setState({hiddenLabels: hiddenLabels.join("")});

    };

    listLabelsItems() {
        const labels = this.state.labels;
        this.items = labels.map((value, key) => {
            if (value["label_type"] === 0) {
                return <div key={key}
                            className={`${style.labelitem} ${(this.props.activeLabels.includes(key + 1)) ? style.labeled : ""}`}
                            onClick={() => {
                                this.onSelectLabel(key);
                            }}>
                    <div>
                        <i className={this.state.currentLabel === key ? style.active : ""}>&nbsp;</i>
                        <span className={style.icon} style={{backgroundColor: this.itemColors[key]}}>&nbsp;</span>
                        <span> {value["text"]}</span>
                    </div>
                    <div className={style.delete} onClick={() => this.deleteSegment(key)}>
                        <span className="fas fa-trash-alt" title="delete segment"/>
                    </div>
                    <div className={style.hide} onClick={() => this.toggleSegment(key)}>
                        <span className={`fas  ${this.state.hiddenLabels[key] === "0" ? "fa-eye" : "fa-eye-slash"}`}
                              title={this.state.hiddenLabels[key] === "0" ? "show segment" : "hide segment"}/>
                    </div>
                </div>
            }
        });
        return this.items
    }

    listStudyLabelItems() {
        const labels = this.state.labels;
        let htmlText = [];
        this.items = labels.map((value, key) => {
            if (value['label_type'] === 1) {
                let content = JSON.parse(value['text']);
                // this.setState({[content['candidate_id']]:''});

                if (value['input_type'] === "selectbox") {
                    return (<div key={key}  className={style.row}>
                        <span  className={style.cell}>{content['key']}: &nbsp;</span>
                        <select  className={style.cell} value={this.state[content['candidate_id']]} onChange={this.onSelectStudyLabel}>
                            <option value=""/>
                            {content['value'].map(v=>{
                                return <option key={v} value={v}>{v}</option>;
                            })}
                        </select>
                        </div>)
                }
                else if (value['input_type'] === "input") {
                    return (<div key={key} className={style.row}>
                        <span  className={style.cell}>{content['key']}: &nbsp;</span>
                        <input  className={style.cell} type="text" value={content["value"]}/>
                    </div>)
                }
            }
        });
        return this.items;

    }
    onSelectStudyLabel = ()=>{

    };

    onSelectLabel = (k) => {
        cornerstoneWrapper.activeSegmentByIndex(k + 1);
        this.setState({currentLabel: k});

    };

    render() {
        return (
            <div className="mainlabel">
                <div className={style.title}>Study Labels</div>
                <div className={`${style.studylabelitem} ${style.table}`}>
                    {this.listStudyLabelItems()}
                </div>
                <div className={style.title}>Labels</div>
                <div>
                    {this.listLabelsItems()}
                </div>
            </div>
        )
    }

}

export default MainLabel;