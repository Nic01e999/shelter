from flask import Blueprint

users_bp = Blueprint('users', __name__)
projects_bp = Blueprint('projects', __name__)

from . import users, projects
