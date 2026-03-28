from flask import jsonify, request
from . import modefire_bp
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db
from datetime import datetime, timedelta, timezone

@modefire_bp.route('/api/modefire/save', methods=['POST'])
def save_focus():
    data = request.json
    with get_db() as conn:
        cursor = conn.execute(
            'INSERT INTO focus_sessions (start_time, end_time, duration) VALUES (?, ?, ?)',
            (data['start_time'], data['end_time'], data['duration'])
        )
        conn.commit()
        session_id = cursor.lastrowid
    return jsonify({'success': True, 'id': session_id}), 201

@modefire_bp.route('/api/modefire/history', methods=['GET'])
def get_history():
    days = request.args.get('days', 7, type=int)
    start_date = datetime.now(timezone.utc) - timedelta(days=days)

    with get_db() as conn:
        sessions = conn.execute(
            'SELECT DATE(start_time) as date, SUM(duration) as duration FROM focus_sessions WHERE start_time >= ? GROUP BY DATE(start_time) ORDER BY date',
            (start_date.isoformat(),)
        ).fetchall()

    # 时间轴补全
    data_map = {row['date']: row['duration'] for row in sessions}
    result = []
    for i in range(days):
        date = (datetime.now(timezone.utc).date() - timedelta(days=days-1-i)).isoformat()
        result.append({'date': date, 'duration': data_map.get(date, 0)})

    return jsonify(result)

@modefire_bp.route('/api/modefire/history/hourly', methods=['GET'])
def get_hourly_history():
    hours = request.args.get('hours', 24, type=int)
    start_time = datetime.now(timezone.utc) - timedelta(hours=hours)

    with get_db() as conn:
        sessions = conn.execute(
            "SELECT strftime('%Y-%m-%dT%H:00', start_time) as hour, SUM(duration) as duration FROM focus_sessions WHERE start_time >= ? GROUP BY strftime('%Y-%m-%dT%H:00', start_time) ORDER BY hour",
            (start_time.isoformat(),)
        ).fetchall()

    # 时间轴补全
    data_map = {row['hour']: row['duration'] for row in sessions}
    result = []
    for i in range(hours):
        hour_time = datetime.now(timezone.utc) - timedelta(hours=hours-1-i)
        hour_str = hour_time.strftime('%Y-%m-%dT%H:00')
        result.append({'hour': hour_str, 'duration': data_map.get(hour_str, 0)})

    return jsonify(result)

@modefire_bp.route('/api/modefire/history/weekly', methods=['GET'])
def get_weekly_history():
    weeks = request.args.get('weeks', 12, type=int)
    start_date = datetime.now(timezone.utc) - timedelta(weeks=weeks)

    with get_db() as conn:
        sessions = conn.execute(
            "SELECT strftime('%Y-W%W', start_time) as week, SUM(duration) as duration FROM focus_sessions WHERE start_time >= ? GROUP BY strftime('%Y-W%W', start_time) ORDER BY week",
            (start_date.isoformat(),)
        ).fetchall()

    # 时间轴补全
    data_map = {row['week']: row['duration'] for row in sessions}
    result = []
    for i in range(weeks):
        week_date = datetime.now(timezone.utc) - timedelta(weeks=weeks-1-i)
        week_str = week_date.strftime('%Y-W%W')
        result.append({'week': week_str, 'duration': data_map.get(week_str, 0)})

    return jsonify(result)
