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
            selectValue: {},
            hideAll:false,
            autosave:1,
            savetime : '',
            seriesFinished : data.series_detail.status === 4
        };

        this.itemColors = cornerstoneWrapper.getAllSegmentsColor(this.state.labels.length);

        var _this = this;
        cornerstoneWrapper.setAutosaveCallback(function(status){
            let t = new Date();
            _this.setState({autosave:status, savetime:`${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}`})
        })
    }

    deleteSegment = (idx) => {
        cornerstoneWrapper.deleteSegmentByIndex(idx + 1, this.props.stack.currentImageIdIndex);
        let _this = this;
        cornerstoneWrapper.saveSegments(this.props.stack.seriesId,
            this.props.stack.imageIds[this.props.stack.currentImageIdIndex])
    };
    toggleSegment = (idx) => {
        cornerstoneWrapper.toggleSegmentByIndex(idx + 1);
        let hiddenLabels = this.state.hiddenLabels.split("");
        hiddenLabels[idx] = hiddenLabels[idx] === "1" ? "0" : "1";
        this.setState({hiddenLabels: hiddenLabels.join("")});

    };

    listLabelsItems() {
        const labels = this.state.labels;

        this.labelCount = 0;
        for (let i = 0; i < labels.length; i++) {
            if (labels[i]['label_type'] === 0) {
                this.labelCount++;
            }
        }
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
                    <div className={style.hide} onClick={() => this.toggleSegment(key)}>
                        <span className={`fas  ${this.state.hiddenLabels[key] === "0" ? "fa-eye" : "fa-eye-slash"}`}
                              title={this.state.hiddenLabels[key] === "0" ? "show segment" : "hide segment"}/>
                    </div>
                    <div className={style.delete} onClick={() => this.deleteSegment(key)}>
                        <span className="fas fa-trash-alt" title="delete segment"/>
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
                    return (<div key={key} className={style.row}>
                        <span className={style.cell}>{content['key']}: &nbsp;</span>
                        <select className={style.cell} value={this.state[content['candidate_id']]}
                                onChange={this.onSelectStudyLabel}>
                            <option value=""/>
                            {content['value'].map(v => {
                                return <option key={v} value={v}>{v}</option>;
                            })}
                        </select>
                    </div>)
                } else if (value['input_type'] === "input") {
                    return (<div key={key} className={style.row}>
                        <span className={style.cell}>{content['key']}: &nbsp;</span>
                        <input className={style.cell} type="text" value={content["value"]}/>
                    </div>)
                }
            }
        });
        return this.items;

    }

    onSelectStudyLabel = () => {

    };

    onSelectLabel = (k) => {
        cornerstoneWrapper.activeSegmentByIndex(k + 1);
        this.setState({currentLabel: k});

    };
    onSaveLabel = () =>{
        cornerstoneWrapper.saveSegments(this.props.stack.seriesId,
            this.props.stack.imageIds[this.props.stack.currentImageIdIndex])
    };

    onFinished = () =>{
        let seriesId = this.props.stack.seriesId;
        fetch(`/series/${seriesId}/finished`,{
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((data)=>{
            this.setState({"seriesFinished": true})
        })

    };
    saveStatusUpdate = (status) =>{
        if(status === 0){
            return <span>saving...</span>
        }else if(status === 1){
            return <span>saved({this.state.savetime})</span>
        }else if(status === 2){
            return <span>error</span>
        }
    };
    activateTool = (e) => {
        if (e.keyCode === 83) {
            this.onSelectLabel((this.state.currentLabel+1)%this.labelCount)
        }else if(e.keyCode === 72){
            //Hide all labels
            if(this.state.hideAll){
                //display all
                let hiddenLabels = this.state.hiddenLabels.split('')
                for(let i =0;i<hiddenLabels.length;i++){
                    if(hiddenLabels[i] ==="0"){
                        cornerstoneWrapper.toggleSegmentByIndex(i+1);
                    }
                }
                this.setState({'hideAll':false,
                "hiddenLabels":this.state.hiddenLabels.replace(/0/g,"1")})
            }else{
                //hide all
                let hiddenLabels = this.state.hiddenLabels.split('')
                for(let i =0;i<hiddenLabels.length;i++){
                    if(hiddenLabels[i] ==="1"){
                        cornerstoneWrapper.toggleSegmentByIndex(i+1);
                    }
                }
                this.setState({'hideAll':true,
                "hiddenLabels":this.state.hiddenLabels.replace(/1/g,"0")})
            }
        }
    };

    render() {
        let saveStyle = this.state.autosave<2?style.autosave_ok:style.autosave_err;
        return (
            <div className="mainlabel">
                <div className={style.title}>Navigations</div>
                <div>
                    <span
                        className={` ${this.state.currentTool === "Play" ? style.active : ""} ${style.autosave}`}
                        onClick={(e) => navSlice({'keyCode': 80})}><i
                        className={`fas ${(this.props.playing) ? "fa-pause-circle" : "fa-play-circle"} ${style.i}`}/>Play(p)
                    </span>

                    <span
                        className={` ${style.autosave}`}
                        onClick={(e) => navSlice({'keyCode': 37})}><i
                        className={`fas fa-caret-square-left ${style.i}`}/>
                    </span>
                    <span
                        className={` ${style.autosave}`}
                        onClick={(e) => navSlice({'keyCode': 39})}><i
                        className={`fas fa-caret-square-right ${style.i}`}/>
                    </span>
                    <span
                        className={` ${style.autosave}`}
                        onClick={(e) => navSlice({'keyCode': 38})}><i
                        className={`fas fa-caret-square-up ${style.i}`}/>
                    </span>
                    <span
                        className={` ${style.autosave}`}
                        onClick={(e) => navSlice({'keyCode': 40})}><i
                        className={`fas fa-caret-square-down ${style.i}`}/>
                    </span>

                    <span
                        className={` ${style.autosave}`}>
                        <a target="_blank" href={`/crossref/instance/${this.state.stack.instanceId}`}>Cross Reference Platform</a>
                    </span>
                </div>

                <div className={style.title}>Save and Finish</div>
                <div>
                    <div onClick={this.onSaveLabel} className={`${style.autosave} ${saveStyle}`}>
                        {this.saveStatusUpdate(this.state.autosave)}
                        {/*{this.state.autosave==1?(*/}
                        {/*    <span>saved({this.state.savetime})</span>*/}
                        {/*):(*/}
                        {/*    <span>saving...</span>*/}
                        {/*)}*/}
                    </div>

                    <div className={`${style.autosave} ${style.finished} ${this.state.seriesFinished?style.disable:""}`} onClick={this.onFinished}>Finished</div>
                    <div style={{clear:'both'}}></div>
                </div>
                <div className={style.title} style={{clear:'both'}}>Study Labels</div>
                <div className={`${style.studylabelitem} ${style.table}`}>
                    {this.listStudyLabelItems()}
                </div>
                <div className={style.title}>Labels(s-switch;h-hide)</div>
                <div>
                    {this.listLabelsItems()}
                </div>
            </div>
        )
    };

    componentDidMount() {
        document.addEventListener('keydown', this.activateTool);

    }
}

export default MainLabel;