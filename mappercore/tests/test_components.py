from mappercore import views as html
import unittest


class TestComponents(unittest.TestCase):
    def test_div(self):
        div = html.Div().render()
        self.assertEqual(div, '<div></div>')

    def test_div_properties(self):
        div = html.Div(id='test').render()
        self.assertEqual(div, '<div id="test"></div>')

    def test_div_nested(self):
        div = html.Div(contents=[html.Div()]).render()
        self.assertEqual(div, '<div><div></div></div>')

        div = html.Div(contents=[html.Div(), html.Div()]).render()
        self.assertEqual(div, '<div><div></div><div></div></div>')


if __name__ == '__main__':
    unittest.main()
