from flask import Flask
from flask_cors import CORS
from routes import users_bp, projects_bp, modefire_bp, ai_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(users_bp)
app.register_blueprint(projects_bp)
app.register_blueprint(modefire_bp)
app.register_blueprint(ai_bp)

if __name__ == '__main__':
    app.run(debug=True, port=9999)
