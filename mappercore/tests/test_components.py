from mappercore import components as html
import unittest


class TestPage(unittest.TestCase):
    def setUp(self):
        self.page = html.Page()

    def test_page(self):
        self.assertIsInstance(self.page, html.Page)

    def test_div(self):
        div = html.Div().render()
        self.assertEqual(div, '<div></div>')

    def test_div_content(self):
        div = html.Div(content='test').render()
        self.assertEqual(div, '<div>test</div>')

    def test_div_properties(self):
        div = html.Div(id='test', content='test').render()
        self.assertEqual(div, '<div id="test">test</div>')

    def test_div_nested(self):
        div = html.Div(children=[html.Div()]).render()
        self.assertEqual(div, '<div><div></div></div>')


if __name__ == '__main__':
    unittest.main()
