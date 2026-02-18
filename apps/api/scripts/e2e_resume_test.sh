#!/usr/bin/env bash
# E2E test: register -> upload DOCX resume -> poll until PARSED or FAILED
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8010/v1}"
RESUME_FILE="${RESUME_FILE:-/tmp/resume-test.docx}"
EMAIL="resume.e2e.$(date +%s)@example.com"
PASS="Password123!"

echo "=== E2E Resume Test ==="
echo "BASE_URL=$BASE_URL"
echo "RESUME_FILE=$RESUME_FILE"
echo ""

# 1) Create test DOCX if missing
if [[ ! -f "$RESUME_FILE" ]]; then
  echo "Creating test DOCX at $RESUME_FILE ..."
  python - <<'PY'
from docx import Document
p = "/tmp/resume-test.docx"
d = Document()
d.add_paragraph("Mahdiar Example")
d.add_paragraph("Senior Backend Engineer")
d.add_paragraph("Skills")
d.add_paragraph("Python, FastAPI, PostgreSQL, Docker")
d.add_paragraph("Experience")
d.add_paragraph("Senior Backend Engineer at ExampleCo")
d.add_paragraph("Education")
d.add_paragraph("BSc Computer Science")
d.save(p)
print("Created:", p)
PY
else
  echo "Using existing $RESUME_FILE"
fi

# 2) Register
echo ""
echo "--- Register ---"
REG=$(curl -sS -w '\n%{http_code}' -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\",\"name\":\"Resume E2E\"}")
REG_CODE="${REG##*$'\n'}"; REG_BODY="${REG%$'\n'*}"
echo "HTTP $REG_CODE"; echo "$REG_BODY" | python -m json.tool 2>/dev/null || echo "$REG_BODY"
[[ "$REG_CODE" = "200" ]] || { echo "Register failed"; exit 1; }

TOKEN=$(python -c 'import sys,json; print(json.loads(sys.argv[1])["access_token"])' "$REG_BODY")
echo "Got access token"

# 3) Upload resume (set MIME type so API accepts it)
echo ""
echo "--- Upload resume ---"
case "$(echo "$RESUME_FILE" | tr '[:upper:]' '[:lower:]')" in
  *.docx) MIME_TYPE="application/vnd.openxmlformats-officedocument.wordprocessingml.document" ;;
  *.pdf)  MIME_TYPE="application/pdf" ;;
  *)      MIME_TYPE="application/octet-stream" ;;
esac
UP=$(curl -sS -w '\n%{http_code}' -X POST "$BASE_URL/resumes" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@${RESUME_FILE};type=$MIME_TYPE")
UP_CODE="${UP##*$'\n'}"; UP_BODY="${UP%$'\n'*}"
echo "HTTP $UP_CODE"; echo "$UP_BODY" | python -m json.tool 2>/dev/null || echo "$UP_BODY"
[[ "$UP_CODE" = "202" ]] || { echo "Upload failed"; exit 1; }

RESUME_ID=$(python -c 'import sys,json; print(json.loads(sys.argv[1])["id"])' "$UP_BODY")
echo "RESUME_ID=$RESUME_ID"

# 4) Poll until PARSED or FAILED
echo ""
echo "--- Polling status (up to 60 x 2s) ---"
for i in $(seq 1 60); do
  ST=$(curl -sS -w '\n%{http_code}' -H "Authorization: Bearer $TOKEN" "$BASE_URL/resumes/$RESUME_ID")
  ST_CODE="${ST##*$'\n'}"; ST_BODY="${ST%$'\n'*}"
  STATUS=$(python -c 'import sys,json; print(json.loads(sys.argv[1])["status"])' "$ST_BODY" 2>/dev/null) || STATUS=""
  echo "[$i] HTTP $ST_CODE status=$STATUS"
  [[ "$ST_CODE" != "200" ]] && { echo "$ST_BODY"; exit 1; }
  [[ "$STATUS" = "PARSED" ]] || [[ "$STATUS" = "FAILED" ]] && break
  sleep 2
done

echo ""
echo "=== Final status ==="
echo "$ST_BODY" | python -m json.tool 2>/dev/null || echo "$ST_BODY"
if [[ "$STATUS" = "PARSED" ]]; then
  echo "SUCCESS: Resume parsed."
  exit 0
elif [[ "$STATUS" = "FAILED" ]]; then
  echo "Resume processing FAILED (check error_code/error_message above)."
  exit 1
else
  echo "TIMEOUT: Did not reach PARSED or FAILED."
  exit 1
fi
