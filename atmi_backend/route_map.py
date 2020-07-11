import datetime
import io
import os
from os import path
from threading import Thread

from flask import render_template, Response, send_from_directory, jsonify, send_file, request, session, redirect, json

from atmi_backend.config import REGISTER_MAX_HOURS, SERIES_STATUS, STUDY_STATUS, INSTANCE_STATUS
from atmi_backend.db_interface.InitialService import InitialService
from atmi_backend.db_interface.InstanceService import InstanceService
from atmi_backend.db_interface.LabelCandidatesService import LabelCandidatesService
from atmi_backend.db_interface.LabelService import LabelService
from atmi_backend.db_interface.SeriesService import SeriesService
from atmi_backend.db_interface.StudiesService import StudiesService
from atmi_backend.db_interface.UserService import UserService
from atmi_backend.services.ExportService import ExportService
from atmi_backend.services.ImportService import ImportService
from atmi_backend.utils import to_bool_or_none


def setup_route_map(app, app_path):  # noqa: C901
    def get_conn():
        ini_service = InitialService()
        return ini_service.get_connection()

    """
    Page Response
    """

    @app.route("/", methods=['GET'])
    def index():
        username = ''
        user_service = UserService(get_conn())
        if 'email' in session:
            username = session['email']
        if len(request.args) > 0:
            try:
                user = request.args.get('user', default='')
                ts = request.args.get('ts', default=0)
                if len(user_service.query({'email': user, 'init_code': ts})) > 0:
                    now = datetime.datetime.now().timestamp()
                    ts = float(ts)
                    hours = (now - ts) / (60 * 60)
                    if hours > REGISTER_MAX_HOURS:
                        return redirect("/", code=302)
                elif len(user_service.query({})) == 0:
                    # The first time register.
                    # /?user=tommy.qichang@gmail.com
                    return render_template("index.html", data={'username': username, 'ini_admin': "false"})
                else:
                    return redirect("/", code=302)
            except Exception:
                return redirect("/", code=302)
        elif len(user_service.query({})) == 0:
            return redirect("/ini_admin", code=302)

        return render_template("index.html", data={'username': username, 'ini_admin': "false"})

    @app.route("/ini_admin", methods=['GET'])
    def index_newadmin():
        user_service = UserService(get_conn())
        if len(user_service.query({})) == 0:
            return render_template("index.html", data={'ini_admin': "true"})
        else:
            return redirect("/", code=302)

    @app.route("/workbench/instance/<instance_id>/study/<study_id>", methods=['GET'])
    def workbench_redict(instance_id, study_id):
        series_service = SeriesService(get_conn())
        series = series_service.query({"study_id": study_id})
        if len(series) > 0:
            series_id = series[0]['series_id']
        return redirect(f"/workbench/instance/{instance_id}/study/{study_id}/series/{series_id}", code=302)

    @app.route("/workbench/instance/<instance_id>/study/<study_id>/series/<series_id>", methods=['GET'])
    def workbench(instance_id, study_id, series_id):
        study_service = StudiesService(get_conn())
        study_info = study_service.query({"study_id": study_id})
        if len(study_info) > 0 and study_info[0]["instance_id"] == int(instance_id):
            study_info = study_info[0]
        else:
            return render_template("404.html")
        label_candidate_service = LabelCandidatesService(get_conn())
        label_candidates = label_candidate_service.query({"instance_id": instance_id})

        series_service = SeriesService(get_conn())

        series = series_service.query({"study_id": study_id, "series_id": series_id})
        if len(series) > 0 and len(series[0]) > 3:
            series = series[0]
            series["series_files_list"] = eval(series["series_files_list"])

        result = {"instance_id": instance_id, "study_id": study_id, "series_id": series_id,
                  "study_path": os.path.join(study_info["folder_name"], ""), "label_candidates": label_candidates,
                  "series_detail": series, "dim": [series['x_dimension'], series['y_dimension'], series['z_dimension']]}

        return render_template("workbench.html", data=result)

    """
    JSON Responses
    """

    @app.route('/init/<init_code>', methods=['GET'])
    def init(init_code=None):

        ini_service = InitialService()
        has_record = ini_service.has_records()

        if not has_record:
            return jsonify(["", "", 0]), 200
        elif init_code is not None:
            user_service = UserService(get_conn())
            user = user_service.query({"init_code": init_code})
            if len(user) > 0:
                user = user[0]
                return jsonify([user["name"], user["email"], user["user_type"]]), 200

        return jsonify([]), 200

    @app.route('/user', methods=['POST', 'PUT', 'GET'], strict_slashes=False)
    def registry_user():
        user_service = UserService(get_conn())
        if request.method == 'PUT':
            email = request.json['email']
            pwd = request.json['password']
            # Update password based on the email
            status = user_service.update(email, {"pwd": pwd, "init_code": ""})
            if not status and len(user_service.query({})) == 0:
                ts = datetime.datetime.now().timestamp()
                user_service.insert(email, email, pwd, str(ts), 0)
            return Response("{status: true }", status=201, mimetype='application/json')
        elif request.method == 'GET':
            users = user_service.query({})
            return jsonify(users), 200
        elif request.method == 'POST':
            email = request.json['email']
            user_type = request.json['user_type']
            name = request.json['name']
            ts = datetime.datetime.now().timestamp()
            if len(user_service.query({'email': email})) > 0:
                user_service.update(email, {'name': name, 'pwd': '', 'init_code': str(ts), 'user_type': user_type})
            else:
                user_service.insert(email, name, "", str(ts), user_type)
            app.logger.info(f"Create user: user={email}&ts={ts}")
            return jsonify({'url': f'?user={email}&ts={ts}'})

    @app.route('/user/<user_name>/<password>', methods=['GET'])
    def login_user(user_name, password):
        user_service = UserService(get_conn())
        user = user_service.query({'email': user_name, 'pwd': password})
        if len(user) > 0 and ("email" not in session or session['email'] == ''):
            session["email"] = user_name

        return jsonify(user), 200

    @app.route('/logout', methods=['GET'])
    def logout_user():
        session['email'] = ""
        return '{}', 200

    @app.route('/instance/<int:instance_id>', methods=['GET', 'DELETE', "PUT"])
    def instance_detail(instance_id):
        """
        [POST]  /instance/<instance_id>
        name, modality, description, annotator_ids(split by vbar), auditor_ids,
        label_candidates:
        :return:
        """
        instance_service = InstanceService(get_conn())
        label_candidates_service = LabelCandidatesService(get_conn())
        if request.method == "GET":
            instance_info = instance_service.query({"instance_id": instance_id})
            if len(instance_info) == 0:
                return jsonify({}), 200
            label_candidate_service = LabelCandidatesService(get_conn())
            label_candidates = label_candidate_service.query({"instance_id": instance_id})

            json_result = instance_info[0]
            json_result['label_candidates'] = label_candidates

            return jsonify(json_result), 200
        elif request.method == "DELETE":
            status = instance_service.delete({"instance_id": instance_id})
            instance_service.delete_all_users_in_instance(instance_id)
            label_candidates_service.delete({"instance_id": instance_id})
            if status:
                return jsonify({}), 200
            else:
                return jsonify({}), 404
        elif request.method == "PUT":

            instance_info = instance_service.query({"instance_id": instance_id})
            if len(instance_info) == 0:
                return jsonify({}), 200

            data = json.loads(request.data)
            name = data.get("name", "New instance")
            modality = data.get("modality", "CT")
            description = data.get("description", "")
            # data_path = ""  # Set the data_path as default now.
            has_audit = False
            annotator_id = list(filter(None, str.split(data.get("annotator_id", ""), "|")))
            auditor_id = list(filter(None, str.split(data.get("auditor_id", ""), "|")))
            label_candidates = data.get("label_candidates", [])

            instance_service.update({"instance_id": instance_id}, {
                "name": name,
                "modality": modality,
                "description": description,
                "has_audit": has_audit
            })

            instance_service.delete_all_users_in_instance(instance_id)
            for user_id in annotator_id:
                instance_service.insert_user_in_instance(instance_id, user_id, False)
            for user_id in auditor_id:
                instance_service.insert_user_in_instance(instance_id, user_id, True)

            # Delete all label candidates for current instance and add again.
            label_candidates_service.delete({"instance_id": instance_id})
            for label in label_candidates:
                label_type = int(label['label_type'])
                input_type = int(label['input_type'])
                text = label['text']
                contour_label_value = label['contour_label_value']
                label_candidates_service.insert(instance_id, label_type, input_type, text, contour_label_value)

            return jsonify({"instance_id": instance_id}), 201

    @app.route('/instances', methods=['GET', 'POST'])
    def instance_list():

        instance_service = InstanceService(get_conn())
        label_candidates_service = LabelCandidatesService(get_conn())
        if request.method == "GET":
            instances = instance_service.query({})
            return jsonify(instances), 200
        elif request.method == "POST":
            data = json.loads(request.data)
            name = data.get("name", "New instance")
            modality = data.get("modality", "CT")
            description = data.get("description", "")
            data_path = ""  # Set the data_path as default now.
            has_audit = False
            status = 0
            annotator_id = list(filter(None, str.split(data.get("annotator_id", ""), "|")))
            auditor_id = list(filter(None, str.split(data.get("auditor_id", ""), "|")))
            label_candidates = data.get("label_candidates", [])

            instance_id = instance_service.insert(name, modality, description, data_path, has_audit, 0, 0, status)
            if instance_id == -1:
                # Instance name already exist.
                return jsonify({"err": "Instance Name exist"}), 409
            for user_id in annotator_id:
                instance_service.insert_user_in_instance(instance_id, user_id, False)
            for user_id in auditor_id:
                instance_service.insert_user_in_instance(instance_id, user_id, True)
            for label in label_candidates:
                label_type = int(label['label_type'])
                input_type = int(label['input_type'])
                text = label['text']
                contour_label_value = label['contour_label_value']
                label_candidates_service.insert(instance_id, label_type, input_type, text, contour_label_value)

            return jsonify({"instance_id": instance_id}), 201

    @app.route('/instances/<instance_id>/studies', methods=['GET'])
    def list_studies_info(instance_id):
        """
        List all studies basic information.
        :param instance_id:
        :return:
        """
        study_service = StudiesService(get_conn())
        studies = study_service.query({'instance_id': instance_id})
        return jsonify(studies), 200

    @app.route('/studies/instance_id=<int:instance_id>', methods=['GET'])
    def list_all_studies(instance_id):
        """
        List all studies with their series info under one instance.
        :param instance_id:
        :return:
        """
        series_service = SeriesService(get_conn())
        studies = series_service.query_study_series(instance_id)
        # studies_service = StudiesService(get_conn())
        # studies = studies_service.query({"instance_id": instance_id})
        if len(studies) == 0:
            return jsonify({}), 200
        return jsonify(studies), 200

    @app.route('/studies/<int:study_id>/series', methods=['GET'])
    def list_all_series(study_id):
        """
        List all studies under one instance.
        :param instance_id:
        :return:
        """

        series_service = SeriesService(get_conn())
        series = series_service.query({"study_id": study_id})
        if len(series) == 0:
            return jsonify({}), 200

        return jsonify(series), 200

    @app.route('/series/<series_id>/finished', methods=['POST'])
    def finish_series(series_id):
        """
        Mark the status of current series as finished(4)
        If all the labeled series in current study arenot annotating, then set current study as finished.
        :param series_id:
        :return:
        """
        series_service = SeriesService(get_conn())
        series = series_service.query({"series_id": series_id})
        if (len(series) > 0):
            study_id = series[0]['study_id']
            series_service.update({"series_id": series_id}, {"status": SERIES_STATUS.finished.value})

            series_in_current_study = series_service.query({"study_id": study_id})
            all_complete = True
            for one_stu in series_in_current_study:
                status = one_stu['status']
                if status == SERIES_STATUS.annotating.value:
                    all_complete = False
            if all_complete:
                study_service = StudiesService(get_conn())
                study_service.update({"study_id": study_id}, {'status': STUDY_STATUS.finished.value})

        return jsonify({}), 200

    @app.route('/series/<int:series_id>/files/<file_name>/labels', methods=['POST'])
    def add_labels(series_id, file_name):
        # Temporary mock the user Id.
        user_id = 1
        data = request.data
        label_service = LabelService(get_conn())
        status = label_service.insert(series_id, user_id, file_name, data)

        update_status = request.args.get('update_status', type=bool, default=False)
        if update_status:
            series_service = SeriesService(get_conn())
            study_service = StudiesService(get_conn())
            instance_service = InstanceService(get_conn())
            series = series_service.query({'series_id': series_id})
            if len(series) > 0:
                study_id = series[0]['study_id']
                status = series[0]['status']
                if status < SERIES_STATUS.annotating.value:
                    series_service.update({'series_id': series_id}, {'status': SERIES_STATUS.annotating.value})
                study = study_service.query({'study_id': study_id})
                instance_id = study[0]['instance_id']
                if study[0]['status'] != STUDY_STATUS.annotating.value:
                    study_service.update({'study_id': study_id}, {'status': STUDY_STATUS.annotating.value})
                instance = instance_service.query({'instance_id': instance_id})
                if instance[0]['status'] != INSTANCE_STATUS.annotating.value:
                    instance_service.update({'instance_id': instance_id}, {'status': INSTANCE_STATUS.annotating.value})

        if status:
            return jsonify({}), 201
        else:
            return jsonify({status: "Transaction Rollback."}), 404

    @app.route('/series/<int:series_id>/labels', methods=['GET'])
    def get_labels(series_id):
        # Temporary mock the user Id.
        user_id = 1

        label_service = LabelService(get_conn())
        result = label_service.query({"series_id": series_id, "user_id": user_id})
        if len(result) == 0:
            return jsonify([]), 200
        return jsonify(result), 200

    class ImportDcm(Thread):
        def __init__(self, instance_id, data_path):
            Thread.__init__(self)
            self.instance_id = instance_id
            self.data_path = data_path

        def run(self):
            print("Start importing...")
            import_service = ImportService(get_conn())
            import_service.import_dcm(self.instance_id, self.data_path)
            print("End importing process")

    @app.route('/import/instance/<instance_id>', methods=['GET'])
    def load_data(instance_id):
        """
        Load DICOM data for the instance, given the datapath in data folder.
        :param instance_id:
        :param data_path:
        :return:
        """
        data_path = request.args.get('data_path', default=None)
        if data_path is None:
            return jsonify({}), 404
        thread_import_dcm = ImportDcm(instance_id, data_path)
        thread_import_dcm.start()

        return jsonify({'result': 'thread import data'}), 201

    @app.route('/export/instance/<instance_id>', methods=['GET'])
    def export_all_label(instance_id):
        """
        Export all requested data as hdf5 file(s)
        request arguments includes:
        split_entry_num: entry numbers for each hdf5 file. Will create separate files end with ids. Default is 100 entries per file.
        store_type: default root path in the hdf5 is "train"
        save_data/save_label: indicate if save dcm data or labels in the hdf5 file.
        compression: indicate whether the hdf5 compressed using "None, gzip or lzf". default: None. But gzip recommend
        start_idx: Specify the start index of h5 file, useful for continuous export files. default:0
        :param instance_id:
        :return:
        """
        split_entry_num = request.args.get('split_entry_num', default=100, type=int)
        store_type = request.args.get('store_type', default='train')
        save_label = to_bool_or_none(request.args.get('save_label', default='True'))
        save_data = to_bool_or_none(request.args.get('save_data', default='True'))
        compression = request.args.get('compression', default='gzip')
        if compression != "gzip" and compression != "lzf":
            compression = None
        start_idx = request.args.get('start_idx', default=0, type=int)

        app.logger.info(
            f"Export all data(data:{save_data},label:{save_label}), with store type:{store_type}, split entry number:{split_entry_num}, start file idx:{start_idx}, and compression type:{compression}")

        export_service = ExportService(get_conn())
        msg = export_service.save_studies(instance_id, split_entry_num, start_idx, store_type, save_label, save_data,
                                          compression)
        return jsonify({'msg': msg}), 200

    @app.route('/export_label/studies/<study_id>', methods=['GET'])
    def export_label(study_id):
        exportService = ExportService(get_conn())
        result = exportService.save_onestudy(study_id)
        return jsonify({'msg': result}), 201

    @app.route('/dcm/<path:data_path>/<path:folder_name>/<file_name>')
    def get_dcm_img(data_path, folder_name, file_name):
        """
        Get the original dcm image(binary) to client.
        :param data_path:
        :param folder_name:
        :param file_name:
        :return:
        """
        file_path = os.path.join(data_path, folder_name, file_name)
        if not os.path.isfile(file_path):
            return jsonify({}), 404

        with open(file_path, "rb") as dcm_file:
            return send_file(
                io.BytesIO(dcm_file.read()),
                mimetype="application/DICOM"
            )

    @app.route("/assets/<path:filename>")
    def send_asset(filename):
        return send_from_directory(path.join(app_path, "public"), filename)

    @app.errorhandler(500)
    def internal_error(exception):
        app.logger.error(exception)
        return render_template('500.html'), 500
