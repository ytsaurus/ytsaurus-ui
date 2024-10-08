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
    showHeader?: boolean;
    showInfo?: boolean;
    className?: string;
    style?: CSSProperties;
};

export const DetailBlock: FC<Props> = ({block, showHeader, showInfo, className, style}) => {
    const detailBlockRef = useRef<HTMLDivElement>(null);
    const {state} = block;
    const {nodeProgress, details, schemas} = state.meta;

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
        <div
            ref={detailBlockRef}
            className={b(null, className)}
            style={style}
            onWheel={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
        >
            {showHeader && <DetailBlockHeader block={state} />}
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
