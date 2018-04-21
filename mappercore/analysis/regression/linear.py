from mappercore.analysis import AnalysisTask
from sklearn import linear_model


class LinearRegression(AnalysisTask):

    def __init__(self, features, targets):
        self.features = features
        self.targets = targets

    def __call__(self, *args, **kwargs):
        reg = linear_model.LinearRegression()
        reg.fit(self.features, self.targets)
        return {
            'coef': reg.coef_.tolist()
        }
