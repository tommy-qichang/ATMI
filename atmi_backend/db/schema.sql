PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users
(
    user_id   INTEGER PRIMARY KEY,
    name      TEXT    NOT NULL,
    email     TEXT    NOT NULL UNIQUE,
    pwd       TEXT    NOT NULL,--encoded pwd
    init_code TEXT,            --if exist, need to reset pwd
    user_type INTEGER NOT NULL --0:admin, 1:annotator
);

CREATE TABLE IF NOT EXISTS instances
(
    instance_id  INTEGER PRIMARY KEY,
    name         TEXT    NOT NULL UNIQUE,
    modality     TEXT,
    description  TEXT,
    data_path    TEXT    NOT NULL UNIQUE,
    has_audit    INTEGER NOT NULL, --0: not have auditor, 1: have auditor
    study_number INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS instances_users
(
    user_id    INTEGER NOT NULL,
    instance_id INTEGER NOT NULL,
    is_auditor  INTEGER NOT NULL, --0:isn't an auditor, 1: is an auditor
    PRIMARY KEY (user_id, instance_id),
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE SET NULL ON UPDATE NO ACTION,
    FOREIGN KEY (instance_id) REFERENCES instances (instance_id) ON DELETE SET NULL ON UPDATE NO ACTION
);



CREATE TABLE IF NOT EXISTS label_candidates
(
    candidate_id INTEGER PRIMARY KEY,
    instance_id  INTEGER,
    label_type   INTEGER NOT NULL, --0: contour label, 1: study label
    input_type   INTEGER,          --label_type:0 means annotation label, so no input textbox needed. 1: select box. 2: text input.
    text         TEXT,
    FOREIGN KEY (instance_id) REFERENCES instances (instance_id) ON DELETE SET NULL ON UPDATE NO ACTION
);


CREATE TABLE IF NOT EXISTS studies
(
    study_id           INTEGER PRIMARY KEY,
    instance_id        INTEGER,
    folder_name        TEXT    NOT NULL UNIQUE,
    total_files_number INTEGER NOT NULL,
    annotators         TEXT, --cache all annotators' ids
    auditors           TEXT, --cache all auditors' ids
    FOREIGN KEY (instance_id) REFERENCES instances (instance_id) ON DELETE SET NULL ON UPDATE NO ACTION
);

-- CREATE TABLE IF NOT EXISTS studies_users
-- (
--     user_id    INTEGER NOT NULL,
--     study_id   INTEGER NOT NULL,
--     is_auditor INTEGER NOT NULL,--0:isn't an auditor, 1: is an auditor
--     user_type  INTEGER NOT NULL,--0:admin, 1:annotator
--     PRIMARY KEY (user_id, study_id),
--     FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE SET NULL ON UPDATE NO ACTION,
--     FOREIGN KEY (study_id) REFERENCES studies (study_id) ON DELETE SET NULL ON UPDATE NO ACTION
-- );

CREATE TABLE IF NOT EXISTS series
(
    series_id           INTEGER PRIMARY KEY,
    study_id            INTEGER NOT NULL,
    series_description  TEXT,
    series_files_list   TEXT,
    series_files_number INTEGER,
    window_width        TEXT,
    window_level        TEXT,
    x_spacing           TEXT,
    y_spacing           TEXT,
    z_spacing           TEXT,
    patient_id          TEXT,
    study_date          TEXT,
    intercept           TEXT,
    slop                TEXT, --real_v = slop*V + intercept
    FOREIGN KEY (study_id) REFERENCES studies (study_id) ON DELETE SET NULL ON UPDATE NO ACTION
);


CREATE TABLE IF NOT EXISTS labels
(
    label_id     INTEGER PRIMARY KEY,
    candidate_id INTEGER NOT NULL,
    series_id    INTEGER NOT NULL,
    user_id      INTEGER NOT NULL,
    file_id      TEXT,
    content      TEXT,
    FOREIGN KEY (candidate_id) REFERENCES label_candidates (candidate_id) ON DELETE CASCADE ON UPDATE NO ACTION,
    FOREIGN KEY (series_id) REFERENCES series (series_id) ON DELETE CASCADE ON UPDATE NO ACTION,
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE ON UPDATE NO ACTION
);




