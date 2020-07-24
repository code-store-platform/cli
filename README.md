# code.store CLI [![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io) [![License](https://img.shields.io/npm/l/codestore.svg)](https://github.com/code-store-platform/cli/blob/master/package.json) [![Version](https://img.shields.io/npm/v/codestore.svg)](https://npmjs.org/package/codestore)

[**Documentation**](https://docs.code.store) 	📖	 [**Sign Up at code.store**](https://app.code.store)	 🍙

Command Line Interface of code.store. Add services, deploy, debug, perform all operations from your terminal.

## Installation

### macOS

```bash
brew tap codestore/brew && brew install codestore
```

### Ubuntu 16+

```text
sudo snap install --classic codestore
```

### NPM

This installation method is not recommended as it does not autoupdate.

```bash
npm install -g codestore
```

## Description of commands

For any further information about `code.store` please refer to our [**Documentation**](https://docs.code.store). You can also get information about the available commands directly from the CLI by running `codestore --help` or `cs --help`.

```
code.store CLI. Add services, deploy, debug, perform all operations from your terminal.

VERSION
  codestore/X.Y.Z darwin-x64 node-version

USAGE
  $ codestore [COMMAND]

COMMANDS
  auth     Authentication commands, login, logout, whoami
  context  Manage global Project and Service contexts
  help     display help for codestore
  project  🚧 A project is a particular app or website, where you can (re)use your existing services. It might be your e-commerce project or a logistics mobile application or business web-app. Each time you add a service to a
           project, we create a separate, isolated instance of your service. Each service reused in a project has its own environments, databases, logs, and billing
  service  Create new service

OPTIONS
  --version, -v Show version information
  --help, -h    Show help
```

## Contributing

code.store Platform and CLI are in very active development and are constantly improving. Like many other projects on GitHub, this CLI is open-source and you are welcome to notify us about any issues you might encounter.

We would prefer to treat the community requests in the following order:
* Create an issue on GitHub. This is a good place to start if you find that something is not working with the CLI.
* Talk to us in our community on [**Spectrum**](https://spectrum.chat/code-store)

Of course, if you have fixed a bug or created a feature you are welcome to create a merge request!
