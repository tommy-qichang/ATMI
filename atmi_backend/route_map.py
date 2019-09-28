import io
import os
from os import path

from flask import render_template, Response, send_from_directory, jsonify, send_file, request

from atmi_backend.constant import DATA_ROOT
from atmi_backend.db_interface.InitialService import InitialService
from atmi_backend.db_interface.InstanceService import InstanceService
from atmi_backend.db_interface.LabelCandidatesService import LabelCandidatesService
from atmi_backend.db_interface.LabelService import LabelService
from atmi_backend.db_interface.SeriesService import SeriesService
from atmi_backend.db_interface.StudiesService import StudiesService
from atmi_backend.db_interface.UserService import UserService
from atmi_backend.services.SeriesExtractionService import SeriesExtractionService


def setup_route_map(app, app_path):
    def get_conn():
        ini_service = InitialService()
        return ini_service.get_connection()

    """
    Page Response 
    
    """

    @app.route("/", methods=['GET'])
    def index():
        return render_template("workbench.html")

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

    @app.route('/load_data/<instance_id>/<data_path>', methods=['GET'])
    def load_data(instance_id, data_path):
        series_extraction_service = SeriesExtractionService()
        all_series_list = series_extraction_service.extract_series_from_path(os.path.join(DATA_ROOT, data_path))
        study_service = StudiesService(get_conn())
        series_service = SeriesService(get_conn())

        for study_key in all_series_list:
            series = all_series_list[study_key]
            study_service.insert(instance_id, study_key, 0)
            study = study_service.query({"instance_id": instance_id, "folder_name": study_key})
            study = study[0]
            total_files_number = 0
            for one_series in series:
                total_files_number += one_series.length
                series_info = one_series.info
                series_service.insert(study['study_id'], one_series.description, one_series.filenames,
                                      one_series.length, series_info.get("WindowWidth"),
                                      series_info.get("WindowCenter"),
                                      one_series.sampling[1], one_series.sampling[1], one_series.sampling[0], series_info.get("PatientID"),
                                      series_info.get("StudyDate"), "", "")

            study_service.update({"instance_id": instance_id, "folder_name": study_key},
                                 {"total_files_number": total_files_number})

        return jsonify({}), 201

    @app.route('/users/', methods=['POST'])
    def registry_user():
        # user = request.json['userName']
        # email = request.json['userEmail']
        # pwd = request.json['userPwd']
        return Response("{status: 'success'}", status=201, mimetype='application/json')

    @app.route('/instances/<int:instance_id>', methods=['GET'])
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

    @app.route('/studies/instance_id=<int:instance_id>', methods=['GET'])
    def list_all_studies(instance_id):
        """
        List all studies under one instance.
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
        label_service.insert(series_id, user_id, file_name, data)

        return jsonify({}), 201

    @app.route('/series/<int:series_id>/labels', methods=['GET'])
    def get_labels(series_id):
        # Temporary mock the user Id.
        user_id = 1

        label_service = LabelService(get_conn())
        result = label_service.query({"series_id": series_id, "user_id": user_id})
        if len(result) == 0:
            return jsonify([]), 200
        return jsonify(result), 200

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
