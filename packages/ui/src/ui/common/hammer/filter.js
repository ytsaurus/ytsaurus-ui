const filter = {};

/**
 * Flatten array of objects describing categories into array of strings
 * @param categories {Array} an array describing categories
 * @param [categoryAccessor] {String}
 * @returns {*}
 */

filter.flattenCategoriesNG = (categories, categoryAccessor) => {
    return _.map(categories, (category) => {
        return category[categoryAccessor];
    });
};

/**
 * Count the number of items for each category for current item set
 * @param settings.items {Array} array of items
 * @param settings.categories {Array} array of category names, including categoryAccumulator
 * @param settings.categoryAccumulator {String} category that sums all other categories
 * @param settings.categoryAccessor {String} accessor for category in item
 * @param settings.custom {Function} custom action to take called for each item
 *  - used to sum custom categories (e.g have a different accessor)
 * @returns {*}
 */

filter.countCategoriesNG = function (settings) {
    const count = {};

    _.each(settings.categories, (category) => {
        count[category] = 0;
    });

    _.each(settings.items, (item) => {
        if (typeof settings.custom === 'function') {
            settings.custom(item, count);
        } else {
            const category = item[settings.categoryAccessor];
            count[category]++;
            count[settings.categoryAccumulator]++;
        }
    });

    return count;
};

/**
 * Calculate a string of filtering factors
 * @param item {Object}
 * @param factors {Array} array of property names, properties may be observable
 * @returns {String}
 */
filter.calculateFactors = function (item, factors) {
    const calculated = _.map(factors, (currentFactor) => {
        return typeof currentFactor === 'function' ? currentFactor(item) : item[currentFactor];
    });

    return calculated.join(' ').toLowerCase();
};

/**
 * Filters a given collection checking supplied factors against given string
 * @param settings {Object}
 * @param settings.data {Array} - array of items to filter
 * @param settings.input {String} - string to filter against
 * @param settings.factors {Array} - array of property names, or functions
 * @returns {*}
 */
filter.filter = function (settings) {
    let data = settings.data;
    const input = settings.input.toString().toLowerCase(); // May be number

    if (input) {
        data = _.filter(data, (item) => {
            return filter.calculateFactors(item, settings.factors).indexOf(input) !== -1;
        });
    }

    return data;
};

const SEPARATOR = ' ';
const AND = '&&';
const AND_ALT = 'and';
const OR = '||';
const OR_ALT = 'or';
const OPERATORS = [].concat(AND, AND_ALT, OR, OR_ALT);
const OPERATOR = 'operator';
const LITERAL = 'literal';

function parseFilterExpression(input) {
    const parsedInput = input.split(SEPARATOR);

    let previousTokenType = OPERATOR;
    let currentTokenType;
    let currentToken;

    const tokens = [];

    for (let i = 0; i < parsedInput.length; i += 1) {
        currentToken = parsedInput[i];
        currentTokenType = OPERATORS.indexOf(currentToken) !== -1 ? OPERATOR : LITERAL;

        if (currentTokenType === previousTokenType) {
            return [
                {
                    value: input,
                    type: LITERAL,
                },
            ];
        }

        tokens.push({
            value: currentToken,
            type: currentTokenType,
        });

        previousTokenType = currentTokenType;
    }

    if (currentTokenType === OPERATOR) {
        tokens.push({
            value: '',
            type: LITERAL,
        });
    }

    return tokens;
}

function evalFilterExpression(input, factors) {
    let tokens = parseFilterExpression(input);

    tokens = tokens.map((token) => {
        if (token.type === OPERATOR) {
            if (token.value === AND_ALT) {
                return AND;
            }

            if (token.value === OR_ALT) {
                return OR;
            }

            return token.value;
        } else {
            return factors.indexOf(token.value) !== -1;
        }
    });

    return eval(tokens.join(SEPARATOR)); // Only booleans, no harm
}

/**
 * Filters a given collection checking supplied factors against given string with logical operations
 * @param settings {Object}
 * @param settings.data {Array} - array of items to filter
 * @param settings.input {String} - string to filter against
 * @param settings.factors {Array} - array of property names, or functions
 * @returns {*}
 */
filter.multifilter = function (settings) {
    let data = settings.data;
    const input = settings.input.toString().toLowerCase(); // May be number

    if (input) {
        data = _.filter(data, (item) => {
            const factors = filter.calculateFactors(item, settings.factors);

            return evalFilterExpression(input, factors);
        });
    }

    return data;
};

export default filter;
