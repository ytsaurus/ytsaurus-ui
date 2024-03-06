import React, {FC} from 'react';
import {QueryCliqueItem} from './QueryCliqueItem';
import {QuerySelector} from '../QuerySelector';
import {Select} from '@gravity-ui/uikit';

type Props = {
    loading: boolean;
    cliqueList: {alias: string; yt_operation_id?: string}[];
    value: string | undefined;
    onChange: (alias: string) => void;
};

export const QueryCliqueSelector: FC<Props> = ({cliqueList, value, loading, onChange}) => {
    return (
        <QuerySelector
            placeholder="Clique alias"
            filterPlaceholder="Search"
            hasClear
            items={cliqueList}
            value={value}
            loading={loading}
            onChange={onChange}
            getOptionHeight={() => 52}
            disabled={!cliqueList.length}
        >
            {(items) =>
                items.map(({alias, yt_operation_id}) => (
                    <Select.Option key={alias} value={alias}>
                        <QueryCliqueItem name={alias} ytId={yt_operation_id} />
                    </Select.Option>
                ))
            }
        </QuerySelector>
    );
};
