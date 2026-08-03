#!/bin/sh
set -eu

source_dir='/private/tmp/searulea-potx-preserve-019fbcf8-v2'
output_dir='/Users/zaidlakhel/Documents/Claude/Projects/SEARULEA/PowerPoint_Template'
output_file="$output_dir/SEARULEA_Client_Presentation_Template.potx"
qa_file='/Users/zaidlakhel/Documents/Claude/Projects/SEARULEA/.ppt_template_build/qa/libreoffice-export.potx'
content_types="$source_dir/[Content_Types].xml"

perl -pi -e 's#application/vnd\.openxmlformats-officedocument\.presentationml\.presentation\.main\+xml#application/vnd.openxmlformats-officedocument.presentationml.template.main+xml#g' "$content_types"

if [ -f "$output_file" ]; then
  mv "$output_file" "$qa_file"
fi

cd "$source_dir"
zip -X -q -r "$output_file" .
