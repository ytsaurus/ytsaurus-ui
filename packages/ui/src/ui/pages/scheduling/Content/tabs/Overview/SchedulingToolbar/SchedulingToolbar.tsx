import cn from 'bem-cn-lite';
import React from 'react';

import {Label, SegmentedRadioGroup, Switch} from '@gravity-ui/uikit';

import {DialogWrapper} from '../../../../../../components/DialogWrapper/DialogWrapper';
import {ExpandButton} from '../../../../../../components/ExpandButton';
import {Toolbar} from '../../../../../../components/WithStickyToolbar/Toolbar/Toolbar';
import {setLoadAllOperations} from '../../../../../../store/actions/scheduling/expanded-pools';
import {
    schedulingChangeContentMode,
    schedulingClearOperationRef,
    schedulingSetShowAbsResources,
} from '../../../../../../store/actions/scheduling/scheduling';
import {schedulingSetAbcFilter} from '../../../../../../store/actions/scheduling/scheduling-ts';
import {useDispatch, useSelector} from '../../../../../../store/redux-hooks';
import {
    selectSchedulingAbcFilter,
    selectSchedulingOperationRefId,
} from '../../../../../../store/selectors/scheduling/attributes-to-filter';
import {selectExpandedPoolsLoadAll} from '../../../../../../store/selectors/scheduling/expanded-pools';
import {
    SCHEDULING_CONTENT_MODES,
    selectSchedulingContentMode,
    selectSchedulingShowAbsResources,
} from '../../../../../../store/selectors/scheduling/scheduling';

import {PoolsSuggest} from '../../../../PoolsSuggest/PoolsSuggest';
import UIFactory from '../../../../../../UIFactory';
import i18n from './i18n';

import './SchedulingToolbar.scss';

const block = cn('yt-scheduling-toolbar');

export function SchedulingToolbar() {
    const mode = useSelector(selectSchedulingContentMode);

    return (
        <Toolbar
            className={block()}
            itemsToWrap={[
                {node: <SchedulingContentMode />},
                {
                    node: <PoolsSuggest className={block('filter')} />,
                    width: 200,
                },
                {node: <SchedulingAbc />},
                ...(mode === 'summary' || mode === 'custom'
                    ? [{node: <SchedulingShowAbsResources />}]
                    : []),
                {node: <OperationRefBadge />},
            ]}
        />
    );
}

function OperationRefBadge() {
    const dispatch = useDispatch();
    const operationRefId = useSelector(selectSchedulingOperationRefId);

    if (!operationRefId) return null;

    return (
        <Label
            type="close"
            theme="info"
            onCloseClick={() => dispatch(schedulingClearOperationRef())}
        >
            {i18n('context_scroll-to-operation', {operationRefId})}
        </Label>
    );
}

function SchedulingContentMode() {
    const dispatch = useDispatch();
    const mode = useSelector(selectSchedulingContentMode);

    return (
        <SegmentedRadioGroup
            size="m"
            qa="scheduling:conftent:mode"
            value={mode}
            onUpdate={(v) => dispatch(schedulingChangeContentMode(v))}
            name="navigation-tablets-mode"
            options={SCHEDULING_CONTENT_MODES.map((value) => {
                return {value, content: i18n(`mode-value_${value}`)};
            })}
        />
    );
}

function SchedulingAbc() {
    const dispatch = useDispatch();
    const {slug} = useSelector(selectSchedulingAbcFilter) ?? {};

    return UIFactory.renderControlAbcService({
        className: block('abc-filter'),
        value: slug ? {slug} : undefined,
        onChange: (abcService) => {
            dispatch(schedulingSetAbcFilter(abcService));
        },
    });
}

export function SchedulingExpandAll() {
    const [showConfirmation, setShowConfirmation] = React.useState(false);

    const dispatch = useDispatch();
    const loadAll = useSelector(selectExpandedPoolsLoadAll);

    const confirmation = showConfirmation ? (
        <DialogWrapper open={true} onClose={() => {}}>
            <DialogWrapper.Header caption={i18n('title_expand-all-confirmation')} />
            <DialogWrapper.Body>
                {i18n('context_expand-all-warning')}
                <div>{i18n('confirm_expand-all')}</div>
            </DialogWrapper.Body>
            <DialogWrapper.Footer
                onClickButtonApply={() => {
                    setShowConfirmation(false);
                    dispatch(setLoadAllOperations(!loadAll));
                }}
                onClickButtonCancel={() => setShowConfirmation(false)}
                textButtonCancel={i18n('action_expand-all-no')}
                textButtonApply={i18n('action_expand-all-yes')}
            />
        </DialogWrapper>
    ) : null;

    return (
        <>
            <ExpandButton
                all
                expanded={loadAll}
                toggleExpanded={() => {
                    const newValue = !loadAll;
                    if (newValue) {
                        setShowConfirmation(true);
                    } else {
                        dispatch(setLoadAllOperations(newValue));
                    }
                }}
            />
            {confirmation}
        </>
    );
}

function SchedulingShowAbsResources() {
    const dispatch = useDispatch();
    const value = useSelector(selectSchedulingShowAbsResources);

    return (
        <Switch
            checked={value}
            onUpdate={(v) => {
                dispatch(schedulingSetShowAbsResources(v));
            }}
        >
            {i18n('action_show-abs-resources')}
        </Switch>
    );
}
