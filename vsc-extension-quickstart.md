# kotlin-darcula-syntax README

## Build the Extension
```shell
  npm install
  npm run package-web
```
## Test the Extension
 - Press `F5` in VSCode to launch a new Extension Development Host.
 - Open a Kotlin file (.kt or .kts).
 - The file should now open in the custom editor with syntax highlighting provided by highlight.js.

## Package the Extension

 1. Install `vsce`:
```shell
  npm install -g vsce
```
2. Package the extension: 
```shell
  vsce package
```

Publish to https://open-vsx.org/