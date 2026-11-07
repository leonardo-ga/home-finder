const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const ts = require('typescript');

const configuration = ts.readConfigFile('tsconfig.tests.json', ts.sys.readFile);
if (configuration.error)
  throw new Error(ts.flattenDiagnosticMessageText(configuration.error.messageText, '\n'));
const parsed = ts.parseJsonConfigFileContent(configuration.config, ts.sys, process.cwd());
const program = ts.createProgram(parsed.fileNames, parsed.options);
const diagnostics = [...parsed.errors, ...ts.getPreEmitDiagnostics(program)];
if (diagnostics.length) {
  console.error(
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCurrentDirectory: () => process.cwd(),
      getCanonicalFileName: (name) => name,
      getNewLine: () => '\n',
    }),
  );
  process.exit(1);
}
program.emit();
fs.writeFileSync('.test-build/package.json', '{"type":"module"}\n');
// Node 18 resolves the extensionless ES module imports emitted from the Angular source.
const files = parsed.fileNames.map((file) =>
  path.resolve('.test-build', path.relative(process.cwd(), file).replace(/\.ts$/, '.js')),
);
const result = spawnSync(
  process.execPath,
  ['--experimental-specifier-resolution=node', '--test', ...files],
  { stdio: 'inherit' },
);
process.exit(result.status ?? 1);
