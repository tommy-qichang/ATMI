import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import * as dicomParser from "dicom-parser";
import Hammer from "hammerjs";
import {forEach} from "react-bootstrap/cjs/ElementChildren";

/***
 * Cornerstone and Cornerstone tool wrapper with utils.
 * @type {{init: cornerstoneWrapper.init, viewport: null, isInitialized: boolean, bind_event: cornerstoneWrapper.bind_event, element: null}}
 */
let cornerstoneWrapper = {
    isInitialized: false,
    element: null,
    viewport: cornerstone.getDefaultViewport(null, undefined),
    updatelist:[],
    updateLabelLock : false,
    autosaveCallback: null,
    init: function (element, state, callback) {
        if (!this.isInitialized) {
            // this.viewport = ;
            cornerstoneTools.external.cornerstone = cornerstone;
            cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
            cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
            cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
            cornerstoneTools.external.Hammer = Hammer;
            cornerstoneTools.init();

            // Enable the DOM Element for use with Cornerstone
            cornerstone.enable(element);
            this.element = element;
            this.state = state;

            this.iniTools();
            this.bindEvent();
            // Load the first image in the stack
            cornerstone.loadImage(state.stack.imageIds[state.imageId]).then(image => {
                // Display the first image
                cornerstone.displayImage(this.element, image);
                // Add the stack tool state to the enabled element
                const stack = state.stack;
                cornerstoneTools.addStackStateManager(element, ["stack"]);
                cornerstoneTools.addToolState(element, "stack", stack);

                const {setters, getters} = cornerstoneTools.getModule(
                    'segmentation'
                );
                setters.metadata(this.element, 0, 0);
                setters.activeLabelmapIndex(this.element, 0);

                callback();
                this.loadSegments(this.state.stack.seriesId);


            });


        }
        this.isInitialized = true;

    },
    iniTools: function () {

        // Grab Tool Classes
        const WwwcTool = cornerstoneTools.WwwcTool;
        const PanTool = cornerstoneTools.PanTool;
        const PanMultiTouchTool = cornerstoneTools.PanMultiTouchTool;
        const ZoomTool = cornerstoneTools.ZoomTool;
        const ZoomTouchPinchTool = cornerstoneTools.ZoomTouchPinchTool;
        const ZoomMouseWheelTool = cornerstoneTools.ZoomMouseWheelTool;

        const FreehandScissorsTool = cornerstoneTools.FreehandScissorsTool;
        const CircleScissorsTool = cornerstoneTools.CircleScissorsTool;
        const RectangleScissorsTool = cornerstoneTools.RectangleScissorsTool;
        const CorrectionScissorsTool = cornerstoneTools.CorrectionScissorsTool;

        const StackScrollTool = cornerstoneTools.StackScrollTool;
        const StackScrollMouseWheelTool = cornerstoneTools.StackScrollMouseWheelTool;

        const BrushTool = cornerstoneTools.BrushTool;


        // const FreehandMouseTool = cornerstoneTools.FreehandMouseTool;
        // const EllipticalRoiTool = cornerstoneTools.EllipticalRoiTool;
        // const RectangleRoiTool = cornerstoneTools.RectangleRoiTool;
        const configuration = cornerstoneTools.store.modules.segmentation.configuration;
        configuration.outlineWidth = 1;
        configuration.fillAlpha = 0.05;
        // Add them
        cornerstoneTools.addTool(PanTool);
        cornerstoneTools.addTool(ZoomTool);
        cornerstoneTools.addTool(WwwcTool);
        cornerstoneTools.addTool(PanMultiTouchTool);
        cornerstoneTools.addTool(ZoomTouchPinchTool);
        cornerstoneTools.addTool(ZoomMouseWheelTool);

        cornerstoneTools.addTool(cornerstoneTools.ZoomTool, { configuration: { invert: false, preventZoomOutsideImage: false, minScale: .1, maxScale: 20.0, } });


        cornerstoneTools.addTool(FreehandScissorsTool);
        cornerstoneTools.addTool(CircleScissorsTool);
        cornerstoneTools.addTool(RectangleScissorsTool);
        cornerstoneTools.addTool(CorrectionScissorsTool);
        cornerstoneTools.addTool(StackScrollTool,{configuration:{loop:true}});
        cornerstoneTools.addTool(StackScrollMouseWheelTool,{configuration:{loop:true}});

        cornerstoneTools.addTool(BrushTool,{configuration:{alwaysEraseOnClick:true}});



        // Set tool modes
        // cornerstoneTools.setToolActive("Pan", {mouseButtonMask: 4}); // Middle
        cornerstoneTools.setToolActive("Wwwc", {mouseButtonMask: 1}); // Left & Touch

        cornerstoneTools.setToolActive("ZoomMouseWheel", {});
        cornerstoneTools.setToolActive("ZoomTouchPinch", {});

        // cornerstoneTools.setToolActive('StackScroll', {mouseButtonMask: 1});
        // cornerstoneTools.setToolActive('StackScrollMouseWheel', {mouseButtonMask: 1});

        // cornerstoneTools.setToolActive("Pan",  { mouseButtonMask: 4 });
        // cornerstoneTools.setToolActive("Zoom", {mouseButtonMask: 4}); // Right
        // cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 1 });

        // cornerstoneTools.setToolActive('Brush')

    },
    bindEvent: function () {
        let _this = this;
        window.addEventListener("resize", function () {
            cornerstone.resize(_this.element);
        });
        setInterval(function(){
            if(!_this.updateLabelLock && _this.updatelist.length>0){
                let updateId = _this.updatelist.shift();
                console.log("updateId:",updateId, _this.updatelist[updateId]);
                let ids = updateId.split("*-$");
                _this._saveSegments(ids[0], ids[1], ids[2]);
            }
        },500)
    },
    getActiveLabelsId: function () {
        const {configuration, getters, setters, state} = cornerstoneTools.getModule(
            'segmentation'
        );
        let labelmap = getters.labelmap2D(this.element).labelmap2D;
        return labelmap.segmentsOnLabelmap;
    },
    updateViewport: function () {
        this.viewport = cornerstone.getViewport(this.element);
    },
    enableTool: function (type, mousemask) {
        /***
         * type=["Wwwc", "FreehandScissors", "CircleScissors", "RectangleScissors", "CorrectionScissors"]
         */
        if(mousemask === undefined){
            mousemask = 1
        }
        console.log("enable:"+type+" mousemask:"+mousemask);
        cornerstoneTools.setToolActive(type, {mouseButtonMask: mousemask});

    },
    getAllSegmentsColor: function (length) {
        const {getters, setters} = cornerstoneTools.getModule('segmentation');
        setters.colorLUT(1);
        this.colormap = getters.colorLUT(1);
        // Hack for the function setColorLUT will unshft [0,0,0,0] as background color, so need to shift to recover the original colormap.
        this.colormap.shift();
        this.colormap.shift();
        this.needUpdateColormap = true;

        let brushColors = [];
        for (let i = 0; i < length; i++) {
            brushColors.push("rgba(" + this.colormap[i + 1].join(",") + ")")
        }
        return brushColors;
    },
    loadStack: function (element, stack) {
        cornerstone.loadImage(imageIds[idx]).then(function (image) {
            cornerstone.displayImage(element, image);
            cornerstoneTools.addStackStateManager(element, ['stack']);
            cornerstoneTools.addToolState(element, 'stack', stack);
        });
    },
    activeSegmentByIndex: function (index) {
        const {configuration, getters, setters} = cornerstoneTools.getModule(
            'segmentation'
        );
        if (this.needUpdateColormap) {
            setters.colorLUT(1, this.colormap);
            this.needUpdateColormap = false;
        }
        setters.activeSegmentIndex(this.element, index);
        cornerstone.updateImage(this.element);
    },
    toggleSegmentByIndex: function (index) {
        const {configuration, getters, setters} = cornerstoneTools.getModule(
            'segmentation'
        );

        // this.loadSegments(5, ["2_export0001.dcm"]);
        // this.saveSegments(5, ["2_export0001.dcm"]);
        //

        setters.toggleSegmentVisibility(this.element, index);
        cornerstone.updateImage(this.element);
    },
    undoSegment: function(){
        const {configuration, getters, setters} = cornerstoneTools.getModule(
            'segmentation'
        );
        setters.undo(this.element);
    },
    redoSegment: function(){
        const {configuration, getters, setters} = cornerstoneTools.getModule(
            'segmentation'
        );
        setters.redo(this.element);
    },
    deleteSegmentByIndex: function (index) {

        const {configuration, getters, setters} = cornerstoneTools.getModule(
            'segmentation'
        );

        let labelmap2D = getters.labelmap2D(this.element).labelmap2D;
        // Remove this segment from the list.
        const indexOfSegment = labelmap2D.segmentsOnLabelmap.indexOf(
            index
        );
        labelmap2D.segmentsOnLabelmap.splice(indexOfSegment, 1);
        const pixelData = labelmap2D.pixelData;
        // Delete the label for this segment.
        for (let p = 0; p < pixelData.length; p++) {
            if (pixelData[p] === index) {
                pixelData[p] = 0;
            }
        }

        // setters.deleteSegment(this.element, index);
        cornerstone.updateImage(this.element);

    },
    setAutosaveCallback: function(callback){
        this.autosaveCallback = callback;
    },
    saveSegments: function (seriesId, fileId) {
        const {getters} = cornerstoneTools.getModule(
            'segmentation'
        );
        let labelmap = getters.labelmap2D(this.element);
        let imageIdx = labelmap.currentImageIdIndex;

        let updateId = seriesId+"*-$"+fileId+"*-$"+imageIdx;
        if(this.updatelist.length===0 || this.updatelist[this.updatelist.length-1] !== updateId){
            this.updatelist.push(updateId)
        }

        console.log("save id:",seriesId+"*-$"+fileId+"*-$"+imageIdx, this.updatelist[seriesId+"*-$"+fileId+"*-$"+imageIdx])
    },

    _saveSegments: function (seriesId, fileId, imageIdx) {
        this.updateLabelLock = true;
        this.autosaveCallback(false);
        const {getters} = cornerstoneTools.getModule(
            'segmentation'
        );
        let labelmap = getters.labelmap2D(this.element);
        // debugger;
        let pixelData = labelmap.labelmap3D.labelmaps2D[imageIdx].pixelData;

        let rawPixelData = Array.from(pixelData);
        let compressedPixelData = {};
        for(let i=0;i<rawPixelData.length;i++){
            if(rawPixelData[i]>0){
                if(compressedPixelData[rawPixelData[i]] === undefined){
                    compressedPixelData[rawPixelData[i]] = [i]
                }else{
                    compressedPixelData[rawPixelData[i]].push(i)
                }
            }
        }

        let postContent = {
            "labelmap2D": {
                "pixelData": compressedPixelData,
                "segmentsOnLabelmap": labelmap.labelmap2D.segmentsOnLabelmap,
                "dataLength": rawPixelData.length
            }
        };

        let fileId_new = fileId.replace(/^.+\/+/ig, '');
        var _this = this;
        fetch(`/series/${seriesId}/files/${fileId_new}/labels`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postContent)
        }).then(function(){
            _this.updateLabelLock = false;
            _this.autosaveCallback(true)
        }).catch(function(){
            _this.updateLabelLock = false;
            _this.autosaveCallback(false)
        });

        // delete this.updatelist[seriesId+"*-$"+fileId];
        console.log("delete id:",seriesId+"*-$"+fileId+"*-$"+imageIdx);
    },
    replaceSegments: function(prevIdx, curIdx){
        const {configuration, getters, setters, state} = cornerstoneTools.getModule(
            'segmentation'
        );
        let labelmap3D = getters.labelmap3D(this.element);
        if(labelmap3D.labelmaps2D[prevIdx] != undefined){
            labelmap3D.labelmaps2D[curIdx].dataLength = labelmap3D.labelmaps2D[prevIdx].dataLength;
            labelmap3D.labelmaps2D[curIdx].pixelData = [...labelmap3D.labelmaps2D[prevIdx].pixelData];
            labelmap3D.labelmaps2D[curIdx].segmentsOnLabelmap = [...labelmap3D.labelmaps2D[prevIdx].segmentsOnLabelmap];

            // labelmap3D.labelmaps2D[curIdx] = JSON.parse(JSON.stringify(labelmap3D.labelmaps2D[prevIdx]));
            setters.updateSegmentsOnLabelmap2D(labelmap3D.labelmaps2D[curIdx]);
            cornerstone.updateImage(this.element);
        }
    },
    loadSegments: function (seriesId) {
        const {configuration, getters, setters, state} = cornerstoneTools.getModule(
            'segmentation'
        );
        fetch(`/series/${seriesId}/labels?t=${new Date().getTime()}`, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(data => {
            return data.json();
        }).then(data => {
            if (data.length === 0) return;
            let ref = {};
            for (let i = 0; i < data.length; i++) {
                ref[data[i]['file_id']] = data[i];
            }
            let imageIds = this.state.stack.imageIds;
            let labelmap3D = getters.labelmap3D(this.element);

            for (let i = 0; i < imageIds.length; i++) {
                let imageId = imageIds[i].replace(/^.+\/+/ig, '');
                if (ref[imageId] !== undefined) {
                    let labelmap2D = JSON.parse(ref[imageId].content);
                    labelmap2D = labelmap2D.labelmap2D;
                    let pixelIndex = labelmap2D['pixelData'];
                    //the labelmap stored in the server are index information, need to conver to mask array.
                    let real_mask = Array(labelmap2D['dataLength']).fill(0);
                    for(let j in pixelIndex){
                        let indexes = pixelIndex[j];
                        for(let k=0;k<indexes.length;k++){
                            real_mask[indexes[k]] = parseInt(j);
                        }
                    }
                    // labelmap2D['pixelData'] = new Uint16Array(labelmap2D['pixelData']);

                    labelmap2D['pixelData'] = real_mask;
                    labelmap3D.labelmaps2D[i || 0] = labelmap2D;
                    setters.updateSegmentsOnLabelmap2D(labelmap2D);

                }

            }

            cornerstone.updateImage(this.element);


            // let labelmap2D = JSON.parse(data[0].content);
            // labelmap2D = labelmap2D.labelmap2D;
            // labelmap2D['pixelData'] = new Uint16Array(labelmap2D['pixelData']);
            //
            // labelmap3D = getters.labelmap3D(this.element);
            // labelmap3D.labelmaps2D[labelmap3D.currentImageIdIndex || 0] = labelmap2D;
            // setters.updateSegmentsOnLabelmap2D(labelmap2D);
            // cornerstone.updateImage(this.element);
        })
    }

};

export default cornerstoneWrapper;