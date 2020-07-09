import React from 'react'
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import cornerstoneWrapper from "./CornerstoneWrapper"
import MainLabel from "./MainLabel"

const scrollToIndex = cornerstoneTools.import('util/scrollToIndex');
const divStyle = {
    width: "100%",
    margin: "auto",
    position: "relative",
    display: "flex"
};

const bottomLeftStyle = {
    bottom: "5px",
    left: "5px",
    position: "absolute"
};

const bottomRightStyle = {
    bottom: "5px",
    right: "5px",
    position: "absolute"
};


class CornerstoneElement extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stack: props.stack,
            viewport: cornerstoneWrapper.viewport,
            imageId: props.stack.currentImageIdIndex,
            activeLabels: []
        };

    }

    render() {
        return (
            <div className="mainPanel">
                <div
                    className="viewportElement"
                    style={divStyle}
                    ref={input => {
                        this.element = input;
                    }}
                >
                    <canvas className="cornerstone-canvas"/>
                    <div style={bottomLeftStyle}>
                        Zoom: {(this.state.viewport.scale || 0).toFixed(2)}<br/>
                        Z-index: {this.state.stack.currentImageIdIndex}
                    </div>
                    <div style={bottomRightStyle}>
                        WW/WC: {(this.state.viewport.voi.windowWidth || 0).toFixed(0)} /{" "}
                        {(this.state.viewport.voi.windowCenter || 0).toFixed(0)}
                    </div>
                </div>
                <MainLabel stack={{...this.state.stack}} activeLabels={this.state.activeLabels}/>
            </div>
        )
    }

    onImageRendered = () => {
        // cornerstoneWrapper.loadSegments(this.state.stack.seriesId);
        cornerstoneWrapper.updateViewport();
        let labels = cornerstoneWrapper.getActiveLabelsId();
        let copyLabels = labels.slice();
        copyLabels.shift();
        this.setState({activeLabels: copyLabels, viewport: cornerstoneWrapper.viewport});
    };

    onNewImage = () => {
        const enabledElement = cornerstone.getEnabledElement(this.element);
        this.setState({
            imageId: enabledElement.image.imageId
        });
    };

    onUpdateLabelId = () => {
        let labels = cornerstoneWrapper.getActiveLabelsId();
        let copyLabels = labels.slice();
        copyLabels.shift();
        this.setState({activeLabels: copyLabels});
        cornerstoneWrapper.saveSegments(this.state.stack.seriesId,
            this.state.stack.imageIds[this.state.stack.currentImageIdIndex])
    };

    onNavSlice = (e) => {
        const stackData = cornerstoneTools.getToolState(this.element, "stack");
        const stack = stackData.data[0];
        const stackLength = stack.imageIds.length;
        if (e.keyCode === 39) {
            //arrow right.
            let prevIdx = parseInt(stack.currentImageIdIndex);
            let curIdx = parseInt((prevIdx+1)%stackLength);
            scrollToIndex(this.element, curIdx);
            this.props.onUpdateIndex(prevIdx, curIdx);

            // stack.currentImageIdIndex = ++this.state.stack.currentImageIdIndex % stackLength;
            // scrollToIndex(this.element, this.state.stack.currentImageIdIndex++);
        } else if (e.keyCode === 37) {
            // arrow left.
            let prevIdx = parseInt(stack.currentImageIdIndex);
            let curIdx = parseInt((prevIdx-1)<0?(stackLength-1):(prevIdx-1));
            scrollToIndex(this.element, curIdx);
            this.props.onUpdateIndex(prevIdx, curIdx);

            // stack.currentImageIdIndex = --this.state.stack.currentImageIdIndex;
            // scrollToIndex(this.element, this.state.stack.currentImageIdIndex--);
        } else if (e.keyCode === 80) {
            if (this.playHook === undefined) {
                this.play();
            } else {
                clearInterval(this.playHook);
                this.playHook = undefined;
            }
        }else if (e.keyCode === 40) {
            //arrow down. Switch to the next series.

            window.location.href = window.location.href.replace(/\d+$/, function(n){return parseInt(n)+1})

        } else if (e.keyCode === 38) {
            // arrow up, switch to the prev section.
            window.location.href = window.location.href.replace(/\d+$/, function(n){return parseInt(n)-1});

        }
        cornerstone.updateImage(this.element);
    };



    play = () => {
        let _this = this;
        this.playHook = setInterval(() => {
            _this.onNavSlice({'keyCode': 39})
        }, 100)
    };


    componentDidMount() {
        const element = this.element;
        cornerstoneWrapper.init(element, this.state, () => {
            element.addEventListener("cornerstoneimagerendered",this.onImageRendered);
            element.addEventListener("cornerstonenewimage", this.onNewImage);

            element.addEventListener("cornerstonetoolsmouseup", this.onUpdateLabelId);
            element.addEventListener("cornerstonetoolstouchend", this.onUpdateLabelId);
            document.addEventListener('keydown', this.onNavSlice);
            window.navSlice = this.onNavSlice
        });


        // debugger;
        // let colors = cornerstoneWrapper.getAllSegmentsColor(this.state.stack.imageIds.length)


    }

    componentWillUnmount() {
        const element = this.element;
        element.removeEventListener(
            "cornerstoneimagerendered",
            this.onImageRendered
        );

        element.removeEventListener("cornerstonenewimage", this.onNewImage);

        window.removeEventListener("resize", this.onWindowResize);

        cornerstone.disable(element);
    }

    componentDidUpdate(prevProps, prevState) {
        const stackData = cornerstoneTools.getToolState(this.element, "stack");
        const stack = stackData.data[0];
        stack.currentImageIdIndex = this.state.stack.currentImageIdIndex;
        stack.imageIds = this.state.stack.imageIds;
        cornerstoneTools.addToolState(this.element, "stack", stack);


        //const imageId = stack.imageIds[stack.currentImageIdIndex];
        //cornerstoneTools.scrollToIndex(this.element, stack.currentImageIdIndex);
    }


}

// const stack = {
//     imageIds: [imageId],
//     currentImageIdIndex: 0
// };

const MainPanel = (props) => {
    return (
        <CornerstoneElement stack={{...props.stack}} onUpdateIndex={props.onUpdateIndex}/>
    )
};
localStorage.setItem("debug", "cornerstoneTools");

export default MainPanel
