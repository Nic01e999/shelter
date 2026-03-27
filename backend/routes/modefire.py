from flask import jsonify, request
from . import modefire_bp
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db
from datetime import datetime, timedelta

@modefire_bp.route('/api/modefire/save', methods=['POST'])
def save_focus():
    data = request.json
    conn = get_db()
    cursor = conn.execute(
        'INSERT INTO focus_sessions (start_time, end_time, duration) VALUES (?, ?, ?)',
        (data['start_time'], data['end_time'], data['duration'])
    )
    conn.commit()
    session_id = cursor.lastrowid
    conn.close()
    return jsonify({'success': True, 'id': session_id}), 201

@modefire_bp.route('/api/modefire/history', methods=['GET'])
def get_history():
    days = request.args.get('days', 7, type=int)
    start_date = datetime.now() - timedelta(days=days)

    conn = get_db()
    sessions = conn.execute(
        'SELECT DATE(start_time) as date, SUM(duration) as duration FROM focus_sessions WHERE start_time >= ? GROUP BY DATE(start_time) ORDER BY date',
        (start_date.isoformat(),)
    ).fetchall()
    conn.close()

    result = [{'date': row['date'], 'duration': row['duration']} for row in sessions]
    return jsonify(result)
