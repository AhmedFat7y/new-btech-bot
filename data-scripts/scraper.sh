#!/usr/bin/env bash

node="$HOME/.nvm/versions/node/v6.10.3/bin/node"
project_path="$HOME/bot/source"

if [ -e "$project_path/data-scripts/.lock" ]; then
  echo "No need to scrape"
  exit 0
fi

echo "- No Lock! Start scraping data"
$node "$project_path/data-scripts/data-scraper.js"
if [ $? -ne 0 ]; then
  echo "- Scraping failed! stop processing"
  exit $?
fi

echo "- Scrapping succeeded" 
echo "- Processing data"
$node "$project_path/data-scripts/post-scraping-processing.js"

if [ $? -ne 0 ]; then
  echo "- Processing error"
  exit $?
else
  echo "- Done scraping and processing, creating .lock"
  touch "$project_path/data-scripts/.lock"
fi