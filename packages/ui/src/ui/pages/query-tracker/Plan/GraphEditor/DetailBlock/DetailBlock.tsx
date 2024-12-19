import React, {FC, useMemo} from 'react';
import './DetailBlock.scss';
import cn from 'bem-cn-lite';
import {NodeTBlock} from '../canvas/NodeBlock';
import OperationNodeInfo from '../../OperationNodeInfo';
import {hasDetailsInfo, hasJobsInfo, hasStagesInfo} from '../../utils';
import {DetailBlockHeader} from './DetailBlockHeader';

const b = cn('yt-detail-block');

type Props = {
    block: NodeTBlock;
    showHeader?: boolean;
    showInfo?: boolean;
    className?: string;
};

export const DetailBlock: FC<Props> = ({block, showHeader, showInfo, className}) => {
    const {meta} = block;
    const {nodeProgress, details, schemas} = meta;

    const showNodeInfo = useMemo(() => {
        return (
            showInfo &&
            (schemas ||
                hasStagesInfo(nodeProgress) ||
                hasJobsInfo(nodeProgress) ||
                hasDetailsInfo(details))
        );
    }, [details, nodeProgress, schemas, showInfo]);

    if (!showNodeInfo && !showHeader) return null;

    return (
        <div className={b(null, className)}>
            {showHeader && <DetailBlockHeader block={block} />}
            {showNodeInfo && (
                <OperationNodeInfo
                    progress={nodeProgress || undefined}
                    schemas={schemas}
                    details={details}
                    radioWidth="max"
                    className={b('details', {'without-padding': !showHeader})}
                />
            )}
        </div>
    );
};
