var error = require('../utils/error.js');
var setup = require('../utils/setup.js');

function prepareInputRows(localSetup, data) {
    var serializer = setup.getOption(localSetup, 'JSONSerializer');

    if (Array.isArray(data)) {
        return data.map(function (row) {
            return serializer.stringify(row);
        }).join('\n');
    } else {
        throw new Error(error.prepare('bad command arguments - "data" must be an array.'));
    }
}

function prepareWriteTableData(localSetup, data) {
    var serializer = setup.getOption(localSetup, 'JSONSerializer');

    const type = Object.prototype.toString.call(data);
    if (Array.isArray(data)) {
        return data.map(function (row) {
            return serializer.stringify(row);
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
