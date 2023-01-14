#!/bin/sh

OUTPUT_DIR="output"
PLUGIN_NAME="update-relative-links"

cd "$(dirname "$0")"

npm run build

if [ -d "$OUTPUT_DIR" ]
then
    rm -r "$OUTPUT_DIR"
fi

mkdir "$OUTPUT_DIR"
mkdir "$OUTPUT_DIR/$PLUGIN_NAME"

cp main.js manifest.json "$OUTPUT_DIR/$PLUGIN_NAME"

cd "$OUTPUT_DIR"

cp "$PLUGIN_NAME/"* .

zip -r "${PLUGIN_NAME}.zip" "$PLUGIN_NAME"
rm -r "$PLUGIN_NAME"
