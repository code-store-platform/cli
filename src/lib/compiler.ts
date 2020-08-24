import * as ts from 'typescript';
import { PromisifiedFs } from 'codestore-utils';
import path from 'path';
import paths from '../common/constants/paths';

export default async (files: any): Promise<void> => {
  // cleaning-up before compilation
  await PromisifiedFs.rimraf(path.join(process.cwd(), paths.BUILD));

  const program = ts.createProgram(files, {
    declaration: true,
    importHelpers: true,
    module: ts.ModuleKind.CommonJS, // commonjs
    target: ts.ScriptTarget.ES2017, // es2017
    esModuleInterop: true,
    strictNullChecks: true,
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
    strict: false,
    outDir: paths.BUILD,
    rootDir: 'src',
  });
  const emitResult = program.emit();

  const allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  allDiagnostics.forEach((diagnostic) => {
    if (diagnostic.file) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      throw new Error(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    }
  });
};
