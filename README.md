JSPM LESS Plugin
===

This is a systemjs plugin that allows injection of less files without the need for pre-compiling.

The less files are loaded in using ajax then rendered and injected as a style tag into the document head.

(This is an experimental plugin)

## Installation

    jspm install less
  
## Usage

CommonJS:

    require("path/to/style.less!");

ES6:

    import "path/to/style.less!"

## Options
The plugin can be customized under `lessOptions` property of JSPM config:

#### append 
*(boolean)* Defines how to handle the imported less file. If true, will append the loaded style to documents head, otherwise will return the content of the style to be used in the javascript context.
