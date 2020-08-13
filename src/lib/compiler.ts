import { join } from 'path';
import * as ts from 'typescript';
import { PromisifiedFs } from 'codestore-utils';
import Command from './command';

export default async (files: any, command: Command): Promise<void> => {
  const program = ts.createProgram(files, {
    declaration: true,
    importHelpers: true,
    module: 1, // commonjs
    target: 4, // es2017
    esModuleInterop: true,
    strictNullChecks: true,
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
    strict: false,
    outDir: 'temp',
  });
  const emitResult = program.emit();

  const allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  allDiagnostics.forEach((diagnostic) => {
    if (diagnostic.file) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      command.error(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
      command.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    }
  });

  await PromisifiedFs.rimraf(join(process.cwd(), 'temp'));
};
