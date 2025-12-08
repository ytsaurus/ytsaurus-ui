import * as React from 'react';

import {
    type ControlGroupOption,
    SegmentedRadioGroup,
    SegmentedRadioGroupWidth,
} from '@gravity-ui/uikit';
import {NodeDetails, NodeProgress} from '../models/plan';
import cn from 'bem-cn-lite';

import NodeDetailsInfo from '../NodeDetailsInfo';
import NodeJobs from '../NodeJobs';
import {NodeSchemas} from '../NodeSchemas';
import NodeStages from '../NodeStages';
import {OperationSchemas, hasDetailsInfo, hasJobsInfo, hasStagesInfo} from '../utils';
import i18n from './i18n';

import '../OperationNodeInfo.scss';

const block = cn('operation-node-info');

export interface OperationNodeInfoProps {
    progress?: NodeProgress;
    details?: NodeDetails;
    schemas?: OperationSchemas;
    containerRef?: React.Ref<HTMLDivElement>;
    className?: string;
    radioWidth?: SegmentedRadioGroupWidth;
}

export default function OperationNodeInfo({
    progress,
    details,
    schemas,
    containerRef,
    radioWidth,
    className,
}: OperationNodeInfoProps) {
    const items: ControlGroupOption[] = [];
    if (hasStagesInfo(progress)) {
        items.push({value: 'stages', content: i18n('value_stages')});
    }
    if (hasDetailsInfo(details)) {
        items.push({value: 'details', content: i18n('value_details')});
    }
    if (hasJobsInfo(progress)) {
        items.push({value: 'jobs', content: i18n('value_jobs')});
    }
    if (schemas) {
        items.push({value: 'schemas', content: i18n('value_schemas')});
    }
    const [item, setItem] = React.useState(items[0]?.value);
    return (
        <div ref={containerRef} className={block(null, className)}>
            {items.length > 1 && (
                <SegmentedRadioGroup
                    className={block('selector')}
                    value={item}
                    options={items}
                    onUpdate={setItem}
                    width={radioWidth}
                />
            )}
            {item === 'stages' && <NodeStages {...progress} />}
            {item === 'details' && <NodeDetailsInfo {...details} />}
            {item === 'jobs' && <NodeJobs {...progress} />}
            {item === 'schemas' && schemas && (
                <NodeSchemas className={block('schema')} schemas={schemas} />
            )}
        </div>
    );
}
