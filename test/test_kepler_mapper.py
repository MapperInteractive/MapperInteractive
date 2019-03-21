import pytest
from mappercore import Server
from mappercore.configs.kepler_mapper import KeplerMapper


@pytest.fixture
def server():
    server = Server("test")
    KeplerMapper.setup(server, data=[
        [1, 'Yes', 1.1],
        [2, 'No', 1.2],
    ])

    return server


def test_kepler_function_registered(server):
    assert 'kepler_mapper' in server.functions
