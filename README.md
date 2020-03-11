codestore-cli
=============

Command Line Interface of code.store. Add services, deploy, debug, perform all operations from your terminal.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/codestore-cli.svg)](https://npmjs.org/package/codestore-cli)
[![Downloads/week](https://img.shields.io/npm/dw/codestore-cli.svg)](https://npmjs.org/package/codestore-cli)
[![License](https://img.shields.io/npm/l/codestore-cli.svg)](https://github.com/code-store-marketplace/codestore-cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g codestore-cli
$ codestore COMMAND
running command...
$ codestore (-v|--version|version)
codestore-cli/0.0.0 darwin-x64 node-v13.7.0
$ codestore --help [COMMAND]
USAGE
  $ codestore COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`codestore hello [FILE]`](#codestore-hello-file)
* [`codestore help [COMMAND]`](#codestore-help-command)

## `codestore hello [FILE]`

describe the command here

```
USAGE
  $ codestore hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ codestore hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/code-store-marketplace/codestore-cli/blob/v0.0.0/src/commands/hello.ts)_

## `codestore help [COMMAND]`

display help for codestore

```
USAGE
  $ codestore help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_
<!-- commandsstop -->
