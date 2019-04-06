from setuptools import setup, find_packages

setup(
    name='mappercore',
    version='1.4.1',
    keywords='mapper',
    description='A framework for data analysis and visualization',
    license='MIT',
    url='https://github.com/mappercore/mappercore',
    author='Yaodong Zhao',
    author_email='yaodong.zhao@utah.edu',
    packages=find_packages(),
    include_package_data=True,
    platforms='any',
    install_requires=[
        'gunicorn',
        'Flask',
        'Flask-HTTPAuth==3.2.4',
        'kmapper==1.2.0',
        'scikit-learn',
        'numpy',
        'scipy'
    ],
    extras_require={
        'testing': [  # `pip install -e ".[testing]"``
            'pytest',
        ]
    }
)
