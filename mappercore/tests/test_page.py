from mappercore.app import App
import unittest


class TestPage(unittest.TestCase):
    def setUp(self):
        self.page = App()

    def test_page(self):
        self.assertIsInstance(self.page, App)


if __name__ == '__main__':
    unittest.main()
