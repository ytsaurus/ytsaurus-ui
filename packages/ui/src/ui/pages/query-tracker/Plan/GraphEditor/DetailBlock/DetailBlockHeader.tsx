import React, {FC, useMemo} from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import {OperationContent} from './OperationContent';
import {NodeTBlock} from '../canvas/NodeBlock';
import {GraphBlockType} from '../enums';
import {DetailBlockTitle} from './DetailBlockTitle';

type Props = {
    block: NodeTBlock;
};

export const DetailBlockHeader: FC<Props> = ({
    block: {
        meta: {icon, bottomText, nodeProgress},
        name,
        is,
    },
}) => {
    const isTable = is === GraphBlockType.Table;

    const showContent = useMemo(() => {
        if (isTable) return Boolean(bottomText);
        return nodeProgress && nodeProgress.total;
    }, [bottomText, isTable, nodeProgress]);

    return (
        <Flex gap={2} direction="column">
            <DetailBlockTitle icon={icon} name={name} />
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
