var error = require('../utils/error.js');

function prepareInputRows(data) {
    if (Array.isArray(data)) {
        return data.map(function (row) {
            return JSON.stringify(row);
        }).join('\n');
    } else {
        throw new Error(error.prepare('bad command arguments - "data" must be an array.'));
    }
}

function prepareWriteTableData(data) {
    const type = Object.prototype.toString.call(data);
    if (Array.isArray(data)) {
        return data.map(function (row) {
            return JSON.stringify(row);
        }).join('\n');
    } else if (type === '[object File]') {
        return data;
    } else {
        throw new Error(error.prepare('bad command arguments - "data" must be an array or a File.'));
    }
}

module.exports = {
    prepareInputRows: prepareInputRows,
    prepareWriteTableData: prepareWriteTableData,
};
