import {Checkbox} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React from 'react';

import {Tooltip} from '@ytsaurus/components';
import Button from '../../../../../components/Button/Button';
import {
    TIMELINE_RANGE_PICKER_SHORTCUTS,
    TimelinePicker,
    convertTimeToRequestParams,
    formatInterval,
} from '../../../../../components/common/Timeline';
import Icon from '../../../../../components/Icon/Icon';
import SimplePagination from '../../../../../components/Pagination/SimplePagination';
import Select from '../../../../../components/Select/Select';
import TextInputWithDebounce from '../../../../../components/TextInputWithDebounce/TextInputWithDebounce';
import {Toolbar} from '../../../../../components/WithStickyToolbar/Toolbar/Toolbar';
import {EMPTY_OBJECT} from '../../../../../constants/empty';
import {
    applyAccessLogFilters,
    setAccessLogFilters,
    setAccessLogFiltersPage,
} from '../../../../../store/actions/navigation/tabs/access-log/access-log';
import {
    type AccessLogFieldSelectorType,
    type AccessLogMethodType,
    type AccessLogScopeType,
    type AccessLogUserType,
    initialState,
} from '../../../../../store/reducers/navigation/tabs/access-log/access-log-filters';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {
    selectAccessLogAvailableTimeRange,
    selectAccessLogFilterDistinctBy,
    selectAccessLogFilterFieldSelector,
    selectAccessLogFilterMetadata,
    selectAccessLogFilterMethod,
    selectAccessLogFilterPagination,
    selectAccessLogFilterPathRegex,
    selectAccessLogFilterRecursive,
    selectAccessLogFilterScope,
    selectAccessLogFilterTime,
    selectAccessLogFilterUserRegex,
    selectAccessLogFilterUserType,
    selectAccessLogHasChangedFilters,
    selectAccessLogPagesCount,
} from '../../../../../store/selectors/navigation/tabs/access-log';
import {
    ACCESS_LOG_FIELD_SELECTOR_ITEMS,
    ACCESS_LOG_METHOD_ITEMS,
    ACCESS_LOG_SCOPE_ITEMS,
    ACCESS_LOG_USER_TYPE_ITEMS,
    accessLogFieldSelectorSelectionToValue,
    accessLogMethodSelectionToValue,
    accessLogScopeSelectionToValue,
    accessLogUserTypeSelectionToValue,
    valueToSelection,
} from '../../../../../utils/navigation/tabs/access-log';
import {AccessLogOpenQtButton} from '../AccessLogOpenQtButton/AccessLogOpenQtButton';
import './AccessLogFilters.scss';
import i18n from './i18n';

const block = cn('access-log-filters');

export default React.memo(AccessLogFilters);

function AccessLogFilters() {
    return (
        <React.Fragment>
            <Toolbar
                className={block()}
                itemsToWrap={[
                    {node: <AccessLogPagination />},
                    {node: <AccessLogTimeline />},
                    {node: <AccessLogFieldselector />},
                    {node: <AccessLogMetadata />},
                    {node: <AccessLogDistictBy />},
                    {node: <AccessLogOpenQtButton />},
                ]}
            />
            <Toolbar
                className={block()}
                itemsToWrap={[
                    {
                        node: <AccessLogPathRegexp />,
                        growable: true,
                        shrinkable: true,
                        wrapperClassName: block('path-regex'),
                    },
                    {
                        node: <AccessLogUserRegexp />,
                        wrapperClassName: block('user-regex'),
                    },
                    {
                        node: <AccessLogUserTypeFilter />,
                        wrapperClassName: block('user-type'),
                    },
                    {
                        node: <AccessLogScopeFilter />,
                        wrapperClassName: block('scope'),
                    },
                    {
                        node: <AccessLogMethod />,
                        wrapperClassName: block('method-group'),
                    },
                    {
                        node: <AccessLogRecursive />,
                    },
                    {node: <AccessLogApplyFilters />},
                ]}
            />
        </React.Fragment>
    );
}

function AccessLogRecursive() {
    const dispatch = useDispatch();
    const recursive = useSelector(selectAccessLogFilterRecursive);

    return (
        <Checkbox
            checked={recursive}
            onUpdate={(value) => {
                dispatch(setAccessLogFilters({recursive: value}));
            }}
        >
            {i18n('field_recursive')}
        </Checkbox>
    );
}

function AccessLogApplyFilters() {
    const dispatch = useDispatch();
    const hasChanges = useSelector(selectAccessLogHasChangedFilters);
    const handleApply = React.useCallback(() => {
        dispatch(applyAccessLogFilters());
    }, [dispatch]);
    return (
        <Button width="max" disabled={!hasChanges} view="action" onClick={handleApply}>
            {i18n('action_apply')}
        </Button>
    );
}

function AccessLogPagination() {
    const dispatch = useDispatch();

    const {index} = useSelector(selectAccessLogFilterPagination);
    const pageCount = useSelector(selectAccessLogPagesCount);

    const handleChange = React.useCallback(
        (value: number) => {
            dispatch(setAccessLogFiltersPage(value));
        },
        [dispatch],
    );

    return (
        <SimplePagination
            value={index}
            min={0}
            max={Math.max(0, pageCount - 1)}
            onChange={handleChange}
        />
    );
}

function AccessLogPathRegexp() {
    const dispatch = useDispatch();
    const filter = useSelector(selectAccessLogFilterPathRegex);

    const handleChange = React.useCallback(
        (path_regex: string) => {
            dispatch(setAccessLogFilters({path_regex}));
        },
        [dispatch],
    );

    return (
        <TextInputWithDebounce
            debounce={500}
            value={filter}
            placeholder={i18n('field_path-regexp')}
            onUpdate={handleChange}
        />
    );
}

function AccessLogUserRegexp() {
    const dispatch = useDispatch();
    const filter = useSelector(selectAccessLogFilterUserRegex);

    const handleChange = React.useCallback(
        (user_regex: string) => {
            dispatch(setAccessLogFilters({user_regex}));
        },
        [dispatch],
    );

    return (
        <TextInputWithDebounce
            debounce={500}
            value={filter}
            placeholder={i18n('field_user-regexp')}
            onUpdate={handleChange}
        />
    );
}

const METADATA_ITEMS = [
    {
        get text() {
            return i18n('value_only-attributes');
        },
        value: 'only_attrs',
    },
    {
        get text() {
            return i18n('value_skip-attributes');
        },
        value: 'skip_attrs',
    },
];

function AccessLogMetadata() {
    const dispatch = useDispatch();
    const value = useSelector(selectAccessLogFilterMetadata);
    const handleChange = React.useCallback(
        (v: string) => {
            const metadata = v ? v === 'only_attrs' : undefined;

            dispatch(setAccessLogFilters({metadata}));
        },
        [dispatch, value],
    );
    const valueStr = value === undefined ? '' : value ? 'only_attrs' : 'skip_attrs';
    return (
        <Select
            value={valueStr ? [valueStr] : undefined}
            items={METADATA_ITEMS}
            onUpdate={(vals) => handleChange(vals[0])}
            placeholder={i18n('field_attributes')}
        />
    );
}

const DISTINCT_BY_ITEMS = [
    {
        get text() {
            return i18n('value_by-user');
        },
        value: 'user',
    },
];
function AccessLogDistictBy() {
    const dispatch = useDispatch();
    const value = useSelector(selectAccessLogFilterDistinctBy);
    const handleChange = React.useCallback(
        (v: string) => {
            dispatch(setAccessLogFilters({distinct_by: v as 'user'}));
        },
        [dispatch],
    );

    return (
        <Select
            value={value ? [value] : undefined}
            items={DISTINCT_BY_ITEMS}
            onUpdate={(vals) => handleChange(vals[0])}
            placeholder={i18n('field_distinct')}
        />
    );
}

function AccessLogFieldselector() {
    const dispatch = useDispatch();
    const value = useSelector(selectAccessLogFilterFieldSelector);

    const selected = React.useMemo(() => {
        return valueToSelection(value);
    }, [value]);

    const handleUpdate = React.useCallback(
        (items: Array<string>) => {
            const field_selector = accessLogFieldSelectorSelectionToValue(
                items as Array<AccessLogFieldSelectorType>,
                initialState.field_selector,
            );
            dispatch(setAccessLogFilters({field_selector}));
        },
        [dispatch, value],
    );

    return (
        <Select
            items={ACCESS_LOG_FIELD_SELECTOR_ITEMS}
            value={selected}
            multiple
            onUpdate={handleUpdate}
            placeholder={i18n('field_columns')}
        />
    );
}

function AccessLogMethod() {
    const dispatch = useDispatch();
    const value = useSelector(selectAccessLogFilterMethod);

    const selected = React.useMemo(() => {
        return valueToSelection(value);
    }, [value]);

    const handleUpdate = React.useCallback(
        (items: Array<string>) => {
            const method_group = accessLogMethodSelectionToValue(
                items as Array<AccessLogMethodType>,
                EMPTY_OBJECT,
            );
            dispatch(setAccessLogFilters({method_group}));
        },
        [dispatch, value],
    );

    return (
        <Select
            multiple
            items={ACCESS_LOG_METHOD_ITEMS}
            value={selected}
            onUpdate={handleUpdate}
            placeholder={i18n('field_method-group-all')}
            width="max"
        />
    );
}

function AccessLogUserTypeFilter() {
    const dispatch = useDispatch();
    const value = useSelector(selectAccessLogFilterUserType);

    const selected = React.useMemo(() => {
        return valueToSelection(value);
    }, [value]);

    const handleUpdate = React.useCallback(
        (items: Array<string>) => {
            const user_type = accessLogUserTypeSelectionToValue(
                items as Array<AccessLogUserType>,
                EMPTY_OBJECT,
            );
            dispatch(setAccessLogFilters({user_type}));
        },
        [dispatch, value],
    );

    return (
        <Select
            multiple
            items={ACCESS_LOG_USER_TYPE_ITEMS}
            value={selected}
            onUpdate={handleUpdate}
            placeholder={i18n('field_user-type-all')}
            width="max"
            maxVisibleValues={2}
        />
    );
}

function AccessLogScopeFilter() {
    const dispatch = useDispatch();
    const value = useSelector(selectAccessLogFilterScope);

    const selected = React.useMemo(() => {
        return valueToSelection(value);
    }, [value]);

    const handleUpdate = React.useCallback(
        (items: Array<string>) => {
            const scope = accessLogScopeSelectionToValue(
                items as Array<AccessLogScopeType>,
                EMPTY_OBJECT,
            );
            dispatch(setAccessLogFilters({scope}));
        },
        [dispatch],
    );

    return (
        <Select
            multiple
            items={ACCESS_LOG_SCOPE_ITEMS}
            value={selected}
            onUpdate={handleUpdate}
            placeholder={i18n('field_scope-all')}
            width="max"
        />
    );
}

const TIMELINE_SHOURCUTS = [
    {
        title: '1d',
        time: '1d',
    },
    {
        title: '1w',
        time: '1w',
    },
    {
        title: '1M',
        time: '1M',
    },
    {
        time: 'custom',
    },
];

function AccessLogTimeline() {
    const dispatch = useDispatch();
    const updateTime = React.useCallback(
        (time: {from?: number; to?: number}) => {
            const {from, to} = time;
            dispatch(setAccessLogFilters({time: {from, to}}));
        },
        [dispatch],
    );

    const updateShortcut = React.useCallback(
        (shortcutValue: string) => {
            dispatch(setAccessLogFilters({time: {shortcutValue}}));
        },
        [dispatch],
    );

    const time = useSelector(selectAccessLogFilterTime);
    const now = Date.now();
    const {from = now - 24 * 12 * 1000, to = now} = convertTimeToRequestParams(time) || {};

    return (
        <React.Fragment>
            <TimelinePicker
                from={from || 0}
                to={to || 0}
                shortcut={time?.shortcutValue}
                onUpdate={updateTime}
                onShortcut={updateShortcut}
                topShortcuts={TIMELINE_SHOURCUTS}
                shortcuts={TIMELINE_RANGE_PICKER_SHORTCUTS}
                hasDatePicker
            />
            <AvailableTimeRange />
        </React.Fragment>
    );
}

function AvailableTimeRange() {
    const {earliest, latest} = useSelector(selectAccessLogAvailableTimeRange);
    const hidden = earliest === undefined || latest === undefined;

    return (
        <Tooltip
            className={block('available-range')}
            content={
                <React.Fragment>
                    {i18n('title_available-range')}{' '}
                    {hidden
                        ? i18n('context_wait-for-range')
                        : formatInterval((earliest ?? 0) * 1000, (latest ?? 0) * 1000)}
                </React.Fragment>
            }
        >
            <Icon awesome="question-circle" />
        </Tooltip>
    );
}
