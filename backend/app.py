from flask import Flask
from flask_cors import CORS
from routes import users_bp, projects_bp, modefire_bp, ai_bp, auth_bp
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

app.register_blueprint(users_bp)
app.register_blueprint(projects_bp)
app.register_blueprint(modefire_bp)
app.register_blueprint(ai_bp)
app.register_blueprint(auth_bp)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=9999)
