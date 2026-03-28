import sqlite3
import os
from pathlib import Path

def run_migrations():
    db_path = Path(__file__).parent / 'user.db'
    migrations_dir = Path(__file__).parent / 'migrations'

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    migration_files = sorted(migrations_dir.glob('00*.sql'))

    for migration_file in migration_files:
        print(f'执行迁移: {migration_file.name}')
        with open(migration_file, 'r', encoding='utf-8') as f:
            sql = f.read()
            cursor.executescript(sql)

    conn.commit()
    conn.close()
    print('迁移完成')

if __name__ == '__main__':
    run_migrations()
