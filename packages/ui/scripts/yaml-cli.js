const yaml = require('js-yaml');
const fs = require('fs');

const action = process.argv[3];
const isOkAction = action === 'get' || action === 'set';

if (!isOkAction || action === 'get' && process.argv.length < 5 || process.argv.length < 5) {
    const file = process.argv[1];
    console.log(
        'Usage:\n',
        `    ${file} file_path get obj_path\n`,
        `    ${file} file_path set obj_path new_value\n`,
    );
    process.exit(1);
} else {
    editFile();
}

function editFile() {
    const filePath = process.argv[2]; // ex.: ~/my/file.yaml
    const objPath = process.argv[4]; // ex.: spec.deploy_units.ui.images_for_boxes.ui.tag
    const newValue = process.argv[5]; // ex.: 1.234.5

    // Get document, or throw exception on error
    try {
        const doc = yaml.load(fs.readFileSync(filePath, 'utf8'));
        const objPathArr = objPath.split('.');
        if (action === 'set') {
            setValue(doc, objPathArr, newValue);
            console.log(yaml.dump(doc, {lineWidth: 1000, noArrayIndent: true}));
        } else {
            console.log(getValue(doc, objPathArr));
        }
    } catch (e) {
        console.error(e);
        process.exit(2);
    }
}

function setValue(dst, [key, ...rest], value) {
    if (0 === rest.length) {
        dst[key] = value;
    } else {
        setValue(dst[key] = dst[key] || {}, rest, value);
    }
}

function getValue(dst, [key, ...rest]) {
    if (0 === rest.length) {
        return dst[key];
    } else {
        return getValue(dst[key], rest);
    }
}
