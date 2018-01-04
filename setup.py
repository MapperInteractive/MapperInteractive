from setuptools import setup, find_packages

setup(
    name='mappercore',
    version='0.0.1.dev0',
    keywords='mapper',
    description='A framework for data analysis and visualization',
    license='UNLICENSED',
    url='https://github.com/yaodong/mapper-core',
    author='Yaodong Zhao',
    author_email='yaodong.zhao@utah.edu',
    packages=find_packages(),
    include_package_data=True,
    platforms='any',
    install_requires=[
        'Flask==0.12.2'
    ],
)
