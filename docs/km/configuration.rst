.. _KM Configuration:

KM Configuration
------------------


Form loader
=============


Variables types are :code:`range` or :code:`dropdown`. 

:code:`range` takes the form

.. code-block:: javascript

    {
        "type": "range",
        "config": {
            "name": <Variable name>,
            "label": <Display name>,
            "value": <Default value>,
            "max": <Max value>,
            "min": <Min value>,
            "step": <Step>
        }
    }

and :code:`dropdown` takes the form

.. code-block:: javascript

    {
        "type": "dropdown",
        "config": {
            "name": <Variable name>,
            "label": <Display name>,
            "options": <List of options>
        }
    }



Current supported Range variables are :code:`interval`, :code:`overlap`,
:code:`dbscan_eps`, :code:`dbscan_min_samples`. For Dropdown type variables, :code:`filter_function`.


Coloring functions
=====================

Nodes can be colored in many different ways

.. code-block:: javascript

    {
        "name": "SIZE of node",
        "attr": "size"
    }

