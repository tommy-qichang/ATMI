def to_bool_or_none(bool_str):
    if bool_str is None:
            return None
    if bool_str.lower() == "true":
        return True
    if bool_str.lower() == "false":
        return False
    raise Exception("bool str invalid.")