#!/usr/bin/env python3
import sys
import os

# 添加backend目录到路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from data.app import app

if __name__ == '__main__':
    app.run(debug=True, port=9999)
