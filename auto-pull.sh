#!/bin/bash
cd /www/wwwroot/shelter
git fetch origin main
git merge origin/main --ff-only
