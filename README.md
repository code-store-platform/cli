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
* [`codestore auth:login`](#codestore-authlogin)
* [`codestore auth:logout`](#codestore-authlogout)
* [`codestore auth:whoami`](#codestore-authwhoami)
* [`codestore context:clear`](#codestore-contextclear)
* [`codestore context:list`](#codestore-contextlist)
* [`codestore context:project [PROJECTID]`](#codestore-contextproject-projectid)
* [`codestore context:service [SERVICEID]`](#codestore-contextservice-serviceid)
* [`codestore help [COMMAND]`](#codestore-help-command)
* [`codestore project:create`](#codestore-projectcreate)
* [`codestore project:list`](#codestore-projectlist)
* [`codestore service:list`](#codestore-servicelist)

## `codestore auth:login`

Authenticate at code.store platform

```
USAGE
  $ codestore auth:login

OPTIONS
  -i, --interactive  Login with email and password

ALIASES
  $ codestore login
```

## `codestore auth:logout`

Clears user credentials and invalidates local session

```
USAGE
  $ codestore auth:logout

ALIASES
  $ codestore logout
```

## `codestore auth:whoami`

Display the currently logged in user

```
USAGE
  $ codestore auth:whoami

ALIASES
  $ codestore whoami
```

## `codestore context:clear`

Clear all contexts

```
USAGE
  $ codestore context:clear
```

## `codestore context:list`

List all globally set contexts

```
USAGE
  $ codestore context:list

ALIASES
  $ codestore context:ls
```

## `codestore context:project [PROJECTID]`

Manage global project context

```
USAGE
  $ codestore context:project [PROJECTID]

OPTIONS
  -c, --clear  Clear project context
```

## `codestore context:service [SERVICEID]`

Manage global service context

```
USAGE
  $ codestore context:service [SERVICEID]

OPTIONS
  -c, --clear  Clear service context
```

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

## `codestore project:create`

Create a new project

```
USAGE
  $ codestore project:create

OPTIONS
  --description=description  Description of the project
  --identifier=identifier    Unique identifier of the project. Can contain only a-z, _ and - characters
  --name=name                Name of the project
```

## `codestore project:list`

Lists projects in your organization

```
USAGE
  $ codestore project:list

OPTIONS
  -x, --extended          show extra columns
  --columns=columns       only show provided columns (comma-separated)
  --csv                   output is csv format [alias: --output=csv]
  --filter=filter         filter property by partial string matching, ex: name=foo
  --no-header             hide table header from output
  --no-truncate           do not truncate output to fit screen
  --output=csv|json|yaml  output in a more machine friendly format
  --sort=sort             property to sort by (prepend '-' for descending)

ALIASES
  $ codestore project:ls
```

## `codestore service:list`

List your services

```
USAGE
  $ codestore service:list

OPTIONS
  -a, --all                    List all services
  -p, --project-id=project-id  Project ID

ALIASES
  $ codestore service:ls
```
<!-- commandsstop -->
