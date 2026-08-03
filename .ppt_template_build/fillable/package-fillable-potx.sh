#!/bin/sh
set -eu

source_pptx='/Users/zaidlakhel/Documents/Claude/Projects/SEARULEA/PowerPoint_Template/SEARULEA_Ready_to_Fill_Template.pptx'
source_dir='/private/tmp/searulea-fillable-potx-019fbcf8-v1'
output_file='/Users/zaidlakhel/Documents/Claude/Projects/SEARULEA/PowerPoint_Template/SEARULEA_Ready_to_Fill_Template.potx'
qa_file='/Users/zaidlakhel/Documents/Claude/Projects/SEARULEA/.ppt_template_build/fillable/qa-previous-fillable.potx'

mkdir -p "$source_dir"
unzip -q "$source_pptx" -d "$source_dir"
perl -pi -e 's#application/vnd\.openxmlformats-officedocument\.presentationml\.presentation\.main\+xml#application/vnd.openxmlformats-officedocument.presentationml.template.main+xml#g' "$source_dir/[Content_Types].xml"

if [ -f "$output_file" ]; then
  mv "$output_file" "$qa_file"
fi

cd "$source_dir"
zip -X -q -r "$output_file" .
