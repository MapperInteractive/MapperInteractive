from setuptools import setup, find_packages

setup(
    name='mappercore',
    version='1.2.1',
    keywords='mapper',
    description='A framework for data analysis and visualization',
    license='MIT',
    url='https://github.com/yaodong/sci-mapper-core',
    author='Yaodong Zhao',
    author_email='yaodong.zhao@utah.edu',
    packages=find_packages(),
    include_package_data=True,
    platforms='any',
    install_requires=[
        'gunicorn==19.9.0',
        'Flask==1.0.2',
        'Flask-HTTPAuth==3.2.4'
    ],
)
