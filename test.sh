#!/bin/bash

# render all *.m44 files in data folder
# ts-node ./packages/cli/cli.ts -d ./data/sed_data.json -l background,outlines,terrain -o ./gdrive/base ./gdrive/X.m44
# ts-node ./packages/cli/cli.ts -d ./data/sed_data.json -l background,rect_terrain,terrain,lines,label -o ./gdrive/base ./gdrive/base/*Overlord*.m44
# ts-node ./packages/cli/cli.ts -d ./data/sed_data.json ./gdrive/base/*Overlord*.m44


# ts-node ./packages/cli/cli.ts -d ./data/sed_data.json -l background,rect_terrain,terrain,lines,label -o ./gdrive/base ./gdrive/base/**.m44
# ts-node ./packages/cli/cli.ts -d ./data/sed_data.json -l background,rect_terrain,terrain,lines,label -o ./gdrive/eastern ./gdrive/eastern/**.m44
# ts-node ./packages/cli/cli.ts -d ./data/sed_data.json -l background,rect_terrain,terrain,lines,label -o ./gdrive/medi ./gdrive/medi/**.m44
# ts-node ./packages/cli/cli.ts -d ./data/sed_data.json -l background,rect_terrain,terrain,lines,label -o ./gdrive/ext ./gdrive/ext/**.m44
