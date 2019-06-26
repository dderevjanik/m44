#!/bin/bash

# render all *.m44 files in data folder
# ts-node ./packages/cli/cli.ts -d ./data/sed_data.json -o ./gdrive/base ./gdrive/base/**.m44

ts-node ./packages/cli/cli.ts -d ./data/sed_data.json -l rect_terrain,terrain,lines,label -o ./gdrive/base ./gdrive/base/**.m44
ts-node ./packages/cli/cli.ts -d ./data/sed_data.json -l rect_terrain,terrain,lines,label -o ./gdrive/eastern ./gdrive/eastern/**.m44
ts-node ./packages/cli/cli.ts -d ./data/sed_data.json -l rect_terrain,terrain,lines,label -o ./gdrive/medi ./gdrive/medi/**.m44
ts-node ./packages/cli/cli.ts -d ./data/sed_data.json -l rect_terrain,terrain,lines,label -o ./gdrive/ext ./gdrive/ext/**.m44
