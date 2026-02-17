import {snakeToCamel, snakeToCamelObject} from './snake-to-camel';

describe('snakeToCamel', () => {
    it('hello_world_test', () => {
        expect(snakeToCamel('hello_world_user')).toBe('helloWorldUser');
    });
    it('_begin_test', () => {
        expect(snakeToCamel('_begin_test')).toBe('BeginTest');
    });
    it('end_test_', () => {
        expect(snakeToCamel('end_test_')).toBe('endTest_');
    });
});

describe('snakeToCamelObject', () => {
    it('undefined', () => {
        expect(snakeToCamelObject(undefined)).toBe(undefined);
    });
    it('test 1', () => {
        expect(snakeToCamelObject({access_log_base_path: 's1', accounts_usage: 's2'})).toEqual({
            accessLogBasePath: 's1',
            accountsUsage: 's2',
        });
    });
});
