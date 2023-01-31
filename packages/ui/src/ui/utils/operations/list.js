export function isOperationId(value) {
    const idSection = '[0-9a-fA-F]{1,8}';
    const idRegexp = new RegExp(`^${idSection}-${idSection}-${idSection}-${idSection}$`);
    return idRegexp.test(value);
}

export function isGotoEnabled(value) {
    const aliasRegexp = new RegExp('^\\*[0-9a-zA-Z_-]+$');
    return isOperationId(value) || aliasRegexp.test(value);
}
