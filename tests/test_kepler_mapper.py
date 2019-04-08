import pytest
from mappercore import Server
from mappercore.conf.kepler_mapper import KeplerMapperConfig


@pytest.fixture
def server():
    conf = KeplerMapperConfig(data=[
        [1, 'Yes', 1.1],
        [2, 'No', 1.2],
    ])
    server = Server("test", conf=conf)
    return server


def test_kepler_function_registered(server):
    assert 'run_mapper' in server._functions
