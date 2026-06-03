import React from 'react';
import cn from 'bem-cn-lite';
import {useSelector} from '../../../../store/redux-hooks';

import i18n from './i18n';

import map_ from 'lodash/map';

import ypath from '../../../../common/thor/ypath';
import {CollapsibleSectionStateLess} from '../../../../components/CollapsibleSection/CollapsibleSection';
import {
    type OperationExperimentItem,
    selectOperationExperimentAssignments,
    selectOperationId,
} from '../../../../store/selectors/operations/operation';
import {ClickableText} from '../../../../components/ClickableText/ClickableText';
import {MetaTable} from '@ytsaurus/components';
import StarTrackLink from '../../../../components/StarTrackLink/StarTrackLink';
import {YsonWithScroll} from '../../../../components/Yson/YsonWithScroll';
import {getOperationExperimentsYsonSettings} from '../../../../store/selectors/thor/unipika';
import {UI_COLLAPSIBLE_SIZE} from '../../../../constants/global';
import {YsonDownloadButton} from '../../../../components/DownloadAttributesButton';

const block = cn('experiment-assignments');

export default React.memo(ExperimentAssignments);

const ExperimentsItem = React.memo(ExperimentAssignmentsItem);

function ExperimentAssignments({className}: {className: string}) {
    const items = useSelector(selectOperationExperimentAssignments);
    const operationId = useSelector(selectOperationId);
    const [collapsed, setCollapsed] = React.useState(true);

    const onToggleCollapse = React.useCallback(() => {
        setCollapsed(!collapsed);
    }, [collapsed, setCollapsed]);

    return !items?.length ? null : (
        <CollapsibleSectionStateLess
            className={block(null, className)}
            name={i18n('title_experiments')}
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
                            key: i18n('field_experiment'),
                            value: ypath.getValue(data, '/experiment'),
                        },
                        {
                            key: i18n('field_group'),
                            value: ypath.getValue(data, '/group'),
                        },
                    ],
                    [
                        {
                            key: i18n('field_ticket'),
                            value: <StarTrackLink id={ypath.getValue(data, '/ticket')} />,
                        },
                        {
                            key: i18n('field_dimension'),
                            value: ypath.getValue(data, '/dimension'),
                        },
                    ],
                    [
                        {
                            key: i18n('field_effect'),
                            value: (
                                <ClickableText onClick={toggleEffectVisibility}>
                                    {effectVisible ? i18n('action_hide') : i18n('action_show')}
                                </ClickableText>
                            ),
                        },
                    ],
                ]}
            />
            {effectVisible && (
                <YsonWithScroll
                    value={effect}
                    settings={settings}
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
