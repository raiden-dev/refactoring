# JavaScript Refactoring Tools

Collection of the JavaScript static and dynamic analysis tools suitable for code refactoring or other uses.

## List of tools

  * Instrumenter – Instruments every function to measure execution performance at runtime.

## Installation

You may prefer to install refactoring tools globally and use them from shell or install locally to use from npm scripts or your code.

To install globally run:

```sh
# may require sudo priveleges
npm install -g refactoring
```

To install locally for project run:

```sh
npm install refactoring --save-dev
```

## Usage

Binaries exported from the package has unique `js-` prefix to avoid possible conflicts with system-wide executables.  
To list particular tool options and usage information use `-h` flag.  

Here is detailed overview for every tool.

### Instrumenter

Command: `js-instrument`  
Basic usage: `js-instrument -o /path/to/output.js -c /path/to/inst.js input.js`  

Instrumenter tool takes input file with your code, instruments it with client instructions and places output to path specified by `-o` or `--output` option.  

You need to include client file in your project as well to handle added instructions. To use default instrumenter client pass the option `-c` or `--client` with path where to place client's file. Note that the client script should be included before the instrumented script on the page.  

When using default client it will export `window.inst` object. Use `window.inst.result()` method to see current statistics.
