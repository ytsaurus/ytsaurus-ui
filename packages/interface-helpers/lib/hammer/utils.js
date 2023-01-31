const utils = {};

utils.parseSetting = function (settings, name, defaultValue) {
    return settings && typeof settings[name] !== 'undefined' ? settings[name] : defaultValue;
};

utils.compareScalars = function (valueA, valueB, type) {
    if (valueA === undefined || valueA > valueB) {
        return type === 'asc' ? 1 : -1;
    }

    if (valueB === undefined || valueA < valueB) {
        return type === 'asc' ? -1 : 1;
    }

    return 0;
};

/**
 * A method for sorting columns in tables.
 * The sorting algorithm is "almost" lexicographical, with given exceptions:
 *  - undefined value is always considered bigger;
 * In effect:
 *  - if comparison type is 'asc' undefined moves down
 *  - if comparison type is 'desc' undefined moves up
 * @param {Array|*} vectorA
 * @param {Array|*} vectorB
 * @param {String} type
 * @returns {number}
 */
utils.compareVectors = function (vectorA, vectorB, type) {
    type = type || 'asc';

    const vectorAisArray = Array.isArray(vectorA);
    const vectorBisArray = Array.isArray(vectorB);

    if (!vectorAisArray && !vectorBisArray) {
        return utils.compareScalars(vectorA, vectorB, type);
    }

    vectorA = vectorAisArray ? vectorA : [vectorA];
    vectorB = vectorBisArray ? vectorB : [vectorB];

    let comparison;

    for (let i = 0, len = Math.max(vectorA.length, vectorB.length); i < len; i++) {
        comparison = utils.compareScalars(vectorA[i], vectorB[i], type);

        if (comparison) {
            break;
        }
    }

    return comparison;
};

module.exports = utils;
