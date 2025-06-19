import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import cn from 'bem-cn-lite';

import {Checkbox} from '@gravity-ui/uikit';

import Button from '../../../../components/Button/Button';
import Icon from '../../../../components/Icon/Icon';

import SimplePagination from '../../../../components/Pagination/SimplePagination';
import TextInputWithDebounce from '../../../../components/TextInputWithDebounce/TextInputWithDebounce';
import {Toolbar} from '../../../../components/WithStickyToolbar/Toolbar/Toolbar';
import Select from '../../../../components/Select/Select';

import {
    getAccessLogAvailableTimeRange,
    getAccessLogFilterDistinctBy,
    getAccessLogFilterFieldSelector,
    getAccessLogFilterMetadata,
    getAccessLogFilterMethod,
    getAccessLogFilterPagination,
    getAccessLogFilterPathRegex,
    getAccessLogFilterRecursive,
    getAccessLogFilterScope,
    getAccessLogFilterTime,
    getAccessLogFilterUserRegex,
    getAccessLogFilterUserType,
    getAccessLogHasChangedFilters,
    getAccessLogPagesCount,
} from '../../../../store/selectors/navigation/tabs/access-log';
import {
    applyAccessLogFilters,
    setAccessLogFilters,
    setAccessLogFiltersPage,
} from '../../../../store/actions/navigation/tabs/access-log/access-log';
import {
    AccessLogFieldSelectorType,
    AccessLogMethodType,
    AccessLogScopeType,
    AccessLogUserType,
    initialState,
} from '../../../../store/reducers/navigation/tabs/access-log/access-log-filters';

import './AccessLogFilters.scss';
import {
    TIMELINE_RANGE_PICKER_SHORTCUTS,
    TimelinePicker,
    convertTimeToRequestParams,
    formatInterval,
} from '../../../../components/common/Timeline';
import {EMPTY_OBJECT} from '../../../../constants/empty';
import {Tooltip} from '../../../../components/Tooltip/Tooltip';
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
} from '../../../../utils/navigation/tabs/access-log';
import {AccessLogOpenQtButton} from './AccessLogOpenQtButton';

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
    const recursive = useSelector(getAccessLogFilterRecursive);

    return (
        <Checkbox
            checked={recursive}
            onUpdate={(value) => {
                dispatch(setAccessLogFilters({recursive: value}));
            }}
        >
            Recursive
        </Checkbox>
    );
}

function AccessLogApplyFilters() {
    const dispatch = useDispatch();
    const hasChanges = useSelector(getAccessLogHasChangedFilters);
    const handleApply = React.useCallback(() => {
        dispatch(applyAccessLogFilters());
    }, [dispatch]);
    return (
        <Button width="max" disabled={!hasChanges} view="action" onClick={handleApply}>
            Apply
        </Button>
    );
}

function AccessLogPagination() {
    const dispatch = useDispatch();

    const {index} = useSelector(getAccessLogFilterPagination);
    const pageCount = useSelector(getAccessLogPagesCount);

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
    const filter = useSelector(getAccessLogFilterPathRegex);

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
            placeholder={'Path regexp...'}
            onUpdate={handleChange}
        />
    );
}

function AccessLogUserRegexp() {
    const dispatch = useDispatch();
    const filter = useSelector(getAccessLogFilterUserRegex);

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
            placeholder={'User regexp...'}
            onUpdate={handleChange}
        />
    );
}

const METADATA_ITEMS = [
    {
        text: 'Only attributes',
        value: 'only_attrs',
    },
    {
        text: 'Skip attributes',
        value: 'skip_attrs',
    },
];

function AccessLogMetadata() {
    const dispatch = useDispatch();
    const value = useSelector(getAccessLogFilterMetadata);
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
            placeholder={'Attributes'}
        />
    );
}

const DISTINCT_BY_ITEMS = [{text: 'By User', value: 'user'}];
function AccessLogDistictBy() {
    const dispatch = useDispatch();
    const value = useSelector(getAccessLogFilterDistinctBy);
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
            placeholder={'Distinct'}
        />
    );
}

function AccessLogFieldselector() {
    const dispatch = useDispatch();
    const value = useSelector(getAccessLogFilterFieldSelector);

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
            placeholder={'Columns'}
        />
    );
}

function AccessLogMethod() {
    const dispatch = useDispatch();
    const value = useSelector(getAccessLogFilterMethod);

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
            placeholder={'Method group: All'}
            width="max"
        />
    );
}

function AccessLogUserTypeFilter() {
    const dispatch = useDispatch();
    const value = useSelector(getAccessLogFilterUserType);

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
            placeholder={'User type: All'}
            width="max"
            maxVisibleValues={2}
        />
    );
}

function AccessLogScopeFilter() {
    const dispatch = useDispatch();
    const value = useSelector(getAccessLogFilterScope);

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
            placeholder={'Scope: All'}
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

    const time = useSelector(getAccessLogFilterTime);
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
    const {earliest, latest} = useSelector(getAccessLogAvailableTimeRange);
    const hidden = earliest === undefined || latest === undefined;

    return (
        <Tooltip
            className={block('available-range')}
            content={
                <React.Fragment>
                    Available range:{' '}
                    {hidden
                        ? 'Please wait until the range is loaded'
                        : formatInterval((earliest ?? 0) * 1000, (latest ?? 0) * 1000)}
                </React.Fragment>
            }
        >
            <Icon awesome="question-circle" />
        </Tooltip>
    );
}
