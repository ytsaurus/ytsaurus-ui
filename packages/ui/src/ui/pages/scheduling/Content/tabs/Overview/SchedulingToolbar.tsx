import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import {RadioButton} from '@gravity-ui/uikit';

import format from '../../../../../common/hammer/format';

import {DialogWrapper} from '../../../../../components/DialogWrapper/DialogWrapper';
import {ExpandButton} from '../../../../../components/ExpandButton';
import {Toolbar} from '../../../../../components/WithStickyToolbar/Toolbar/Toolbar';
import {setLoadAllOperations} from '../../../../../store/actions/scheduling/expanded-pools';
import {schedulingChangeContentMode} from '../../../../../store/actions/scheduling/scheduling';
import {schedulingSetAbcFilter} from '../../../../../store/actions/scheduling/scheduling-ts';
import {
    SCHEDULING_CONTENT_MODES,
    getSchedulingContentMode,
} from '../../../../../store/selectors/scheduling/scheduling';
import {getSchedulingAbcFilter} from '../../../../../store/selectors/scheduling/attributes-to-filter';
import {getExpandedPoolsLoadAll} from '../../../../../store/selectors/scheduling/expanded-pools';

import {PoolsSuggest} from '../../../../../pages/scheduling/PoolsSuggest/PoolsSuggest';

import UIFactory from '../../../../../UIFactory';

import './SchedulingToolbar.scss';

const block = cn('yt-scheduling-toolbar');

export function SchedulingToolbar() {
    return (
        <Toolbar
            className={block()}
            itemsToWrap={[
                {node: <SchedulingContentMode />},
                {
                    node: <PoolsSuggest className={block('filter')} />,
                    growable: true,
                    shrinkable: true,
                },
                {node: <SchedulingAbc />},
                {node: <SchedulingExpandAll />},
            ]}
        />
    );
}

function SchedulingContentMode() {
    const dispatch = useDispatch();
    const mode = useSelector(getSchedulingContentMode);

    return (
        <RadioButton
            size="m"
            value={mode}
            onUpdate={(v) => dispatch(schedulingChangeContentMode(v))}
            name="navigation-tablets-mode"
            options={SCHEDULING_CONTENT_MODES.map((value) => {
                return {value, content: format.ReadableField(value)};
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

function SchedulingExpandAll() {
    const [showConfirmation, setShowConfirmation] = React.useState(false);

    const dispatch = useDispatch();
    const loadAll = useSelector(getExpandedPoolsLoadAll);

    const confirmation = showConfirmation ? (
        <DialogWrapper open={true} onClose={() => {}}>
            <DialogWrapper.Header caption={'Confirmation of "Expand all"'} />
            <DialogWrapper.Body>
                To display the expanded tree it is required to load all running operations, it might
                be a reason of less responsiveness UI.
                <div>Are you sure you want to load all running operations?</div>
            </DialogWrapper.Body>
            <DialogWrapper.Footer
                onClickButtonApply={() => {
                    setShowConfirmation(false);
                    dispatch(setLoadAllOperations(!loadAll));
                }}
                onClickButtonCancel={() => setShowConfirmation(false)}
                textButtonCancel={'No'}
                textButtonApply={'Yes, please expand'}
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
