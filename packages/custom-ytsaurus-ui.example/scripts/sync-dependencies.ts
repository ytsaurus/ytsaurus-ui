const fs = require("node:path");

const [_nodeBin, script, a, srcFile, dstFile] = process.argv;

if ((a !== "check" && a !== "sync") || !srcFile || !dstFile) {
    console.error(`Unexpecte action: ${a}`);
    showHelp();
}

type ActionType = "check" | "sync";

const action: ActionType = a as ActionType;

const { PWD } = process.env;

function showHelp() {
    console.log("\nUsage:");
    showActionHelp("check");
    showActionHelp("sync");
}
function showActionHelp(action: ActionType) {
    console.log(
        "\n\t",
        process.argv0,
        action,
        fs.relative(PWD, script),
        "src_file",
        "dst_file",
    );
}

function absPath(path: string) {
    return path.startsWith("/") ? path : PWD + "/" + path;
}

const srcData = require(absPath(srcFile));
const dstData = require(absPath(dstFile));

let needFix = false;
let fixed = false;

type HasDependencies = Record<
    "dependencies" | "devDependencies",
    Record<string, string>
>;

function syncDeps<Type extends keyof HasDependencies>(
    type: Type,
    srcData: HasDependencies,
    dstData: HasDependencies,
) {
    if (!dstData[type]) {
        dstData[type] = {};
    }
    const src = srcData[type];
    const dst: Record<string, string> = dstData[type]!;

    Object.keys(src || {}).forEach((k) => {
        if (src[k] !== dst[k]) {
            switch (action) {
                case "check": {
                    needFix = true;
                    console.error(
                        `'${k}' from ${type} is not synced: ${src[k]} !== ${dst[k]}.`,
                    );
                    break;
                }
                case "sync": {
                    console.info(
                        `sync '${k}' from ${type}: ${src[k]} !== ${dst[k]}.`,
                    );

                    dst[k] = src[k];
                    fixed = true;
                }
            }
        }
    });
}

syncDeps("dependencies", srcData, dstData);
syncDeps("devDependencies", srcData, dstData);

if (needFix) {
    process.exit(2);
}

if (fixed) {
    require("node:fs").writeFile(
        dstFile,
        JSON.stringify(dstData, null, 2),
        () => {},
    );
}
