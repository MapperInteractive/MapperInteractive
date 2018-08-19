from sklearn import linear_model


def linear_regression(payload):
    print(payload)
    algorithm = payload['algorithm']
    data = payload['data']

    features = data['features']
    targets = data['targets']

    results = {}

    for target_name, target_data in targets.items():
        if algorithm == 'linear_regression':
            reg = linear_model.LinearRegression()
        elif algorithm == 'lasso_regression':
            reg = linear_model.Lasso()

        reg.fit(features, target_data)
        results[target_name] = reg.coef_.tolist()

    return results
