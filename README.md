# M44

## Packages

### browser

Browser library that handles image loading from API, storing them in localstorage as base64 and rendering `.m44` to html5 canvas.

### cli

CLI app for rendering `.m44` files directly to png output. It is possible to render whole folder using glob pattern. Library is using `node` package.

```text
Usage: m44 [OPTION]... FILE...
Render .m44 FILE to .png

By default, rendered file will be written alongside with input FILE, unless -o (output) is specified
Also, make sure that sed_data.json is in folder alongside with .m44 file, otherwise define path for it using -d arg
Mandatory arguments to long options are mandatory for short options too
    -d path to sed_data.json
    -o set output path for rendered .png file
    -g use glob patter for input files. You must also include -o output folder
    -l render only specific layers
        background, terrain, rect_terrain, obstacle,tags, unit, label, badge, lines
```

### core

Core logic. Parsing and processing `sed_data.json`, rendering `.m44` using generic renderer (like html-canvas, node-canvas, jimp-renderer).

### node

Node library that handles loading `.m44` and caching downloaded images on filesystem.

### types

Shared types for `.m44` and `sedData`. Also includes `io-ts` schemas for parsing.

### ui

HTML app for rendering `.m44` directly inside a browser. Library is using `browser` package and [bulma css](https://bulma.io)
