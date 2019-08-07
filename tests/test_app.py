from atmi.app import math_fabs, math_ceil


def test_math_fabs():
    assert math_fabs(-1.2) == 1.2
    assert math_fabs(0) == 0
    assert math_fabs(2.4) == 2.4


def test_math_ceil():
    assert math_ceil(-1.2) == -1
    assert math_ceil(0) == 0
    assert math_ceil(2.4) == 3
