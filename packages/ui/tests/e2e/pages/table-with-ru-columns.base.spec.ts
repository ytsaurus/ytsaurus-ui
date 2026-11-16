import {expect, test} from '../../fixtures/navigation';
import {E2E_DIR, makeClusterUrl} from '../../utils';
import {ytApi} from '../../utils/yt-api';

const columns = [
    'Номер РК в Директе',
    'ID агентства',
    'Оборот по РМП',
    'Название кампании',
    'Клиент',
    'Показы',
    'Клики',
];

for (const dynamic of [false, true]) {
    test(`TableRuColumns: ${dynamic ? 'ordered dynamic' : 'static'} table`, async ({
        page,
        navigation,
    }, testInfo) => {
        test.slow();
        const path = navigation.register(
            `${E2E_DIR}/ru-columns-${testInfo.testId.slice(-12)}-${Date.now()}`,
        );
        const rows = Array.from({length: 10}, (_, index) => ({
            ...Object.fromEntries(
                columns.map((column, columnIndex) => [column, `значение-${index}-${columnIndex}`]),
            ),
            [columns[0]]: index < 4 ? 34421762 : index,
        }));

        await test.step('Prepare a table with Cyrillic columns and values', async () => {
            await ytApi.create({
                parameters: {
                    type: 'table',
                    path,
                    attributes: {
                        dynamic,
                        schema: columns.map((name, index) => ({
                            name,
                            type: index === 0 ? 'int64' : 'string',
                        })),
                    },
                },
            });
            if (dynamic) {
                await ytApi.mountTable({path});
                await expect.poll(() => ytApi.get({path: `${path}/@tablet_state`})).toBe('mounted');
                await ytApi.insertRows({
                    parameters: {
                        path,
                        input_format: {$value: 'json', $attributes: {encode_utf8: false}},
                    },
                    data: rows,
                });
            } else {
                await ytApi.writeTable({
                    parameters: {
                        path,
                        input_format: {$value: 'json', $attributes: {encode_utf8: false}},
                    },
                    data: rows,
                });
            }
        });

        await test.step('Check columns, values and row indices', async () => {
            await page.goto(makeClusterUrl(`navigation?path=${path}`));
            await expect(
                page.getByRole('cell', {name: '"Номер РК в Директе"', exact: true}),
            ).toHaveCount(2);
            await expect(page.getByRole('cell', {name: '34421762', exact: true})).toHaveCount(4);
            await expect(page.getByRole('cell', {name: '"значение-9-6"', exact: true})).toHaveCount(
                1,
            );
            await expect(page.getByRole('cell', {name: 'null', exact: true})).toHaveCount(0);
            await expect(page.getByRole('cell', {name: '#', exact: true})).toHaveCount(
                dynamic ? 0 : 2,
            );
            for (const name of ['$tablet_index', '$row_index']) {
                await expect(page.getByRole('cell', {name: `"${name}"`, exact: true})).toHaveCount(
                    dynamic ? 2 : 0,
                );
            }
            for (const name of columns) {
                await expect(page.getByRole('cell', {name: `"${name}"`, exact: true})).toHaveCount(
                    2,
                );
            }
        });
    });
}
