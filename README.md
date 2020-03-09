# codestore-cli

🖥Command Line Interface of code.store. Add services, deploy, debug, perform all operations from your terminal.

## Usage
  <!-- usage -->
```sh-session
$ npm install -g codestore-cli
$ cs COMMAND
running command...
$ cs (-v|--version|version)
codestore-cli/0.1.0 darwin-x64 node-v13.7.0
$ cs --help [COMMAND]
USAGE
  $ cs COMMAND
...
```
<!-- usagestop -->

## Commands
  <!-- commands -->
* [`cs auth:login`](#cs-authlogin)
* [`cs auth:logout`](#cs-authlogout)
* [`cs auth:whoami`](#cs-authwhoami)
* [`cs env:env [ACTION] [ENVNAME] [ENVVALUE]`](#cs-envenv-action-envname-envvalue)
* [`cs help [COMMAND]`](#cs-help-command)
* [`cs old_config`](#cs-old_config)

## `cs auth:login`

Authenticate at code.store platform

```
USAGE
  $ cs auth:login

OPTIONS
  -i, --interactive  Login with email and password

ALIASES
  $ cs login
```

_See code: [src/commands/auth/login.ts](https://github.com/cli/code-store/blob/v0.1.0/src/commands/auth/login.ts)_

## `cs auth:logout`

Clears user credentials and invalidates local session

```
USAGE
  $ cs auth:logout

ALIASES
  $ cs logout
```

_See code: [src/commands/auth/logout.ts](https://github.com/cli/code-store/blob/v0.1.0/src/commands/auth/logout.ts)_

## `cs auth:whoami`

Display the currently logged in user

```
USAGE
  $ cs auth:whoami

ALIASES
  $ cs whoami
```

_See code: [src/commands/auth/whoami.ts](https://github.com/cli/code-store/blob/v0.1.0/src/commands/auth/whoami.ts)_

## `cs env:env [ACTION] [ENVNAME] [ENVVALUE]`

```
USAGE
  $ cs env:env [ACTION] [ENVNAME] [ENVVALUE]
```

_See code: [src/commands/env/env.ts](https://github.com/cli/code-store/blob/v0.1.0/src/commands/env/env.ts)_

## `cs help [COMMAND]`

display help for cs

```
USAGE
  $ cs help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_

## `cs old_config`

```
USAGE
  $ cs old_config
```

_See code: [src/commands/old_config.ts](https://github.com/cli/code-store/blob/v0.1.0/src/commands/old_config.ts)_
<!-- commandsstop -->
