from sklearn import linear_model


def run(request):
    algorithm = request['algorithm']
    params = request['params']
    features = params['features']
    results = {}

    for target_name, target_data in params['targets'].items():
        if algorithm == 'linear_regression':
            reg = linear_model.LinearRegression()
        elif algorithm == 'lasso_regression':
            reg = linear_model.Lasso()

        reg.fit(features, target_data)
        results[target_name] = reg.coef_.tolist()

    return results
