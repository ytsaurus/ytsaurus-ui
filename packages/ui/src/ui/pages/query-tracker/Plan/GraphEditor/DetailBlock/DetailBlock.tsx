import React, {CSSProperties, FC, useMemo} from 'react';
import './DetailBlock.scss';
import cn from 'bem-cn-lite';
import {NodeTBlock} from '../canvas/NodeBlock';
import {GRAPH_COLORS} from '../constants';
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

    const style = useMemo((): CSSProperties | undefined => {
        if (!nodeProgress || !nodeProgress.state) return undefined;

        const percent =
            nodeProgress.state === 'Finished'
                ? 100 // node may not have a job
                : ((nodeProgress.completed || 0) / (nodeProgress.total || 1)) * 100;

        return {
            background: `linear-gradient(to right, ${GRAPH_COLORS.progressColor} ${percent}%, #fff ${percent}%)`,
        };
    }, [nodeProgress]);

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
        <div className={b(null, className)} style={style}>
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
