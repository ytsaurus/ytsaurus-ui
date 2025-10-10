import React from 'react';
import cn from 'bem-cn-lite';
import {useSelector} from '../../../../store/redux-hooks';

import map_ from 'lodash/map';

import ypath from '../../../../common/thor/ypath';
import {CollapsibleSectionStateLess} from '../../../../components/CollapsibleSection/CollapsibleSection';
import {
    OperationExperimentItem,
    getOperationExperimentAssignments,
    getOperationId,
} from '../../../../store/selectors/operations/operation';
import {ClickableText} from '../../../../components/ClickableText/ClickableText';
import MetaTable from '../../../../components/MetaTable/MetaTable';
import StarTrackLink from '../../../../components/StarTrackLink/StarTrackLink';
import Yson from '../../../../components/Yson/Yson';
import {getOperationExperimentsYsonSettings} from '../../../../store/selectors/thor/unipika';
import {UI_COLLAPSIBLE_SIZE} from '../../../../constants/global';
import {YsonDownloadButton} from '../../../../components/DownloadAttributesButton';

const block = cn('experiment-assignments');

export default React.memo(ExperimentAssignments);

const ExperimentsItem = React.memo(ExperimentAssignmentsItem);

function ExperimentAssignments({className}: {className: string}) {
    const items = useSelector(getOperationExperimentAssignments);
    const operationId = useSelector(getOperationId);
    const [collapsed, setCollapsed] = React.useState(true);

    const onToggleCollapse = React.useCallback(() => {
        setCollapsed(!collapsed);
    }, [collapsed, setCollapsed]);

    return !items?.length ? null : (
        <CollapsibleSectionStateLess
            className={block(null, className)}
            name="Experiments"
            onToggle={onToggleCollapse}
            collapsed={collapsed}
            size={UI_COLLAPSIBLE_SIZE}
            marginDirection="bottom"
        >
            {map_(items, (item, index) => (
                <ExperimentsItem key={index} data={item} operationId={operationId} />
            ))}
        </CollapsibleSectionStateLess>
    );
}

interface ItemProps {
    data: OperationExperimentItem;
    operationId: string;
}

function ExperimentAssignmentsItem(props: ItemProps) {
    const {data, operationId} = props;
    const [effectVisible, setEffectVisibility] = React.useState(false);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {fraction: _fr, ...effect} = ypath.getValue(data, '/effect');

    const settings = useSelector(getOperationExperimentsYsonSettings);

    const toggleEffectVisibility = React.useCallback(() => {
        setEffectVisibility(!effectVisible);
        window.dispatchEvent(new Event('resize'));
    }, [effectVisible, setEffectVisibility]);

    return (
        <div>
            <MetaTable
                items={[
                    [
                        {
                            key: 'Experiment',
                            value: ypath.getValue(data, '/experiment'),
                        },
                        {
                            key: 'Group',
                            value: ypath.getValue(data, '/group'),
                        },
                    ],
                    [
                        {
                            key: 'Ticket',
                            value: <StarTrackLink id={ypath.getValue(data, '/ticket')} />,
                        },
                        {
                            key: 'Dimension',
                            value: ypath.getValue(data, '/dimension'),
                        },
                    ],
                    [
                        {
                            key: 'Effect',
                            value: (
                                <ClickableText onClick={toggleEffectVisibility}>
                                    {effectVisible ? 'Hide' : 'Show'}
                                </ClickableText>
                            ),
                        },
                    ],
                ]}
            />
            {effectVisible && (
                <Yson
                    value={effect}
                    settings={settings}
                    folding
                    virtualized
                    extraTools={
                        <YsonDownloadButton
                            value={effect}
                            settings={settings}
                            name={`experiment_assignments_${operationId}`}
                        />
                    }
                />
            )}
        </div>
    );
}
