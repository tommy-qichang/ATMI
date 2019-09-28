import React from 'react'
import style from "./MainNav.css"
import cornerstoneWrapper from "./CornerstoneWrapper"
import MainStudyList from "./MainStudyList"

class MainNav extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            instanceId: props.stack.instanceId,
            currentTool: props.stack.currentTool,
            showStudyList: -1,
            stack: props.stack
        };
    }

    selectTool = (type) => {
        cornerstoneWrapper.enableTool(type);
        this.setState({currentTool: type});
    };

    render() {
        return (
            <div className="mainnav row">
                <div className={style.barstyle}>
                    <div className={style.navlist}><i className={`fas fa-home ${style.i}`}/><br/>Home</div>
                    <div className={style.navlist} onClick={() => {
                        this.setState({showStudyList: -this.state.showStudyList})
                    }}>
                        <i className={`fas fa-list ${style.i}`}/><br/>Studies
                        <div className={`${this.state.showStudyList>0?"":"hide"}`}>
                            <MainStudyList ref={input => {
                                this.studyList = input
                            }} instanceId={this.state.instanceId} stack={this.state.stack}/></div>
                    </div>
                    <div className={style.navlist}/>
                    <div className={`${style.navlist} ${this.state.currentTool === "Wwwc" ? style.active : ""}`}
                         onClick={() => this.selectTool('Wwwc')}><i
                        className={`fas fa-adjust ${style.i}`}/><br/>ww/wc
                    </div>
                    <div
                        className={`${style.navlist}  ${this.state.currentTool === "FreehandScissors" ? style.active : ""}`}
                        onClick={() => this.selectTool('FreehandScissors')}><i
                        className={`fas fa-hand-paper ${style.i}`}/><br/>freehand
                    </div>
                    {/*<div*/}
                    {/*    className={`${style.navlist} }`}*/}
                    {/*    onClick={() => this.selectTool('FreehandScissors')}><i*/}
                    {/*    className={`fas fa-bezier-curve ${style.i}`}/><br/>spline*/}
                    {/*</div>*/}
                    <div
                        className={`${style.navlist} ${this.state.currentTool === "RectangleScissors" ? style.active : ""}`}
                        onClick={() => this.selectTool('RectangleScissors')}><i
                        className={`far fa-square  ${style.i}`}/><br/>rectangle
                    </div>
                    {/*<div*/}
                    {/*    className={`${style.navlist} ${this.state.currentTool === "FreehandScissors" ? style.active : ""}`}*/}
                    {/*    onClick={() => this.selectTool('FreehandScissors')}><i*/}
                    {/*    className={`fas fa-draw-polygon ${style.i}`}/><br/>polygon*/}
                    {/*</div>*/}
                    <div
                        className={`${style.navlist} ${this.state.currentTool === "CircleScissors" ? style.active : ""}`}
                        onClick={() => this.selectTool('CircleScissors')}>
                        <i className={`far fa-circle ${style.i}`}/><br/>circle
                    </div>
                    <div
                        className={`${style.navlist} ${this.state.currentTool === "CorrectionScissors" ? style.active : ""}`}
                        onClick={() => this.selectTool('CorrectionScissors')}><i
                        className={`fas fa-eraser ${style.i}`}/><br/>correction
                    </div>

                </div>
            </div>)
    }
}

export default MainNav

