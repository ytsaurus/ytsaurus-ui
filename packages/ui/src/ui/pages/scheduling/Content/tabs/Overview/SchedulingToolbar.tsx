import cn from 'bem-cn-lite';
import React from 'react';

import {SegmentedRadioGroup, Switch} from '@gravity-ui/uikit';

import {DialogWrapper} from '../../../../../components/DialogWrapper/DialogWrapper';
import {ExpandButton} from '../../../../../components/ExpandButton';
import {Toolbar} from '../../../../../components/WithStickyToolbar/Toolbar/Toolbar';
import {setLoadAllOperations} from '../../../../../store/actions/scheduling/expanded-pools';
import {
    schedulingChangeContentMode,
    schedulingSetShowAbsResources,
} from '../../../../../store/actions/scheduling/scheduling';
import {schedulingSetAbcFilter} from '../../../../../store/actions/scheduling/scheduling-ts';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {getSchedulingAbcFilter} from '../../../../../store/selectors/scheduling/attributes-to-filter';
import {getExpandedPoolsLoadAll} from '../../../../../store/selectors/scheduling/expanded-pools';
import {
    SCHEDULING_CONTENT_MODES,
    getSchedulingContentMode,
    getSchedulingShowAbsResources,
} from '../../../../../store/selectors/scheduling/scheduling';

import {PoolsSuggest} from '../../../../../pages/scheduling/PoolsSuggest/PoolsSuggest';
import UIFactory from '../../../../../UIFactory';
import i18n from './i18n';

import './SchedulingToolbar.scss';

const block = cn('yt-scheduling-toolbar');

export function SchedulingToolbar() {
    const mode = useSelector(getSchedulingContentMode);

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
            ]}
        />
    );
}

function SchedulingContentMode() {
    const dispatch = useDispatch();
    const mode = useSelector(getSchedulingContentMode);

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
    const {slug} = useSelector(getSchedulingAbcFilter) ?? {};

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
    const loadAll = useSelector(getExpandedPoolsLoadAll);

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
    const value = useSelector(getSchedulingShowAbsResources);

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
