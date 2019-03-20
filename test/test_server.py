"""


"""
import pytest
from flask import jsonify
import json
from mappercore import Server



@pytest.fixture
def client():

    def dummy(a=5):
        return int(a)

    s = Server("test")
    s.register_function("dummy", dummy)
    return s.flask.test_client()

def test_call_no_params(client):
    """Test registering a function
    """   
    response = client.post('/app/call/dummy')
    # assert response.status_code, 200)
    assert response.status_code == 200
    assert response.json == 5

def test_call_params(client):  
    response = client.post(
        '/app/call/dummy', 
        data=json.dumps(dict(a='10')),
        content_type='application/json'
    )

    assert response.status_code == 200
    assert response.json == 10
    
