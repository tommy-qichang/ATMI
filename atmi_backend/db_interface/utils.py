def gen_multiple_condition(query_obj, candidate_keys=None):
    """
    Generate sql segments with multiple conditions.
    :param query_obj:
    :param candidate_keys:
    :return:
    """
    segment = []
    for k, v in query_obj.items():
        if (candidate_keys is None) or (k in candidate_keys):
            segment.append(f'{k}="{v}"')
        elif k not in candidate_keys:
            print(f"***warning***: query key:{k} is invalid")

    return " and ".join(segment)


def prepare_query(table_name, query_obj={}, candidate_keys=None):
    """
    Prepare query SQL for services.
    :param table_name:
    :param query_obj:
    :param candidate_keys:
    :return:
    """
    if query_obj == {}:
        return f'SELECT * FROM {table_name}'
    sql = f'SELECT * FROM {table_name} WHERE ({gen_multiple_condition(query_obj, candidate_keys)})'
    return sql


def prepare_insert(table_name, insert_obj, candidate_keys=None):
    """
    Prepare insert SQL for services.
    :param table_name:
    :param insert_obj:
    :param candidate_keys:
    :return:
    """
    k_list = []
    v_list = []
    q_list = []
    for k, v in insert_obj.items():
        if (candidate_keys is None) or (k in candidate_keys):
            k_list.append(k)
            v_list.append(v)
            q_list.append("?")
        elif k not in candidate_keys:
            print(f"warning: query key:{k} is invalid")

    sql = f'INSERT INTO {table_name}({" , ".join(k_list)}) VALUES ({" , ".join(q_list)})'

    return sql, tuple(v_list)


def prepare_delete(table_name, del_obj, candidate_keys=None):
    """
    Prepare delete SQL for services.
    :param table_name:
    :param del_obj:
    :param candidate_keys:
    :return:
    """
    sql = f'DELETE FROM {table_name} WHERE ({gen_multiple_condition(del_obj, candidate_keys)})'
    return sql


def prepare_update(table_name, condition_obj, insert_obj, candidate_keys=None):
    """
    Prepare update SQL for services.
    :param table_name:
    :param insert_obj:
    :param condition_obj:
    :param candidate_keys:
    :return: sql and value tuple
    """
    k_list = []
    v_list = []
    condition_list = []
    for k, v in insert_obj.items():
        if (candidate_keys is None) or (k in candidate_keys):
            k_list.append(f'{k} = ?')
            v_list.append(v)
        elif k not in candidate_keys:
            print(f"warning: query key:{k} is invalid")

    for k, v in condition_obj.items():
        condition_list.append(f'{k} = ?')
        v_list.append(v)

    sql = f'UPDATE {table_name} SET {",".join(k_list)} WHERE {" and ".join(condition_list)}'

    return sql, tuple(v_list)
