#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:5000}"
CSV_FILE="${CSV_FILE:-/home/devendra/Downloads/course_template.csv}"
EMAIL="${EMAIL:-intern.$(date +%s)@example.com}"
PASSWORD="${PASSWORD:-secret123}"

echo "[1/7] Health check"
curl -fsS "$BASE_URL/health" >/dev/null

echo "[2/7] Signup"
SIGNUP_STATUS=$(curl -s -o /tmp/signup.json -w "%{http_code}" -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
if [[ "$SIGNUP_STATUS" != "201" && "$SIGNUP_STATUS" != "409" ]]; then
  echo "Signup failed with status $SIGNUP_STATUS"
  cat /tmp/signup.json
  exit 1
fi

echo "[3/7] Login"
LOGIN_STATUS=$(curl -s -o /tmp/login.json -w "%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
if [[ "$LOGIN_STATUS" != "200" ]]; then
  echo "Login failed with status $LOGIN_STATUS"
  cat /tmp/login.json
  exit 1
fi

TOKEN=$(node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync('/tmp/login.json','utf8'));process.stdout.write(j.token||'')")
if [[ -z "$TOKEN" ]]; then
  echo "Token not found in login response"
  cat /tmp/login.json
  exit 1
fi

echo "[4/7] Protected admin route"
ADMIN_STATUS=$(curl -s -o /tmp/admin.json -w "%{http_code}" "$BASE_URL/api/admin" \
  -H "Authorization: Bearer $TOKEN")
if [[ "$ADMIN_STATUS" != "200" ]]; then
  echo "Admin route failed with status $ADMIN_STATUS"
  cat /tmp/admin.json
  exit 1
fi

if [[ ! -f "$CSV_FILE" ]]; then
  echo "CSV file not found: $CSV_FILE"
  exit 1
fi

echo "[5/7] Upload CSV"
UPLOAD_STATUS=$(curl -s -o /tmp/upload.json -w "%{http_code}" -X POST "$BASE_URL/api/courses/upload" \
  -F "file=@$CSV_FILE")
if [[ "$UPLOAD_STATUS" != "200" ]]; then
  echo "Upload failed with status $UPLOAD_STATUS"
  cat /tmp/upload.json
  exit 1
fi

echo "[6/7] Get courses (mongodb/cache)"
COURSE1_STATUS=$(curl -s -o /tmp/courses1.json -w "%{http_code}" "$BASE_URL/api/courses")
COURSE2_STATUS=$(curl -s -o /tmp/courses2.json -w "%{http_code}" "$BASE_URL/api/courses")
if [[ "$COURSE1_STATUS" != "200" || "$COURSE2_STATUS" != "200" ]]; then
  echo "Courses fetch failed: $COURSE1_STATUS / $COURSE2_STATUS"
  cat /tmp/courses1.json
  cat /tmp/courses2.json
  exit 1
fi

echo "[7/7] Recommend"
REC_STATUS=$(curl -s -o /tmp/recommend.json -w "%{http_code}" -X POST "$BASE_URL/api/recommend" \
  -H "Content-Type: application/json" \
  -d '{"topic":"AI","level":"Beginner"}')
if [[ "$REC_STATUS" != "200" ]]; then
  echo "Recommend failed with status $REC_STATUS"
  cat /tmp/recommend.json
  exit 1
fi

echo "All assessment APIs passed"
SOURCE1=$(node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync('/tmp/courses1.json','utf8'));process.stdout.write(j.source||'unknown')")
SOURCE2=$(node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync('/tmp/courses2.json','utf8'));process.stdout.write(j.source||'unknown')")
echo "Courses source checks: first=$SOURCE1 second=$SOURCE2"
