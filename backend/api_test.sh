#!/usr/bin/env bash
# api_test.sh - Quick smoke tests for the AI-IIL backend
# Usage: ./api_test.sh [BASE_URL]
# Default BASE_URL: http://localhost:8000

BASE_URL="${1:-http://localhost:8000}"
PASS=0
FAIL=0

assert_status() {
  local label="$1"
  local url="$2"
  local expected="$3"
  local actual
  actual=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  if [ "$actual" = "$expected" ]; then
    echo "  ✅  $label (HTTP $actual)"
    PASS=$((PASS + 1))
  else
    echo "  ❌  $label (expected HTTP $expected, got $actual)"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "=============================================="
echo " AI Infrastructure Intelligence Layer - API Tests"
echo " Target: $BASE_URL"
echo "=============================================="
echo ""

echo "--- Health ---"
assert_status "GET /health" "$BASE_URL/health" "200"

echo ""
echo "--- Assets ---"
assert_status "GET /assets" "$BASE_URL/assets" "200"
assert_status "GET /assets?limit=5" "$BASE_URL/assets?limit=5" "200"
assert_status "GET /assets?type=borehole" "$BASE_URL/assets?type=borehole" "200"
assert_status "GET /assets?status=operational" "$BASE_URL/assets?status=operational" "200"

# Get first asset ID for subsequent tests
FIRST_ID=$(curl -s "$BASE_URL/assets?limit=1" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['id'])" 2>/dev/null)
if [ -n "$FIRST_ID" ]; then
  assert_status "GET /assets/$FIRST_ID" "$BASE_URL/assets/$FIRST_ID" "200"
fi
assert_status "GET /assets/INVALID-ID (expect 404)" "$BASE_URL/assets/INVALID-ID-9999" "404"

echo ""
echo "--- Risk ---"
if [ -n "$FIRST_ID" ]; then
  assert_status "GET /risk/$FIRST_ID" "$BASE_URL/risk/$FIRST_ID" "200"
fi
assert_status "GET /risk/INVALID-ID (expect 404)" "$BASE_URL/risk/INVALID-ID-9999" "404"

echo ""
echo "--- Map ---"
assert_status "GET /map" "$BASE_URL/map" "200"

echo ""
echo "--- Ingest ---"
INGEST_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/ingest/report" \
  -F "file=@$(dirname "$0")/../data/reports/report_001.txt")
if [ "$INGEST_STATUS" = "200" ]; then
  echo "  ✅  POST /ingest/report (HTTP $INGEST_STATUS)"
  PASS=$((PASS + 1))
else
  echo "  ❌  POST /ingest/report (expected HTTP 200, got $INGEST_STATUS)"
  FAIL=$((FAIL + 1))
fi

echo ""
echo "=============================================="
echo " Results: $PASS passed, $FAIL failed"
echo "=============================================="
echo ""
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
