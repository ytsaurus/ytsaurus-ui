import {Flex, Text as GravityText, Icon} from '@gravity-ui/uikit';
import {Yson} from '../../../internal/Yson';
import unipika from '../../../utils/unipika';
import BarsAscendingAlignLeftArrowUpIcon from '@gravity-ui/icons/svgs/bars-ascending-align-left-arrow-up.svg';
import BarsAscendingAlignLeftArrowDownIcon from '@gravity-ui/icons/svgs/bars-ascending-align-left-arrow-down.svg';
import {Column} from '@gravity-ui/react-data-table';
import type {NavigationTableSchema} from '../../../types';
import type {UnipikaSettings} from '../../../internal/Yson/StructuredYson/StructuredYsonTypes';

export const makeNavigationColumns = (
    ysonSettings: UnipikaSettings,
): Column<NavigationTableSchema>[] => {
    return [
        {
            name: 'name',
            header: 'Name',
            render: ({row}) => {
                return (
                    <Flex alignItems="center" gap={1}>
                        {Boolean(row.sort_order) && (
                            <Icon
                                data={
                                    row.sort_order === 'descending'
                                        ? BarsAscendingAlignLeftArrowUpIcon
                                        : BarsAscendingAlignLeftArrowDownIcon
                                }
                                size={16}
                            />
                        )}{' '}
                        <Yson
                            value={unipika.unescapeKeyValue(row.name)}
                            settings={{...ysonSettings, asHTML: false}}
                            inline
                        />
                    </Flex>
                );
            },
        },
        {
            name: 'type',
            header: 'Type v3',
            render: ({row}) => {
                return (
                    <>
                        <GravityText>{row.type}</GravityText>{' '}
                        {!row.required && <GravityText variant="caption-1">optional</GravityText>}
                    </>
                );
            },
        },
    ];
};
