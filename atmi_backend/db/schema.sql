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
    instance_id   INTEGER PRIMARY KEY,
    name          TEXT    NOT NULL UNIQUE,
    modality      TEXT,
    description   TEXT,
    data_path     TEXT    NOT NULL,
    has_audit     INTEGER NOT NULL, --0: not have auditor, 1: have auditor
    study_num     INTEGER NOT NULL,
    annotated_num INTEGER NOT NULL,
    status        INTEGER    --0:initialized;1:importing data;2:annotating;3:finished;
);



CREATE TABLE IF NOT EXISTS instances_users
(
    user_id     INTEGER,
    instance_id INTEGER,
    is_auditor  INTEGER NOT NULL, --0:isn't an auditor, 1: is an auditor
    PRIMARY KEY (user_id, instance_id),
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE SET NULL ON UPDATE NO ACTION,
    FOREIGN KEY (instance_id) REFERENCES instances (instance_id) ON DELETE SET NULL ON UPDATE NO ACTION
);



CREATE TABLE IF NOT EXISTS label_candidates
(
    candidate_id        INTEGER PRIMARY KEY,
    instance_id         INTEGER,
    label_type          INTEGER NOT NULL, --0: contour label, 1: study label
    contour_label_value INTEGER,          --the real contour value for each label.
    input_type          INTEGER,          --label_type:0 means annotation label, so no input textbox needed. 1: select box. 2: text input.
    text                TEXT,
    FOREIGN KEY (instance_id) REFERENCES instances (instance_id) ON DELETE SET NULL ON UPDATE NO ACTION
);


CREATE TABLE IF NOT EXISTS studies
(
    study_id           INTEGER PRIMARY KEY,
    instance_id        INTEGER,
    suid               TEXT,
    patient_uid        TEXT,
    study_uid          TEXT,
    folder_name        TEXT,
    total_files_number INTEGER NOT NULL,
    annotators         TEXT,             --cache all annotators' ids
    auditors           TEXT,             --cache all auditors' ids
    status             INTEGER NOT NULL, -- 0: init, 1: Ready to annotate.2: Auditing (read only for others)3: Finished
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
    study_id            INTEGER,
    series_description  TEXT,
    series_path         TEXT,
    series_files_list   TEXT,
    series_files_number INTEGER,
    window_width        TEXT,
    window_level        TEXT,
    x_spacing           TEXT,
    y_spacing           TEXT,
    z_spacing           TEXT,
    x_dimension         INTEGER,
    y_dimension         INTEGER,
    z_dimension         INTEGER,
    patient_id          TEXT,
    series_instance_uid TEXT,
    study_date          TEXT,
    intercept           TEXT,
    slop                TEXT, --real_v = slop*V + intercept
    FOREIGN KEY (study_id) REFERENCES studies (study_id) ON DELETE SET NULL ON UPDATE NO ACTION
);


CREATE TABLE IF NOT EXISTS labels
(
    label_id  INTEGER PRIMARY KEY,
    series_id INTEGER,
    user_id   INTEGER,
    file_id   TEXT,
    content   TEXT,
    FOREIGN KEY (series_id) REFERENCES series (series_id) ON DELETE SET NULL ON UPDATE NO ACTION,
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE SET NULL ON UPDATE NO ACTION
);


PRAGMA main.page_size = 4096;
PRAGMA main.cache_size=10000;
-- PRAGMA main.locking_mode=EXCLUSIVE;
-- PRAGMA main.synchronous=NORMAL;
PRAGMA main.journal_mode=WAL;
PRAGMA main.temp_store = MEMORY;
