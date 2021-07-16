import * as BABYLON from 'babylonjs'


$("#menu-toggle").click(function (e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

let scene = null;
let lines = [];
let linesDisp = {};

function renderWireframe(data) {
    var canvas = document.getElementById('wireframe');
    var engine = new BABYLON.Engine(canvas, true);

    var createScene = function () {
        scene = new BABYLON.Scene(engine);

        window.camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, BABYLON.Vector3.Zero(), scene);
        camera.setPosition(new BABYLON.Vector3(0, 0, 0));
        camera.attachControl(canvas, true);
        camera.allowupsidedown = true;
        camera.radius = 15;

        var light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);

        window.contours = data.contours;
        window.mean = data.mean;
        window.std = data.std;

        window.frame_idx = 0;

        window.lax_reg = /ch|lax/i;
        window.sax_reg = /sax|cine/i;
        window.crossview = new Crossview(data, frame_idx);
        window.cur_sax_lax_idx = crossview.render_cross(frame_idx);
        window.cur_idx_indicator = $("#cur_idx");

        window.frame_len = contours.length;
        window.lines = [];
        window.first_frame = contours[frame_idx];
        window.default_color = new BABYLON.Color3(0.93, 0.93, 0.93);

        window.desc_color_mapping = [{"reg":window.lax_reg , "color": new BABYLON.Color3(0.25, 0.47, 1)},
            {"reg": window.sax_reg, "color": new BABYLON.Color3(1, 0.5, 0.39)},
        ];
        // window.desc_color_mapping = [{"reg": /CH/ig, "color": new BABYLON.Color3(1,1,1)},
        //     {"reg": /^SAX/ig, "color": new BABYLON.Color3(1, 0.5, 0.39)},
        // ];
        for (let len = first_frame.length, i = 0; i < len; i++) {
            var myPoints = first_frame[i].data.map((vector) => new BABYLON.Vector3((vector[0] - mean[0]) / std[0], (vector[1] - mean[1]) / std[1], (vector[2] - mean[2]) / std[2]));
            var desc = first_frame[i].desc;
            for (let len = desc_color_mapping.length, i = 0; i < len; i++) {
                if (desc_color_mapping[i].reg.test(desc)) {
                    default_color = desc_color_mapping[i].color;
                    break;
                }
            }
            var series_id = first_frame[i].series_id;
            // var desc = first_frame[i].desc;
            let line_id = frame_idx + "|";
            if (window.sax_reg.test(desc)) {
                line_id += ("sax|" + series_id);
            } else {
                line_id += ("lax|" + series_id);
            }
            var line_color = default_color;

            var line = BABYLON.MeshBuilder.CreateLines(line_id, {points: myPoints}, scene);
            line.color = line_color;
            line.isPickable = true;
            //line.enableEdgesRendering();
            //line.edgesWidth = 5;
            // lines.push(line);

            line_id = id_wo_frameidx(line_id);
            if(line_id in lines){
                lines[line_id].push(line);
            }else{
                lines[line_id] = [line];
            }

            //Display the lines
            linesDisp[line_id] = {"desc":desc, "disp":true};
            line.setEnabled(linesDisp[line_id].disp);
        }
        frame_idx = (frame_idx + 1) % frame_len;

        scene.onPointerDown = function (evt, pickResult) {
            if (pickResult.hit) {
                console.log(pickResult.pickedMesh);
                let name = pickResult.pickedMesh.name.split("|");
                let frame_idx = parseInt(name[0]);
                let type = name[1];
                let series_id = name[2];
                console.log("type:", type, cur_sax_lax_idx);
                if (type === "sax") {
                    cur_sax_lax_idx['sax'] = series_id;
                } else {
                    cur_sax_lax_idx['lax'] = series_id;
                }

                crossview.render_cross(frame_idx, cur_sax_lax_idx['sax'], cur_sax_lax_idx['lax'])

            }
        };

        renderTriggers(lines, linesDisp);

        window.lines = lines;
        window.contours = contours;
        return scene;
    };

    scene = createScene();
    engine.runRenderLoop(function () {
        scene.render();
    });

    window.addEventListener('resize', function () {
        engine.resize();
    });
}


var playWirefrmae = null;

function renderTriggers(lines, linesDisp){
    var dispContainer = $('#triggerContainer');
    dispContainer.html("");
    for(let line_id in lines){
        var line_arr = lines[line_id];
        // for(line_id in line_arr){
        var line = line_arr[0];
        var id = id_wo_frameidx(line.name);
        var desc = linesDisp[id].desc.replace("INNER_","");
        var disp = linesDisp[id].disp;
        let isDisp = linesDisp[id].disp;
        dispContainer.append("<button type='button' id='"+id+"' class='btn "+(isDisp?"btn-primary":"btn-secondary")+" btn-sm disp-item disp-"+disp+"'>"+desc+"</button>")

    }
    $("#triggerContainer .disp-item").click(function(e){
        let id = e.target.id;
        let isDisp = linesDisp[id].disp;
        if(isDisp){
            $(e.target).removeClass('btn-primary').addClass('btn-secondary');
            linesDisp[id].disp = false;
        }else{
            $(e.target).removeClass('btn-secondary').addClass('btn-primary');
            linesDisp[id].disp = true;
        }
        lines[id][0].setEnabled(linesDisp[id].disp);
        if(lines[id].length>1){
            lines[id][1].setEnabled(linesDisp[id].disp);
        }
    });
}

function id_wo_frameidx(id){
    return id.split("|").splice(1).join("|");
}

function move_slices(frame_idx) {
    cur_idx_indicator.html(frame_idx);
    for (let lineId in lines) {
        line = lines[lineId];
        line[0].dispose();
        if(line.length>1){
            line[1].dispose();
        }
        delete(lines[lineId]);
    }

    let frame_contour = contours[frame_idx];
    for (let len = frame_contour.length, i = 0; i < len; i++) {
        var myPoints = frame_contour[i].data.map((vector) => new BABYLON.Vector3((vector[0] - mean[0]) / std[0], (vector[1] - mean[1]) / std[1], (vector[2] - mean[2]) / std[2]));
        var desc = frame_contour[i].desc;
        for (let len = desc_color_mapping.length, i = 0; i < len; i++) {
            if (desc_color_mapping[i].reg.test(desc)) {
                default_color = desc_color_mapping[i].color;
                break;
            }
        }
        var series_id = frame_contour[i].series_id;
        var desc = frame_contour[i].desc;
        let line_id = frame_idx + "|";
        if (window.sax_reg.test(desc)) {
            line_id += ("sax|" + series_id);
        } else {
            line_id += ("lax|" + series_id);
        }


        var line_color = default_color;

        var line = BABYLON.MeshBuilder.CreateLines(line_id, {points: myPoints}, scene);
        line.color = line_color;
        //line.enableEdgesRendering();
        //line.edgesWidth = 5;
        // lines.push(line);

        line_id = id_wo_frameidx(line_id);
        if(line_id in lines){
            lines[line_id].push(line);
        }else{
            lines[line_id] = [line];
        }

        if(!(line_id in linesDisp)){
            linesDisp[line_id] = {"desc":desc, "disp":true};
        }
        line.setEnabled(linesDisp[line_id].disp);
    }
    renderTriggers(lines, linesDisp);

    crossview.render_cross(frame_idx, cur_sax_lax_idx['sax'], cur_sax_lax_idx['lax'])

}


$("#wireframe-prev").click(function () {
    frame_idx = (frame_idx - 1)<0?(frame_len-1):(frame_idx - 1);

    move_slices(frame_idx)
});
$("#wireframe-next").click(function () {
    frame_idx = (frame_idx + 1) % frame_len;
    move_slices(frame_idx)
});


$("#wireframe-toggle").click(
    function () {
        if (playWirefrmae === null) {
            playWirefrmae = setInterval(function () {
                frame_idx = (frame_idx + 1) % frame_len;
                move_slices(frame_idx)

            }, 200);
        } else {
            clearInterval(playWirefrmae);
            playWirefrmae = null;
        }

    }
);

$('#render').click(function () {
    $(".loading").removeClass("invisible");
    if (scene != null) {
        scene.dispose();
    }
    let study_id = $('#study_list').children("option:selected").val();
    let t = (new Date()).getTime();
    if (study_id != "") {
        $.get(`/wireframe/instance/${instance_id}/study/${study_id}?t=${t}`, function (data) {
            renderWireframe(data);
            $(".loading").addClass("invisible");
        })
    }
});

$('#lax_del').click(function(){
    let delurl = $('#lax_del').attr('delurl')
    let confirm_status = confirm("Delete current series")
    if(confirm_status === true){
        $.ajax({
            url: delurl,
            type: "DELETE",
            success: function(result){
                $('#lax_del').addClass("disabled")
            }
        })
    }
})

$('#sax_del').click(function(){
    let delurl = $('#sax_del').attr('delurl')
    let confirm_status = confirm("Delete current series")
    if(confirm_status === true){
        $.ajax({
            url: delurl,
            type: "DELETE",
            success: function(result){
                $('#sax_del').addClass("disabled")
            }
        })
    }
})


let Crossview = class {
    constructor(data) {
        this.contours = data.contours;
        this.cur_frame_idx = 0;
        this.sax_img = $("#sax_img");
        this.sax_workbench = $("#sax_url");
        this.sax_del = $("#sax_del")
        this.sax_desc = $("#sax_desc");

        this.lax_img = $("#lax_img");
        this.lax_workbench = $("#lax_url");
        this.lax_del = $("#lax_del")
        this.lax_desc = $("#lax_desc");

    }

    render_cross(frame_idx, sax_idx, lax_idx) {
        this.cur_frame_idx = frame_idx;
        let contour = this.contours[frame_idx];
        console.log(frame_idx, sax_idx, lax_idx);
        if (sax_idx === undefined) {
            for (var len = contour.length, i = 0; i < len; i++) {
                if (window.sax_reg.test(contour[i]['desc'])) {
                    sax_idx = contour[i]['series_id'];
                    break;
                }
            }
        }
        if (lax_idx === undefined) {
            for (var len = contour.length, i = 0; i < len; i++) {
                if (window.lax_reg.test(contour[i]['desc'])) {
                    lax_idx = contour[i]['series_id'];
                    break;
                }
            }
        }
        let sax_url = "#";
        let lax_url = "#";
        for (var len = contour.length, i = 0; i < len; i++) {
            if (contour[i]['series_id'] === sax_idx) {
                sax_url = contour[i]['file_path'];
                this.sax_img.attr("src", sax_url);
                let sax_workbench = contour[i]['workbench'];
                this.sax_workbench.attr("href", sax_workbench);
                this.sax_del.attr("delurl", contour[i]['delurl'])
                $('#sax_del').removeClass("disabled")
                this.sax_desc.html(contour[i]['desc']);

            } else if (contour[i]['series_id'] === lax_idx) {
                lax_url = contour[i]['file_path'];
                this.lax_img.attr("src", lax_url);
                let lax_workbench = contour[i]['workbench'];
                this.lax_workbench.attr("href", lax_workbench);
                this.lax_del.attr("delurl", contour[i]['delurl'])
                $('#lax_del').removeClass("disabled")
                this.lax_desc.html(contour[i]['desc']);
            }
        }

        return {'sax': sax_idx, 'lax': lax_idx}
    }
};



