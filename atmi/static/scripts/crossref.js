import * as BABYLON from 'babylonjs'


$("#menu-toggle").click(function (e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

let scene = null;
let lines = [];

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
        window.crossview = new Crossview(data, frame_idx);
        window.cur_sax_lax_idx = crossview.render_cross(frame_idx);
        window.cur_idx_indicator = $("#cur_idx");

        window.frame_len = contours.length;
        window.lines = [];
        window.first_frame = contours[frame_idx];
        window.default_color = new BABYLON.Color3(0.93, 0.93, 0.93);
        window.desc_color_mapping = [{"reg": /CH/ig, "color": new BABYLON.Color3(0.25, 0.47, 1)},
            {"reg": /^SAX/ig, "color": new BABYLON.Color3(1, 0.5, 0.39)},
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
            var desc = first_frame[i].desc;
            let line_id = frame_idx + "|";
            if (/sax/ig.test(desc)) {
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

            lines.push(line)
        }
        frame_idx = (frame_idx + 1) % frame_len;

        scene.onPointerDown = function (evt, pickResult) {
            if (pickResult.hit) {
                console.log(pickResult.pickedMesh);
                let name = pickResult.pickedMesh.name.split("|");
                let frame_idx = parseInt(name[0]);
                let type = name[1];
                let series_id = name[2];
                if (type === "sax") {
                    cur_sax_lax_idx['sax'] = series_id;
                } else {
                    cur_sax_lax_idx['lax'] = series_id;
                }

                crossview.render_cross(frame_idx, cur_sax_lax_idx['sax'], cur_sax_lax_idx['lax'])

            }
        };

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

$("#wireframe-toggle").click(
    function () {
        if (playWirefrmae === null) {
            playWirefrmae = setInterval(function () {
                frame_idx = (frame_idx + 1) % frame_len;

                cur_idx_indicator.html(frame_idx);
                for (let len = lines.length, i = 0; i < len; i++) {
                    line = lines.pop();
                    line.dispose();
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
                    if (/sax/ig.test(desc)) {
                        line_id += ("sax|" + series_id);
                    } else {
                        line_id += ("lax|" + series_id);
                    }


                    var line_color = default_color;

                    var line = BABYLON.MeshBuilder.CreateLines(line_id, {points: myPoints}, scene);
                    line.color = line_color;
                    //line.enableEdgesRendering();
                    //line.edgesWidth = 5;
                    lines.push(line);
                }

                crossview.render_cross(frame_idx, cur_sax_lax_idx['sax'], cur_sax_lax_idx['lax'])


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


let Crossview = class {
    constructor(data) {
        this.contours = data.contours;
        this.cur_frame_idx = 0;
        this.sax_img = $("#sax_img");
        this.lax_img = $("#lax_img");
    }

    render_cross(frame_idx, sax_idx, lax_idx) {
        this.cur_frame_idx = frame_idx;
        let contour = this.contours[frame_idx];
        if (sax_idx === undefined) {
            for (var len = contour.length, i = 0; i < len; i++) {
                if (/SAX/ig.test(contour[i]['desc'])) {
                    sax_idx = contour[i]['series_id'];
                    break;
                }
            }
        }
        if (lax_idx === undefined) {
            for (var len = contour.length, i = 0; i < len; i++) {
                if (/CH/ig.test(contour[i]['desc'])) {
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
                this.sax_img.attr("src", sax_url + "?" + Math.random());
            } else if (contour[i]['series_id'] === lax_idx) {
                lax_url = contour[i]['file_path'];
                this.lax_img.attr("src", lax_url + "?" + Math.random());
            }
        }

        return {'sax': sax_idx, 'lax': lax_idx}
    }
};



