import React, {CSSProperties, FC, useMemo, useRef} from 'react';
import './DetailBlock.scss';
import cn from 'bem-cn-lite';
import {NodeBlock} from '../canvas/NodeBlock';
import OperationNodeInfo from '../../OperationNodeInfo';
import {hasDetailsInfo, hasJobsInfo, hasStagesInfo} from '../../utils';
import {DetailBlockHeader} from './DetailBlockHeader';
import {Graph} from '@gravity-ui/graph';

const b = cn('yt-detail-block');

type Props = {
    block: NodeBlock;
    graph: Graph;
    className?: string;
    style?: CSSProperties;
};

export const DetailBlock: FC<Props> = ({block, className, style}) => {
    const detailBlockRef = useRef<HTMLDivElement>(null);
    const {state} = block;
    const {nodeProgress, details, schemas} = state.meta;

    const showNodeInfo = useMemo(() => {
        return (
            schemas ||
            hasStagesInfo(nodeProgress) ||
            hasJobsInfo(nodeProgress) ||
            hasDetailsInfo(details)
        );
    }, [details, nodeProgress, schemas]);

    if (!showNodeInfo) return null;

    return (
        <div
            ref={detailBlockRef}
            className={b(null, className)}
            style={style}
            onWheel={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
        >
            <DetailBlockHeader block={state} />
            {showNodeInfo && (
                <OperationNodeInfo
                    progress={nodeProgress || undefined}
                    schemas={schemas}
                    details={details}
                    radioWidth="max"
                    className={b('details')}
                />
            )}
        </div>
    );
};
