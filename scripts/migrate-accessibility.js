#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('node:fs');
const path = require('node:path');
const babel = require('@babel/core');

const ROOT_DIR = process.cwd();
const SRC_DIR = path.join(ROOT_DIR, 'src');
const ACCESSIBILITY_DIR = path.join(SRC_DIR, 'accessibility');
const VALID_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx']);

const args = new Set(process.argv.slice(2));
const isWriteMode = args.has('--write');

function toPosix(p) {
  return p.replace(/\\/g, '/');
}

function getAccessibilityImportPath(filePath) {
  const fromDir = path.dirname(filePath);
  let rel = path.relative(fromDir, ACCESSIBILITY_DIR);
  rel = toPosix(rel);

  if (!rel.startsWith('.')) {
    rel = `./${rel}`;
  }

  return rel;
}

function listFilesRecursively(dir) {
  const output = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (fullPath === ACCESSIBILITY_DIR) {
        continue;
      }

      output.push(...listFilesRecursively(fullPath));
      continue;
    }

    if (entry.isFile() && VALID_EXTENSIONS.has(path.extname(entry.name))) {
      output.push(fullPath);
    }
  }

  return output;
}

function transformFile(filePath) {
  const input = fs.readFileSync(filePath, 'utf8');
  const accessibilityImportPath = getAccessibilityImportPath(filePath);

  let touched = false;

  const result = babel.transformSync(input, {
    filename: filePath,
    configFile: false,
    babelrc: false,
    parserOpts: {
      sourceType: 'unambiguous',
      plugins: ['jsx', 'typescript', 'classProperties', 'objectRestSpread'],
    },
    plugins: [
      ({ types: t }) => ({
        pre() {
          this.replacedText = false;
          this.replacedImage = false;
          this.removedFromReactNative = false;
        },
        visitor: {
          JSXOpeningElement(pathRef) {
            if (t.isJSXIdentifier(pathRef.node.name, { name: 'Text' })) {
              pathRef.node.name = t.jsxIdentifier('AccessibleText');
              this.replacedText = true;
              touched = true;
            }

            if (t.isJSXIdentifier(pathRef.node.name, { name: 'Image' })) {
              pathRef.node.name = t.jsxIdentifier('AccessibleImage');
              this.replacedImage = true;
              touched = true;
            }
          },
          JSXClosingElement(pathRef) {
            if (t.isJSXIdentifier(pathRef.node.name, { name: 'Text' })) {
              pathRef.node.name = t.jsxIdentifier('AccessibleText');
              this.replacedText = true;
              touched = true;
            }

            if (t.isJSXIdentifier(pathRef.node.name, { name: 'Image' })) {
              pathRef.node.name = t.jsxIdentifier('AccessibleImage');
              this.replacedImage = true;
              touched = true;
            }
          },
          Program: {
            exit(pathRef, state) {
              if (!this.replacedText && !this.replacedImage) {
                return;
              }

              const requiredIdentifiers = [];
              if (this.replacedText) {
                requiredIdentifiers.push('AccessibleText');
              }
              if (this.replacedImage) {
                requiredIdentifiers.push('AccessibleImage');
              }

              for (const child of pathRef.get('body')) {
                if (!child.isImportDeclaration()) {
                  continue;
                }

                if (child.node.source.value !== 'react-native') {
                  continue;
                }

                const nextSpecifiers = [];
                let removedSomething = false;

                for (const spec of child.node.specifiers) {
                  if (
                    t.isImportSpecifier(spec) &&
                    ((this.replacedText && spec.imported.name === 'Text') ||
                      (this.replacedImage && spec.imported.name === 'Image'))
                  ) {
                    removedSomething = true;
                    continue;
                  }

                  nextSpecifiers.push(spec);
                }

                if (removedSomething) {
                  this.removedFromReactNative = true;
                  touched = true;
                }

                if (nextSpecifiers.length === 0) {
                  child.remove();
                } else {
                  child.node.specifiers = nextSpecifiers;
                }
              }

              let accessibilityImport = null;
              for (const child of pathRef.get('body')) {
                if (!child.isImportDeclaration()) {
                  continue;
                }

                if (child.node.source.value === accessibilityImportPath) {
                  accessibilityImport = child;
                  break;
                }
              }

              if (accessibilityImport) {
                const existing = new Set(
                  accessibilityImport.node.specifiers
                    .filter((spec) => t.isImportSpecifier(spec))
                    .map((spec) => spec.imported.name)
                );

                for (const name of requiredIdentifiers) {
                  if (!existing.has(name)) {
                    accessibilityImport.node.specifiers.push(
                      t.importSpecifier(t.identifier(name), t.identifier(name))
                    );
                    touched = true;
                  }
                }
              } else {
                const importDecl = t.importDeclaration(
                  requiredIdentifiers.map((name) =>
                    t.importSpecifier(t.identifier(name), t.identifier(name))
                  ),
                  t.stringLiteral(accessibilityImportPath)
                );

                const bodyPaths = pathRef.get('body');
                const lastImport = [...bodyPaths].reverse().find((p) => p.isImportDeclaration());

                if (lastImport) {
                  lastImport.insertAfter(importDecl);
                } else {
                  pathRef.unshiftContainer('body', importDecl);
                }

                touched = true;
              }
            },
          },
        },
      }),
    ],
    generatorOpts: {
      retainLines: true,
      jsescOption: { minimal: true },
    },
  });

  if (!result || !result.code || !touched || result.code === input) {
    return { changed: false, code: input };
  }

  return { changed: true, code: result.code };
}

function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error('Could not find src directory. Run this script from repository root.');
    process.exit(1);
  }

  const files = listFilesRecursively(SRC_DIR);
  let changedCount = 0;

  for (const file of files) {
    const relPath = toPosix(path.relative(ROOT_DIR, file));
    const { changed, code } = transformFile(file);

    if (!changed) {
      continue;
    }

    changedCount += 1;

    if (isWriteMode) {
      fs.writeFileSync(file, code, 'utf8');
      console.log(`[updated] ${relPath}`);
    } else {
      console.log(`[would update] ${relPath}`);
    }
  }

  if (changedCount === 0) {
    console.log('No files required changes.');
    return;
  }

  if (!isWriteMode) {
    console.log(`\nDry run complete. ${changedCount} file(s) would be updated.`);
    console.log('Run with --write to apply changes.');
    return;
  }

  console.log(`\nDone. Updated ${changedCount} file(s).`);
}

main();
