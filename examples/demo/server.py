from mappercore import Server
# from flask import Flask
# create server instance
server = Server()
app = server.flask

# register your backend function here
# app = Flask(__name__)
if __name__ == '__main__':
    app.run(debug=True)
