#!/bin/bash
export VERSION=`cat package.json | jq .version | tr -d '"'`
echo $VERSION
cd dist/codestore-v${VERSION}
for file in codestore-*.tar.gz
do
if [ -f "$file" ]
then
echo $file
tar -xvf $file codestore/bin/codestore
cp codestore/bin/codestore codestore/bin/cs
gzip -d $file
tar -rvf *.tar codestore/bin/cs
gzip *.tar
rm -rf codestore
fi
done
cd ../..
