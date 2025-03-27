import React, {FC} from 'react';
import {ChytInfo} from '../../../../store/reducers/chyt/list';
import './QueryCliqueItem.scss';
import cn from 'bem-cn-lite';
import {Flex, Label, Text} from '@gravity-ui/uikit';

const block = cn('query-clique-item');

type Props = {
    alias?: ChytInfo['alias'];
    id: ChytInfo['yt_operation_id'];
    active?: boolean;
    showStatus?: boolean;
};

export const QueryCliqueItem: FC<Props> = ({alias, id, active, showStatus}) => {
    const showInActiveLabel = !active && showStatus;
    return (
        <Flex direction="column" gap={1} className={block()}>
            <Flex alignItems="center" gap={2}>
                <div>{alias}</div>
                {showInActiveLabel && <Label theme="danger">inactive</Label>}
            </Flex>
            <Text color="secondary">{id}</Text>
        </Flex>
    );
};
