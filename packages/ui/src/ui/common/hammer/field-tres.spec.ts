import _ from 'lodash';
import {FieldTree, FieldTreePredicate, fieldTreeForEach, filterFieldTree} from './field-tree';

function makeCollector<T, R>(fn?: FieldTreePredicate<T, R>) {
    const dst: Array<string> = [];
    function collect(path: Array<string>, tree?: FieldTree<T>, item?: T) {
        const suffix = tree ? '' : `:${item}`;
        dst.push(path.join('/') + '_' + suffix);
        return fn ? fn(path, tree, item) : undefined;
    }
    return {
        dst,
        collect,
        fn,
    };
}

function isString(v: any): v is string {
    return 'string' === typeof v;
}

describe('fieldTreeForEach', () => {
    it('Empty tree', () => {
        const {dst, collect} = makeCollector();
        fieldTreeForEach({}, isString, collect);
        expect(dst).toEqual([]);
    });
    it('Tree 1', () => {
        const tree: FieldTree<string> = {
            a: {
                b: 'bb',
                c: {
                    d: 'dd',
                    e: 'ee',
                },
            },
            f: {},
            g: 'gg',
        };

        const {dst, collect} = makeCollector();
        fieldTreeForEach(tree, isString, collect);
        expect(dst).toEqual(['a_', 'a/b_:bb', 'a/c_', 'a/c/d_:dd', 'a/c/e_:ee', 'f_', 'g_:gg']);
    });
});

function isNumber(v: any): v is number {
    return 'number' === typeof v;
}

describe('filterFieldTree', () => {
    it('FieldTree<number>, where v >= 10', () => {
        const tree: FieldTree<number> = {
            a: {
                b: 2,
                c: 20,
                d: {
                    e: 30,
                    f: 4,
                },
            },
            g: 50,
            i: 6,
        };

        const filter = (_path: Array<string>, t?: typeof tree, item?: number): boolean => {
            return Boolean(t) || item! >= 10;
        };

        const res = filterFieldTree(tree, isNumber, filter);
        expect(res).toEqual({a: {c: 20, d: {e: 30}}, g: 50});
    });

    it('FieldTree<Array<number>>, where v >= 10', () => {
        const tree: FieldTree<Array<number>> = {
            a: {
                b: [2],
                c: [20, 3, 22],
                d: {
                    e: [30, 4, 33],
                    f: [4],
                },
            },
            g: [50],
            i: {
                secret: [600],
            },
        };

        const predicate = (_path: Array<string>, t?: typeof tree, _item?: Array<number>) => {
            return t?.secret === undefined;
        };
        const filterT = (item: Array<number>) => {
            const res = item.filter((i) => i >= 10);
            return res.length ? res : undefined;
        };
        const res = filterFieldTree(tree, Array.isArray, predicate, filterT);
        expect(res).toEqual({a: {c: [20, 22], d: {e: [30, 33]}}, g: [50]});
    });
});
