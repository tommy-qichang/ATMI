import pytest

from atmi import create_app


@pytest.fixture
def app():
    app = create_app()
    return app
