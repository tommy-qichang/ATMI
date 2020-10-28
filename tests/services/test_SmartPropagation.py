from atmi_backend.db_interface.InitialService import InitialService
from atmi_backend.services.SmartPropagation import SmartPropagation


class TestSmartPropagation:
    def setup_class(self):
        ini_service = InitialService()
        self.conn = ini_service.get_connection()


    def test_propagate(self):
        smart_propagation = SmartPropagation(self.conn)
        smart_propagation.propagate(60, 0, 7)
