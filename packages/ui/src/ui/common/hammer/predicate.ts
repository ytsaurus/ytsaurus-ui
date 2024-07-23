import map_ from 'lodash/map';
import some_ from 'lodash/some';

type PredicateFunction<T> = (arg: T) => boolean;
type PredicateObject<T extends object> = Partial<T>;
type Predicate<T extends object> = PredicateFunction<T> | PredicateObject<T>;

/**
 * Helper that concatenates predicates by AND
 * Examples:
 *
 *   const f1 = concatByAnd(
 *     (d) => d.value === 'abc',
 *     (d) => d.hidden === false,
 *   )
 *
 *   const f2 = concatByAnd({value: 'abc', hidden: false})
 *   const f3 = concatByAnd({value: 'abc'}, {hidden: false})
 *   const f4 = concatByAnd((d) => d.value === 'abc', {hidden: false})
 *   const f5 = concatByAnd((d) => d.hidden === false, {value: 'abc'})
 *   const f6 = concatByAnd({value: 'abc'}, (d) => d.hidden === false)
 *
 *  f1, f2, f3, f4, f5, f6 will return the same results
 *
 *  true  === f1({value: 'abc', hidden: false})
 *  false === f1({value: 'abc'})
 *  false === f1({hidden: false})
 *
 * @param predicates
 */
export function concatByAnd<T extends object>(
    ...predicates: Array<Predicate<T>>
): PredicateFunction<T> {
    const converted = map_(predicates, (p) => {
        if (typeof p === 'function') {
            return p;
        }
        const keys = Object.keys(p);
        return function (d: T) {
            if (keys.length === 0) {
                return true;
            }
            if (d === null || d === undefined) {
                return false;
            }

            return !some_(keys, (key: keyof T) => {
                return d[key] !== p[key];
            });
        };
    });
    return (...args) => {
        return !some_(converted, (p) => {
            return !p(...args);
        });
    };
}

/**
 * Helper function that concatenates predicates by OR
 * Examples:
 *
 *   const f1 = concatByOr(
 *     (d) => d.value === 'abc',
 *     (d) => d.hidden === false,
 *   )
 *   const f2 = concatByOr({value: 'abc', hidden: false})
 *   const f3 = concatByOr({value: 'abc'}, {hidden: false})
 *   const f4 = concatByOr((d) => d.value === 'abc', {hidden: false})
 *   const f5 = concatByOr((d) => d.hidden === false, {value: 'abc'})
 *   const f6 = concatByOr({value: 'abc'}, (d) => d.hidden === false)
 *
 *  f1, f2, f3, f4, f5, f6 will return the same
 *
 *  true === f1({value: 'abc', hidden: false})
 *  true === f1({value: 'abc'})
 *  true === f1({hidden: false})
 *  false === f1({value: 'cde', hidden: false})
 *  false === f1({value: 'abc', hidden: true})
 *
 * @param predicates
 * @returns {function(...[*]): boolean}
 */
export function concatByOr<T extends object>(
    ...predicates: Array<Predicate<T>>
): PredicateFunction<T> {
    const converted = map_(predicates, (p) => {
        if (typeof p === 'function') {
            return p;
        }
        const keys = Object.keys(p);
        return function (d: T) {
            if (keys.length === 0) {
                return true;
            }
            if (d === null || d === undefined) {
                return false;
            }

            return some_(keys, (key: keyof T) => {
                return d[key] === p[key];
            });
        };
    });
    return (...args) => {
        return some_(converted, (p) => {
            return p(...args);
        });
    };
}
