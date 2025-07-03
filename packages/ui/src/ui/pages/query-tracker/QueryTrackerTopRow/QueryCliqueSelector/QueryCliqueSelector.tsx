import React, {FC, useMemo} from 'react';
import {QueryCliqueItem} from './QueryCliqueItem';
import {QuerySelector} from '../QuerySelector';
import {Flex, Select} from '@gravity-ui/uikit';
import {ChytInfo} from '../../../../store/reducers/chyt/list';

type Props = {
    loading: boolean;
    cliqueList: ChytInfo[];
    value: string | undefined;
    placeholder?: string;
    onChange: (alias: string) => void;
    showStatus?: boolean;
};

export const QueryCliqueSelector: FC<Props> = ({
    cliqueList,
    value,
    placeholder = 'Clique alias',
    loading,
    showStatus,
    onChange,
}) => {
    const listItems = useMemo(() => {
        const tempArray = cliqueList.map(({alias, yt_operation_id, state, health}) => {
            return {
                alias,
                id: yt_operation_id,
                active: state === 'active' && health === 'good',
            };
        });

        return showStatus
            ? tempArray.sort((a, b) => Number(b.active) - Number(a.active))
            : tempArray;
    }, [cliqueList, showStatus]);

    return (
        <QuerySelector
            placeholder={placeholder}
            filterPlaceholder="Search"
            hasClear
            items={listItems}
            value={value}
            loading={loading}
            onChange={onChange}
            getOptionHeight={() => 58}
            disabled={loading && !listItems.length}
            renderEmptyOptions={() => <Flex justifyContent="center">No access clique</Flex>}
            popupWidth={285}
        >
            {(items) =>
                items.map(({alias, active, id}) => {
                    return (
                        <Select.Option key={alias} value={alias}>
                            <QueryCliqueItem
                                alias={alias}
                                id={id}
                                active={active}
                                showStatus={showStatus}
                            />
                        </Select.Option>
                    );
                })
            }
        </QuerySelector>
    );
};
