from setuptools import setup, find_packages

setup(
    name='mappercore',
    version='1.1.1',
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
        'Flask==1.0.2',
        'scikit-learn==0.19.2',
        'numpy==1.15.1',
        'scipy==1.1.0'
    ],
)
