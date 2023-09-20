import {concatByAnd, concatByOr} from './predicate';

describe('concatByAnd', () => {
    let p1, p2, p3;
    let res1, res2, res3;
    let fn;

    beforeEach(() => {
        p1 = jest.fn(() => res1);
        p2 = jest.fn(() => res2);
        p3 = jest.fn(() => res3);
        res1 = false;
        res2 = false;
        res3 = false;
        fn = concatByAnd(p1, p2, p3);
    });

    it('p2 and p3 should not be called, fn should return false', () => {
        expect(fn('a', 'b', 'c')).toBeFalsy();
        expect(p1).toHaveBeenCalledWith('a', 'b', 'c');
        expect(p1).toHaveBeenCalledTimes(1);

        expect(p2).not.toHaveBeenCalled();
        expect(p3).not.toHaveBeenCalled();
    });

    it('p3 should not be called, fn should return false', () => {
        res1 = true;

        expect(fn('d', 'e')).toBeFalsy();

        expect(p1).toHaveBeenCalledWith('d', 'e');
        expect(p1).toHaveBeenCalledTimes(1);

        expect(p2).toHaveBeenCalledWith('d', 'e');
        expect(p2).toHaveBeenCalledTimes(1);

        expect(p3).not.toHaveBeenCalled();
    });

    it('p3 should be called, fn should return false', () => {
        res1 = true;
        res2 = true;

        expect(fn('d', 'e')).toBeFalsy();

        expect(p1).toHaveBeenCalledWith('d', 'e');
        expect(p1).toHaveBeenCalledTimes(1);

        expect(p2).toHaveBeenCalledWith('d', 'e');
        expect(p2).toHaveBeenCalledTimes(1);

        expect(p3).toHaveBeenCalledWith('d', 'e');
        expect(p3).toHaveBeenCalledTimes(1);
    });

    it('fn should return true', () => {
        res1 = true;
        res2 = true;
        res3 = true;

        expect(fn('d', 'e')).toBeTruthy();

        expect(p1).toHaveBeenCalledWith('d', 'e');
        expect(p1).toHaveBeenCalledTimes(1);

        expect(p2).toHaveBeenCalledWith('d', 'e');
        expect(p2).toHaveBeenCalledTimes(1);

        expect(p3).toHaveBeenCalledWith('d', 'e');
        expect(p3).toHaveBeenCalledTimes(1);
    });
});

describe('concatByAnd with objects', () => {
    let f1, f2, f3, f4, f5;
    beforeAll(() => {
        f1 = concatByAnd(
            (d) => d.value === 'abc',
            (d) => d.hidden === false,
        );

        f2 = concatByAnd({value: 'abc', hidden: false});
        f3 = concatByAnd({value: 'abc'}, {hidden: false});
        f4 = concatByAnd({value: 'abc'}, (d) => d.hidden === false);
        f5 = concatByAnd((d) => d.value === 'abc', {hidden: false});
    });

    it('test 0', () => {
        expect(f1({})).toBe(false);
        expect(f2({})).toBe(false);
        expect(f3({})).toBe(false);
        expect(f4({})).toBe(false);
        expect(f5({})).toBe(false);
    });

    it('test 1', () => {
        expect(f1({value: 'abc', hidden: false})).toBe(true);
        expect(f2({value: 'abc', hidden: false})).toBe(true);
        expect(f3({value: 'abc', hidden: false})).toBe(true);
        expect(f4({value: 'abc', hidden: false})).toBe(true);
        expect(f5({value: 'abc', hidden: false})).toBe(true);
    });

    it('test 2', () => {
        expect(f1({value: 'abc'})).toBeFalsy();
        expect(f2({value: 'abc'})).toBeFalsy();
        expect(f3({value: 'abc'})).toBeFalsy();
        expect(f4({value: 'abc'})).toBeFalsy();
        expect(f5({value: 'abc'})).toBeFalsy();
    });

    it('test 3', () => {
        expect(f1({hidden: false})).toBeFalsy();
        expect(f2({hidden: false})).toBeFalsy();
        expect(f3({hidden: false})).toBeFalsy();
        expect(f4({hidden: false})).toBeFalsy();
        expect(f5({hidden: false})).toBeFalsy();
    });
});

describe('concatByOr', () => {
    let p1, p2, p3;
    let res1, res2, res3;
    let fn;

    beforeEach(() => {
        p1 = jest.fn(() => res1);
        p2 = jest.fn(() => res2);
        p3 = jest.fn(() => res3);
        res1 = true;
        res2 = true;
        res3 = true;
        fn = concatByOr(p1, p2, p3);
    });

    it('p2 and p3 should not be called, fn should return true', () => {
        expect(fn('a', 'b', 'c')).toBeTruthy();
        expect(p1).toHaveBeenCalledWith('a', 'b', 'c');
        expect(p1).toHaveBeenCalledTimes(1);

        expect(p2).not.toHaveBeenCalled();
        expect(p3).not.toHaveBeenCalled();
    });

    it('p3 should not be called, fn should return false', () => {
        res1 = false;

        expect(fn('d', 'e')).toBeTruthy();

        expect(p1).toHaveBeenCalledWith('d', 'e');
        expect(p1).toHaveBeenCalledTimes(1);

        expect(p2).toHaveBeenCalledWith('d', 'e');
        expect(p2).toHaveBeenCalledTimes(1);

        expect(p3).not.toHaveBeenCalled();
    });

    it('p3 should be called, fn should return false', () => {
        res1 = false;
        res2 = false;

        expect(fn('d', 'e')).toBeTruthy();

        expect(p1).toHaveBeenCalledWith('d', 'e');
        expect(p1).toHaveBeenCalledTimes(1);

        expect(p2).toHaveBeenCalledWith('d', 'e');
        expect(p2).toHaveBeenCalledTimes(1);

        expect(p3).toHaveBeenCalledWith('d', 'e');
        expect(p3).toHaveBeenCalledTimes(1);
    });

    it('fn should return true', () => {
        res1 = false;
        res2 = false;
        res3 = false;

        expect(fn('d', 'e')).toBeFalsy();

        expect(p1).toHaveBeenCalledWith('d', 'e');
        expect(p1).toHaveBeenCalledTimes(1);

        expect(p2).toHaveBeenCalledWith('d', 'e');
        expect(p2).toHaveBeenCalledTimes(1);

        expect(p3).toHaveBeenCalledWith('d', 'e');
        expect(p3).toHaveBeenCalledTimes(1);
    });
});

describe('concatByOr with objects', () => {
    let f1, f2, f3, f4, f5;
    beforeAll(() => {
        f1 = concatByOr(
            (d) => d.value === 'abc',
            (d) => d.hidden === false,
        );

        f2 = concatByOr({value: 'abc', hidden: false});
        f3 = concatByOr({value: 'abc'}, {hidden: false});
        f4 = concatByOr((d) => d.value === 'abc', {hidden: false});
        f5 = concatByOr({value: 'abc'}, (d) => d.hidden === false);
    });

    it('test 0', () => {
        expect(f1({})).toBe(false);
        expect(f2({})).toBe(false);
        expect(f3({})).toBe(false);
        expect(f4({})).toBe(false);
        expect(f5({})).toBe(false);
    });

    it('test 1', () => {
        expect(f1({value: 'abc', hidden: false})).toBe(true);
        expect(f2({value: 'abc', hidden: false})).toBe(true);
        expect(f3({value: 'abc', hidden: false})).toBe(true);
        expect(f4({value: 'abc', hidden: false})).toBe(true);
        expect(f5({value: 'abc', hidden: false})).toBe(true);
    });

    it('test 2', () => {
        expect(f1({value: 'abc'})).toBe(true);
        expect(f2({value: 'abc'})).toBe(true);
        expect(f3({value: 'abc'})).toBe(true);
        expect(f4({value: 'abc'})).toBe(true);
        expect(f5({value: 'abc'})).toBe(true);
    });

    it('test 3', () => {
        expect(f1({hidden: false})).toBe(true);
        expect(f2({hidden: false})).toBe(true);
        expect(f3({hidden: false})).toBe(true);
        expect(f4({hidden: false})).toBe(true);
        expect(f5({hidden: false})).toBe(true);
    });
});
