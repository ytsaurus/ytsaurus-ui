import React, {type FC, useMemo} from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import {OperationContent} from './OperationContent';
import {type QueriesNodeBlock} from '../QueriesNodeBlock';
import {OperationType} from '../enums';
import {DetailBlockTitle} from './DetailBlockTitle';

type Props = {
    block: QueriesNodeBlock;
};

export const DetailBlockHeader: FC<Props> = ({
    block: {
        meta: {icon, bottomText, nodeProgress, operationType},
        name,
    },
}) => {
    const isTable = operationType === OperationType.Table;

    const showContent = useMemo(() => {
        if (isTable) return Boolean(bottomText);
        return nodeProgress && nodeProgress.total;
    }, [bottomText, isTable, nodeProgress]);

    return (
        <Flex gap={2} direction="column">
            <DetailBlockTitle icon={icon} name={name} nodeProgress={nodeProgress} />
            {showContent && (
                <>
                    {isTable ? (
                        <Text variant="caption-2">{bottomText || ''}</Text>
                    ) : (
                        <OperationContent nodeProgress={nodeProgress} />
                    )}
                </>
            )}
        </Flex>
    );
};
