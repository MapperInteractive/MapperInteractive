from setuptools import setup, find_packages

setup(
    name='mapper_interactive',
    version='0.0.1',
    keywords='mapper',
    description='Mapper Interactive is a highly customizable visualization framework for you to visualize and explore Mapper algorithm.',
    license='MIT',
    url='https://github.com/MapperInteractive/MapperInteractive',
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
