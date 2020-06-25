import datetime
import io
import os
from os import path

from flask import render_template, Response, send_from_directory, jsonify, send_file, request, session, redirect

from atmi_backend.config import REGISTER_MAX_HOURS
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


def setup_route_map(app, app_path):
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
            except:
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
                  "series_detail": series}

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

    @app.route('/instance/<int:instance_id>', methods=['GET'])
    def instance_detail(instance_id):

        instance_service = InstanceService(get_conn())
        instance_info = instance_service.query({"instance_id": instance_id})
        if len(instance_info) == 0:
            return jsonify({}), 200
        label_candidate_service = LabelCandidatesService(get_conn())
        label_candidates = label_candidate_service.query({"instance_id": instance_id})

        json_result = instance_info[0]
        json_result['label_candidates'] = label_candidates

        return jsonify(json_result), 200

    @app.route('/instances', methods=['GET'])
    def instance_list():
        instance_service = InstanceService(get_conn())
        instances = instance_service.query({})
        return jsonify(instances), 200

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

    @app.route('/series/<int:series_id>/files/<file_name>/labels', methods=['POST'])
    def add_labels(series_id, file_name):
        # Temporary mock the user Id.
        user_id = 1
        data = request.data
        label_service = LabelService(get_conn())
        status = label_service.insert(series_id, user_id, file_name, data)

        if status:
            return jsonify({}), 201
        else:
            return jsonify({status:"Transaction Rollback."}), 404
    @app.route('/series/<int:series_id>/labels', methods=['GET'])
    def get_labels(series_id):
        # Temporary mock the user Id.
        user_id = 1

        label_service = LabelService(get_conn())
        result = label_service.query({"series_id": series_id, "user_id": user_id})
        if len(result) == 0:
            return jsonify([]), 200
        return jsonify(result), 200

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
        import_service = ImportService(get_conn())
        result = import_service.import_dcm(instance_id, data_path)

        return jsonify({'result': result}), 201

    @app.route('/export/instance/<instance_id>', methods=['GET'])
    def export_all_label(instance_id):
        """
        Export all requested data as hdf5 file(s)
        request arguments includes:
        split_entry_num: entry numbers for each hdf5 file. Will create separate files end with ids. Default is 100 entries per file.
        store_type: default root path in the hdf5 is "train"
        save_data/save_label: indicate if save dcm data or labels in the hdf5 file.
        compression: indicate whether the hdf5 compressed using "gzip or lzf".
        start_idx: Specify the start index of h5 file, useful for continuous export files.
        :param instance_id:
        :return:
        """
        split_entry_num = request.args.get('split_entry_num', default=100, type=int)
        store_type = request.args.get('store_type', default='train')
        save_label = to_bool_or_none(request.args.get('save_label', default='True'))
        save_data = to_bool_or_none(request.args.get('save_data', default='True'))
        compression = request.args.get('compression', default='gzip')
        if compression != "gzip":
            compression = None

        start_idx = request.args.get('start_idx', default=0, type=int)

        export_service = ExportService(get_conn())
        msg = export_service.save_studies(instance_id, split_entry_num, start_idx, store_type, save_label, save_data, compression)
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
