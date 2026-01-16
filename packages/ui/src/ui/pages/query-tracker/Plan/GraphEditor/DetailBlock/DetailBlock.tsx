import React, {CSSProperties, FC, useMemo, useRef} from 'react';
import './DetailBlock.scss';
import cn from 'bem-cn-lite';
import {QueriesNodeBlock} from '../QueriesNodeBlock';
import OperationNodeInfo from '../../OperationNodeInfo';
import {hasDetailsInfo, hasJobsInfo, hasStagesInfo} from '../../utils';
import {DetailBlockHeader} from './DetailBlockHeader';

const b = cn('yt-detail-block');

type Props = {
    data: QueriesNodeBlock;
    className?: string;
    style?: CSSProperties;
};

export const DetailBlock: FC<Props> = ({data, className, style}) => {
    const detailBlockRef = useRef<HTMLDivElement>(null);
    const {nodeProgress, details, schemas} = data.meta;

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
            <DetailBlockHeader block={data} />
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
