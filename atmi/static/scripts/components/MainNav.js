import React from 'react'
import style from "./MainNav.css"
import cornerstoneWrapper from "./CornerstoneWrapper"
import MainStudyList from "./MainStudyList"
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstone from "cornerstone-core";
const scrollToIndex = cornerstoneTools.import('util/scrollToIndex');

class MainNav extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            instanceId: props.stack.instanceId,
            currentTool: props.stack.currentTool,
            showStudyList: -1,
            stack: props.stack,
            currentImageIdIndex : props.stack.currentImageIdIndex,
            prevImageIdIndex : props.stack.prevImageIdIndex
        };
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            currentImageIdIndex: nextProps.stack.currentImageIdIndex,
            prevImageIdIndex : nextProps.stack.prevImageIdIndex
        });
    }
    selectTool = (type, args) => {
        cornerstoneWrapper.enableTool(type, args);
        this.setState({currentTool: type});
    };
    // play = () =>{
    //     const stack = this.state.stack;
    //     const stackLength = stack.imageIds.length;
    //
    //     this.state.stack.prevImageIdIndex = this.state.stack.currentImageIdIndex;
    //
    //     stack.currentImageIdIndex = ++this.state.stack.currentImageIdIndex%stackLength;
    //     scrollToIndex(this.element, this.state.stack.currentImageIdIndex++);
    //
    //     cornerstone.updateImage(this.element);
    // };
    redo = () => {
        cornerstoneWrapper.redoSegment()
    };
    undo = ()=>{
        cornerstoneWrapper.undoSegment()
    };
    propagate = () => {
        cornerstoneWrapper.replaceSegments(this.state.prevImageIdIndex, this.state.currentImageIdIndex);
        cornerstoneWrapper.saveSegments(this.props.stack.seriesId,
            this.props.stack.imageIds[this.props.stack.currentImageIdIndex])
    };

    activateTool = (e) => {
        if (e.keyCode === 49) {
            //press1
            this.setState({showStudyList: -this.state.showStudyList});
        } else if (e.keyCode === 50) {
            this.selectTool('Wwwc');
            this.setState({cur_tool: "Wwwc"});
        } else if (e.keyCode === 51) {
            this.selectTool('FreehandScissors');
            this.setState({cur_tool: "FreehandScissors"});
        } else if (e.keyCode === 52) {
            this.selectTool('RectangleScissors');
            this.setState({cur_tool: "RectangleScissors"});
        } else if (e.keyCode === 53) {
            this.selectTool('CircleScissors');
            this.setState({cur_tool: "CircleScissors"});
        } else if (e.keyCode === 54) {
            this.selectTool('CorrectionScissors');
            this.setState({cur_tool: "CorrectionScissors"});
        } else if (e.keyCode === 55) {
            this.selectTool('Brush');
            this.setState({cur_tool: "Brush"});
        } else if (e.keyCode === 32) {
            if (this.state.cur_tool !== "FreehandScissors") {
                this.selectTool('FreehandScissors');
                this.setState({cur_tool: "FreehandScissors"});
            } else {
                this.selectTool('CorrectionScissors');
                this.setState({cur_tool: "CorrectionScissors"});
            }
        }else if (e.keyCode === 56) {
            this.selectTool('Zoom');
            this.setState({cur_tool: "Zoom"});
            this.selectTool('Pan');
            this.setState({cur_tool: "Pan"});
        }else if (e.keyCode === 85){
            //undo
            this.undo()
        }else if (e.keyCode === 82){
            //redo
            this.redo()
        }else if (e.keyCode === 67){
            this.propagate()
            // cornerstoneWrapper.replaceSegments(this.state.prevImageIdIndex, this.state.currentImageIdIndex)
        }else{
            console.log("KeyCode Uncatched:"+e.keyCode)
        }

    };


    render() {
        return (
            <div className={`mainnav ${style.row}`}>
                <div className={style.barstyle}>
                    <div className={style.navlist}><a href="/" className={style.home}><i
                        className={`fas fa-home ${style.i}`}/><br/>Home</a></div>
                    <div className={style.navlist} onClick={() => {
                        this.setState({showStudyList: -this.state.showStudyList})
                    }}>
                        <i className={`fas fa-list ${style.i}`}/><br/>Studies(1)
                        <div className={`${this.state.showStudyList > 0 ? "" : "hide"}`}>
                            <MainStudyList ref={input => {
                                this.studyList = input
                            }} instanceId={this.state.instanceId} stack={this.state.stack}/></div>
                    </div>
                    <div className={style.navlist}/>
                    <div className={`${style.navlist} ${this.state.currentTool === "Wwwc" ? style.active : ""}`}
                         onClick={() => this.selectTool('Wwwc')}><i
                        className={`fas fa-adjust ${style.i}`}/><br/>ww/wc(2)
                    </div>

                    <div className={`${style.navlist} ${this.state.currentTool === "Pan" ? style.active : ""}`}
                         onClick={() => {this.selectTool('Zoom');this.selectTool('Pan');}}><i
                        className={`fas fa-search ${style.i}`}/><br/>Zoom(8)
                    </div>
                    <div
                        className={`${style.navlist}  ${this.state.currentTool === "FreehandScissors" ? style.active : ""}`}
                        onClick={() => this.selectTool('FreehandScissors')}><i
                        className={`fas fa-hand-paper ${style.i}`}/><br/>Freehand(3)
                    </div>
                    {/*<div*/}
                    {/*    className={`${style.navlist} }`}*/}
                    {/*    onClick={() => this.selectTool('FreehandScissors')}><i*/}
                    {/*    className={`fas fa-bezier-curve ${style.i}`}/><br/>spline*/}
                    {/*</div>*/}
                    {/*<div*/}
                    {/*    className={`${style.navlist} ${this.state.currentTool === "RectangleScissors" ? style.active : ""}`}*/}
                    {/*    onClick={() => this.selectTool('RectangleScissors')}><i*/}
                    {/*    className={`far fa-square  ${style.i}`}/><br/>rectangle(4)*/}
                    {/*</div>*/}
                    {/*<div*/}
                    {/*    className={`${style.navlist} ${this.state.currentTool === "FreehandScissors" ? style.active : ""}`}*/}
                    {/*    onClick={() => this.selectTool('FreehandScissors')}><i*/}
                    {/*    className={`fas fa-draw-polygon ${style.i}`}/><br/>polygon*/}
                    {/*</div>*/}
                    {/*<div*/}
                    {/*    className={`${style.navlist} ${this.state.currentTool === "CircleScissors" ? style.active : ""}`}*/}
                    {/*    onClick={() => this.selectTool('CircleScissors')}>*/}
                    {/*    <i className={`far fa-circle ${style.i}`}/><br/>circle(5)*/}
                    {/*</div>*/}
                    <div
                        className={`${style.navlist} ${this.state.currentTool === "CorrectionScissors" ? style.active : ""}`}
                        onClick={() => this.selectTool('CorrectionScissors')}><i
                        className={`fas fa-eraser ${style.i}`}/><br/>Correction(6)
                    </div>
                    <div
                        className={`${style.navlist} ${this.state.currentTool === "Brush" ? style.active : ""}`}
                        onClick={() => this.selectTool('Brush', 1)}><i
                        className={`fas fa-backspace ${style.i}`}/><br/>Erase(7)
                    </div>

                    <div className={style.navlist}/>
                    <div
                        className={`${style.navlist} ${this.state.currentTool === "Play" ? style.active : ""}`}
                        onClick={(e) => navSlice({'keyCode': 80})}><i
                        className={`fas fa-play-circle ${style.i}`}/><br/>Play(p)
                    </div>

                    <div
                        className={`${style.navlist} `}
                        onClick={(e) => this.undo()}><i
                        className={`fas fa-undo ${style.i}`}/><br/>Undo(u)
                    </div>
                    <div
                        className={`${style.navlist} `}
                        onClick={(e) => this.redo()}><i
                        className={`fas fa-redo ${style.i}`}/><br/>Redo(r)
                    </div>


                    <div
                        className={`${style.navlist} `}
                        onClick={(e) => this.propagate()}><i
                        className={`fas fa-copy ${style.i}`}/><br/>Propagate(c)
                    </div>

                </div>
            </div>)
    }

    componentDidMount() {
        document.addEventListener('keydown', this.activateTool);
    }
}

export default MainNav

