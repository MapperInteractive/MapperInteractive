from mappercore import events
import unittest


class TestEventsMixin(unittest.TestCase):
    def setUp(self):
        class Base(events.EventsMixin):
            pass

        self.object = Base()

    def test_mixin(self):
        self.assertIsInstance(self.object, events.EventsMixin)


if __name__ == '__main__':
    unittest.main()
