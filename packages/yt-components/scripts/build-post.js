/**
 * Post-build: replace .scss → .css in emitted JS, compile SCSS to CSS, copy JSON.
 * Run after tsc for both ESM and CJS.
 */
const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');

const buildDirs = [path.join(__dirname, '../build')];
const srcDir = path.join(__dirname, '../src');

function replaceScssWithCssInJs(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, {withFileTypes: true});
    for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
            replaceScssWithCssInJs(full);
        } else if (e.name.endsWith('.js')) {
            let content = fs.readFileSync(full, 'utf8');
            content = content.replace(/\.scss(['"])/g, '.css$1');
            fs.writeFileSync(full, content);
        }
    }
}

function copyJson(src, destDir) {
    if (!fs.existsSync(src)) return;
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        fs.mkdirSync(destDir, {recursive: true});
        for (const name of fs.readdirSync(src)) {
            copyJson(path.join(src, name), path.join(destDir, name));
        }
    } else if (src.endsWith('.json')) {
        fs.mkdirSync(path.dirname(destDir), {recursive: true});
        fs.copyFileSync(src, destDir);
    }
}

// 1) Replace .scss → .css in all built .js
for (const dir of buildDirs) {
    replaceScssWithCssInJs(dir);
}

// 2) Compile SCSS to CSS into both build dirs
for (const outDir of buildDirs) {
    execSync(`npx sass "${srcDir}:${outDir}" --no-source-map`, {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..'),
    });
}

// 3) Copy i18n JSON so require('./en.json') resolves
const i18nSrc = path.join(srcDir, 'modules/NavigationTable/i18n');
for (const outDir of buildDirs) {
    const i18nDest = path.join(outDir, 'modules/NavigationTable/i18n');
    copyJson(i18nSrc, i18nDest);
}
