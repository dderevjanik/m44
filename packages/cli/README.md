# M44 - CLI

## Usage

```text
Usage: m44 [OPTION]... FILE...
Render .m44 FILE to .png

By default, rendered file will be written alongside with input FILE, unless -o (output) is specified
Also, make sure that sed_data.json is in folder alongside with .m44 file, otherwise define path for it using -d arg
Mandatory arguments to long options are mandatory for short options too
-d path to sed_data.json
-o set output path for rendered .png file
-g use glob patter for input files. You must also include -o output folder
-l render only specific layers background,terrain,rect_terrain,obstacle,tags,unit,label,badge,lines
```

## Todo

- [ ] long arguments like `--layers`, `--glob`, etc...
