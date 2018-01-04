from mappercore.events import EventsMixin


class Element(EventsMixin):
    def __init__(self, tag_name=None, children=None, content=None, tag_closed=True, data=None, **tag_properties):
        super().__init__()
        self.elements = []

        if not tag_name:
            raise RuntimeError('Invalid tag name')
        self.tag_name = tag_name

        if not tag_properties:
            tag_properties = dict()
        self.tag_properties = tag_properties

        if not children:
            children = list()
        self.children = children

        if not content:
            content = ''
        self.content = content

        self.tag_closed = tag_closed
        self.data = data

    def render(self):
        if self.tag_closed:
            html = '<{0}{1}>{2}</{0}>'.format(self.tag_name, self.render_properties(), self.render_content())
        else:
            html = '<{0}{1}/>'.format(self.tag_name, self.render_properties())

        return html

    def render_content(self):
        return self.content

    def render_properties(self):
        if len(self.tag_properties) > 0:
            html = ''
            for key, value in self.tag_properties.items():
                html += ' {0}="{1}"'.format(key, value)

            return html

        return ''


class Page(Element):
    def __init__(self, children=None, content=None, tag_closed=True, **tag_properties):
        super().__init__('html', children, content, tag_closed, **tag_properties)


class Div(Element):
    def __init__(self, children=None, content=None, tag_closed=True, data=None, **tag_properties):
        super().__init__('div', children, content, tag_closed, data, **tag_properties)


class Label(Element):
    def __init__(self, children=None, content=None, data=None, **tag_properties):
        super().__init__('label', children, content, data, **tag_properties)


class Input(Element):
    def __init__(self, children=None, content=None, data=None, **tag_properties):
        super().__init__('input', children, content, False, data, **tag_properties)
