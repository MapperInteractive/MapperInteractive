from mappercore.project import Project
import unittest


class TestPage(unittest.TestCase):
    def setUp(self):
        self.page = Project()

    def test_page(self):
        self.assertIsInstance(self.page, Project)


if __name__ == '__main__':
    unittest.main()
