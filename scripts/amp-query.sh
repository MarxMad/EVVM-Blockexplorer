#!/bin/bash

# Script helper para hacer queries a Amp
# Uso: ./scripts/amp-query.sh "SELECT * FROM table LIMIT 10"

AMP_ENDPOINT="${AMP_ENDPOINT:-http://localhost:1603}"
SQL_QUERY="$1"

if [ -z "$SQL_QUERY" ]; then
  echo "Uso: ./scripts/amp-query.sh 'SELECT * FROM table LIMIT 10'"
  echo ""
  echo "Ejemplos:"
  echo "  ./scripts/amp-query.sh 'SHOW TABLES'"
  echo "  ./scripts/amp-query.sh 'SHOW DATASETS'"
  echo "  ./scripts/amp-query.sh 'SELECT * FROM \"_/evvm_explorer@dev\".evvm_transactions LIMIT 5'"
  exit 1
fi

echo "Query: $SQL_QUERY"
echo "Endpoint: $AMP_ENDPOINT"
echo ""

curl -X POST "$AMP_ENDPOINT" \
  -H "Content-Type: text/plain" \
  -d "$SQL_QUERY" \
  2>/dev/null | jq '.' 2>/dev/null || \
curl -X POST "$AMP_ENDPOINT" \
  -H "Content-Type: text/plain" \
  -d "$SQL_QUERY"

echo ""

