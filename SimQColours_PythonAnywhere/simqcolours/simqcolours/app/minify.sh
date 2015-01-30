#!/bin/sh

cd js/
cat src/plugins.js jquery.color.js jquery.canvasimage.js | jsmin > plugins.min.js
cd ../
