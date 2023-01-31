import React from 'react';
import cn from 'bem-cn-lite';
import _ from 'lodash';

// @ts-ignore
import unipika from '@gravity-ui/unipika/lib/unipika';

import {Settings, UnipikaValue} from '../StructuredYson/StructuredYsonTypes';
import {
    BlockType,
    CollapsedState,
    flattenUnipika,
    FlattenUnipikaResult,
    SearchInfo,
    UnipikaFlattenTreeItem,
} from '../StructuredYson/flattenUnipika';
import DataTableYT, {DATA_TABLE_YT_SETTINGS} from '../../DataTableYT/DataTableYT';
import * as DT100 from '@yandex-cloud/react-data-table';
import WithStickyToolbar from '../../../components/WithStickyToolbar/WithStickyToolbar';

import './StructuredYsonVirtualized.scss';
import {Toolbar} from '../../WithStickyToolbar/Toolbar/Toolbar';
import Icon from '../../Icon/Icon';
import Filter from '../../Filter/Filter';
import {MultiHighlightedText} from '../../HighlightedText/HighlightedText';
import Link from '../../Link/Link';
import {Dialog, Button} from '@gravity-ui/uikit';
const block = cn('structured-yson-virtualized');

interface Props {
    value: UnipikaValue;
    settings: Settings;
    extraTools?: React.ReactNode;
}

interface State {
    flattenResult: FlattenUnipikaResult;
    value: Props['value'];
    settings: Props['settings'];
    yson: boolean;
    collapsedState: CollapsedState;
    filter: string;
    matchIndex: number;
    matchedRows: Array<number>;
    fullValue?: {
        value: UnipikaFlattenTreeItem['value'];
        searchInfo?: SearchInfo;
    };
}

const SETTINGS: DT100.Settings = {
    ...DATA_TABLE_YT_SETTINGS,
    stickyHead: undefined,
    stickyBottom: undefined,
};

function calculateState(
    value: State['value'],
    collapsedState: CollapsedState,
    filter: string,
    settings: Settings,
) {
    const flattenResult = flattenUnipika(value, {
        isJson: settings.format !== 'yson',
        collapsedState: collapsedState,
        filter,
        settings: settings,
    });

    return Object.assign(
        {},
        {
            flattenResult,
            matchedRows: Object.keys(flattenResult.searchIndex).map(Number),
        },
    );
}

export default class StructuredYsonVirtualized extends React.PureComponent<Props, State> {
    static getDerivedStateFromProps(props: Props, state: State) {
        const {value: prevValue, settings: prevSettings, yson: prevYson} = state;
        const {value, settings} = props;
        const res: Partial<State> = {};
        const yson = settings.format === 'yson';
        if (prevSettings !== settings || yson !== prevYson) {
            Object.assign<Partial<State>, Partial<State>>(res, {
                settings,
                yson,
            });
        }
        if (prevValue !== value || !_.isEmpty(res)) {
            Object.assign<Partial<State>, Partial<State>>(res, {
                value,
                ...calculateState(value, state.collapsedState, state.filter, settings),
            });
        }
        return _.isEmpty(res) ? null : res;
    }

    state: State = {
        value: {} as any, // valid value will be provided from getDerivedStateFromProps call
        flattenResult: {data: [], searchIndex: {}},
        settings: {},
        yson: true,
        collapsedState: {},

        filter: '',
        matchIndex: -1,
        matchedRows: [],
    };

    settings: DT100.Settings;

    dataTable = React.createRef<DT100.DynamicInnerRefT>();
    searchRef = React.createRef<Filter>();

    constructor(props: Props) {
        super(props);

        this.settings = {
            ...SETTINGS,
            dynamicInnerRef: this.dataTable,
        };
    }

    renderCell = ({row, index}: {row: UnipikaFlattenTreeItem; index: number}) => {
        const {
            yson,
            settings,
            filter,
            flattenResult: {searchIndex},
        } = this.state;
        return (
            <Cell
                matched={searchIndex[index]}
                row={row}
                yson={yson}
                settings={settings}
                onToggleCollapse={this.onTogglePathCollapse}
                filter={filter}
                showFullText={this.onShowFullText}
                index={index}
            />
        );
    };

    onTogglePathCollapse = (path: string) => {
        const {collapsedState: oldState} = this.state;
        const collapsedState = {...oldState};
        if (collapsedState[path]) {
            delete collapsedState[path];
        } else {
            collapsedState[path] = true;
        }

        this.updateState({collapsedState});
    };

    updateState(
        changedState: Partial<Pick<State, 'collapsedState' | 'filter' | 'matchIndex'>>,
        cb?: () => void,
    ) {
        const {value, settings} = this.state;
        const {
            collapsedState = this.state.collapsedState,
            matchIndex = this.state.matchIndex,
            filter = this.state.filter,
        } = changedState;

        this.setState(
            {
                collapsedState,
                filter,
                matchIndex,
                ...calculateState(value, collapsedState, filter, settings),
            },
            cb,
        );
    }

    renderTable() {
        const columns: Array<DT100.Column<UnipikaFlattenTreeItem>> = [
            {
                name: 'content',
                render: this.renderCell,
                header: null,
            },
        ];

        const {
            flattenResult: {data},
        } = this.state;

        return (
            <div className={block('content')}>
                <DataTableYT
                    columns={columns}
                    data={data}
                    theme={'yson'}
                    settings={this.settings}
                />
            </div>
        );
    }

    onExpandAll = () => {
        this.updateState({collapsedState: {}}, () => {
            this.onNextMatch(null, 0);
        });
    };

    onCollapseAll = () => {
        const {value, yson} = this.state;
        const {data} = flattenUnipika(value, {isJson: !yson});
        const collapsedState = _.reduce(
            data,
            (acc, {path}) => {
                if (path) {
                    acc[path] = true;
                }
                return acc;
            },
            {} as CollapsedState,
        );
        this.updateState({collapsedState});
    };

    onFilterChange = (filter: string) => {
        this.updateState({filter, matchIndex: 0}, () => {
            this.onNextMatch(null, 0);
        });
    };

    onNextMatch = (_event: unknown, diff = 1) => {
        const {matchIndex, matchedRows} = this.state;
        if (_.isEmpty(matchedRows)) {
            return;
        }

        let index = (matchIndex + diff) % matchedRows.length;
        if (index < 0) {
            index = matchedRows.length + index;
        }

        if (index !== matchIndex) {
            this.setState({matchIndex: index});
        }
        this.dataTable.current?.scrollTo(matchedRows[index] - 6);
        this.searchRef.current?.focus();
    };

    onPrevMatch = () => {
        this.onNextMatch(null, -1);
    };

    onEnterKeyDown = (_value: string, e: React.KeyboardEvent) => {
        if (e.shiftKey || e.ctrlKey) {
            this.onPrevMatch();
        } else {
            this.onNextMatch(null);
        }
    };

    renderToolbar() {
        return (
            <Toolbar
                className={block('toolbar')}
                itemsToWrap={[
                    {
                        name: 'buttons',
                        node: (
                            <span className={block('buttons')}>
                                <Button title="Expand all" onClick={this.onExpandAll}>
                                    <Icon awesome="arrow-to-bottom" />
                                </Button>
                                &nbsp;&nbsp;
                                <Button onClick={this.onCollapseAll} title="Collapse all">
                                    <Icon awesome="arrow-to-top" />
                                </Button>
                            </span>
                        ),
                    },
                    {
                        name: 'filter',
                        node: this.renderFilter(),
                    },
                    {
                        name: 'extra-tools',
                        node: !this.props.extraTools ? null : (
                            <span className={block('extra-tools')}>{this.props.extraTools}</span>
                        ),
                    },
                ]}
            />
        );
    }

    renderFilter() {
        const {matchIndex, matchedRows} = this.state;
        const count = matchedRows.length;
        const matchPosition = count ? 1 + (matchIndex % count) : 0;
        return (
            <React.Fragment>
                <Filter
                    ref={this.searchRef}
                    className={block('filter')}
                    hasClear
                    size="m"
                    type="text"
                    value={this.state.filter}
                    placeholder="Search..."
                    onChange={this.onFilterChange}
                    autofocus={false}
                    debounce={400}
                    onEnterKeyDown={this.onEnterKeyDown}
                    skipBlurByEnter
                />
                <Button
                    className={block('match-btn')}
                    view="flat-secondary"
                    title="Next"
                    onClick={this.onNextMatch}
                    disabled={!count}
                    pin={'clear-clear'}
                >
                    <Icon awesome="chevron-down" />
                </Button>
                <Button
                    className={block('match-btn')}
                    view="flat-secondary"
                    title="Back"
                    onClick={this.onPrevMatch}
                    disabled={!count}
                    pin={'brick-brick'}
                >
                    <Icon awesome="chevron-up" />
                </Button>
                <span className={block('match-counter')} title={'Matched rows'}>
                    {matchPosition} / {count || 0}
                </span>
            </React.Fragment>
        );
    }

    onShowFullText = (index: number) => {
        const {
            flattenResult: {searchIndex, data},
        } = this.state;
        this.setState({
            fullValue: {
                value: data[index].value,
                searchInfo: searchIndex[index],
            },
        });
    };

    onHideFullValue = () => {
        this.setState({fullValue: undefined});
    };

    renderFullValueModal() {
        const {fullValue: {value, searchInfo} = {}, settings, filter} = this.state;

        const tmp = unipika.format(value, {...settings, asHTML: false});

        return (
            value && (
                <Dialog open={true} onClose={this.onHideFullValue}>
                    <Dialog.Header caption={'Full value'} />
                    <Dialog.Divider />
                    <Dialog.Body>
                        <div className={block('full-value')}>
                            <MultiHighlightedText
                                className={block('filtered')}
                                starts={searchInfo?.valueMatch || []}
                                text={tmp.substring(1, tmp.length - 1)}
                                length={filter.length}
                            />
                        </div>
                    </Dialog.Body>
                </Dialog>
            )
        );
    }

    render() {
        return (
            <React.Fragment>
                <WithStickyToolbar
                    className={block()}
                    toolbar={this.renderToolbar()}
                    content={this.renderTable()}
                />
                {this.renderFullValueModal()}
            </React.Fragment>
        );
    }
}

const OFFSETS_BY_LEVEL: {[key: number]: React.ReactNode} = {};

function getLevelOffsetSpaces(level: number) {
    let res = OFFSETS_BY_LEVEL[level];
    if (!res) {
        const __html = _.fill(Array(level * 4), '&nbsp;').join('');
        res = OFFSETS_BY_LEVEL[level] = <span dangerouslySetInnerHTML={{__html}} />;
    }
    return res;
}

interface CellProps {
    matched: SearchInfo;
    row: UnipikaFlattenTreeItem;
    yson: boolean;
    settings: Settings;
    collapsedState?: {readonly [key: string]: boolean};
    onToggleCollapse: (path: string) => void;
    filter?: string;
    index: number;
    showFullText: (index: number) => void;
}

const JSON_VALUE_KEY = {
    $key: true as true,
    $special_key: true,
    $value: '$value',
    $type: 'string' as 'string',
    $decoded_value: '$value',
};
const JSON_ATTRIBUTES_KEY = {
    $key: true as true,
    $special_key: true,
    $value: '$attributes',
    $type: 'string' as 'string',
    $decoded_value: '$attributes',
};

function Cell(props: CellProps) {
    const {
        row: {level, open, close, key, value, hasDelimiter, path, collapsed, isAfterAttributes},
        settings,
        yson,
        onToggleCollapse,
        matched,
        filter,
        showFullText,
        index,
    } = props;

    const handleToggleCollapse = React.useCallback(() => {
        if (!path) {
            return;
        }
        onToggleCollapse(path);
    }, [path, onToggleCollapse]);

    const handleShowFullText = React.useCallback(() => {
        showFullText(index);
    }, [showFullText, index]);

    return (
        <div className={block('cell', 'unipika')}>
            {getLevelOffsetSpaces(level)}
            {path && (
                <ToggleCollapseButton
                    collapsed={collapsed}
                    path={path}
                    onToggle={handleToggleCollapse}
                />
            )}
            <Key
                text={key}
                settings={settings}
                yson={yson}
                matched={matched?.keyMatch}
                filter={filter}
                isAfterAttributes={isAfterAttributes}
            />
            {open && <OpenClose type={open} yson={yson} settings={settings} />}
            {value !== undefined && (
                <Value
                    text={value}
                    settings={settings}
                    yson={yson}
                    matched={matched?.valueMatch}
                    filter={filter}
                    showFullText={handleShowFullText}
                />
            )}
            {collapsed && <span className={'unipika'}>...</span>}
            {close && <OpenClose type={close} yson={yson} settings={settings} close />}
            {hasDelimiter && <SlaveText text={yson ? ';' : ','} />}
        </div>
    );
}

interface KeyProps {
    text: UnipikaFlattenTreeItem['key'] | UnipikaFlattenTreeItem['value'];
    yson?: boolean;
    settings: Settings;
    isAfterAttributes?: boolean;
    filter?: string;
    matched?: Array<number>;
}

function Key(props: KeyProps) {
    const {yson} = props;
    const text: React.ReactNode = renderKeyWithFilter(props);
    return !text ? null : (
        <React.Fragment>
            {text}
            <SlaveText text={yson ? ' = ' : ': '} />
        </React.Fragment>
    );
}

interface ValueProps extends KeyProps {
    showFullText?: () => void;
}

function Value(props: ValueProps) {
    return <>{renderValueWithFilter(props, block('value', {type: props.text?.$type}))}</>;
}

function renderValueWithFilter(props: ValueProps, className: string) {
    if ('string' === props.text?.$type) {
        return renderStringWithFilter(props, className, 100);
    }
    return renderWithFilter(props, block('value'));
}

function renderStringWithFilter(props: ValueProps, className: string, maxWidth = Infinity) {
    const {text, settings, matched = [], filter, showFullText} = props;
    const tmp = unipika.format(text, {...settings, asHTML: false});
    const visible = tmp.substr(1, Math.min(tmp.length - 2, maxWidth));
    const truncated = visible.length < tmp.length - 2;
    let hasHiddenMatch = false;
    if (truncated) {
        for (let i = matched.length - 1; i >= 0; --i) {
            if (visible.length < matched[i] + (filter?.length || 0)) {
                hasHiddenMatch = true;
                break;
            }
        }
    }
    return (
        <span>
            &quot;
            <MultiHighlightedText
                className={className + ' ' + block('filtered')}
                text={visible}
                starts={matched}
                length={filter?.length}
            />
            {truncated && (
                <Link
                    className={block('filtered', {
                        highlighted: hasHiddenMatch,
                    })}
                    onClick={showFullText}
                >
                    {'\u2026'}
                    <Icon awesome={'external-link'} />
                </Link>
            )}
            &quot;
        </span>
    );
}

function renderKeyWithFilter(props: KeyProps) {
    const {yson, isAfterAttributes, settings} = props;
    if (!yson && isAfterAttributes) {
        return formatValue(JSON_VALUE_KEY, settings);
    }

    if (!props?.text) {
        return null;
    }
    return renderStringWithFilter(props, block('key'));
}

function renderWithFilter(props: KeyProps, className: string) {
    const {text, filter, yson, isAfterAttributes, settings, matched} = props;
    let res: React.ReactNode = null;
    if (matched && filter) {
        const tmp = unipika.format(text, {...settings, asHTML: false});
        res = (
            <MultiHighlightedText
                className={className + ' ' + block('filtered')}
                text={tmp}
                starts={matched}
                length={filter?.length}
            />
        );
    } else {
        res = text
            ? formatValue(text, settings)
            : !yson && isAfterAttributes && formatValue(JSON_VALUE_KEY, settings);
    }
    return res ? res : null;
}

function SlaveText({text}: {text: string}) {
    return <span className={''}>{text}</span>;
}

function OpenClose(props: {
    type: BlockType;
    yson: boolean;
    close?: boolean;
    settings: Props['settings'];
}) {
    const {type, yson, close, settings} = props;
    switch (type) {
        case 'array':
            return <SlaveText text={close ? ']' : '['} />;
        case 'object':
            return <SlaveText text={close ? '}' : '{'} />;
        case 'attributes':
            if (yson) {
                return <SlaveText text={close ? '>' : '<'} />;
            } else {
                return (
                    <React.Fragment>
                        {close ? (
                            <SlaveText text={'}'} />
                        ) : (
                            <React.Fragment>
                                <Key text={JSON_ATTRIBUTES_KEY} settings={settings} />
                                <SlaveText text={'{'} />
                            </React.Fragment>
                        )}
                    </React.Fragment>
                );
            }
        case 'attributes-value':
            return <SlaveText text={close ? '}' : '{'} />;
    }
}

interface ToggleCollapseProps {
    collapsed?: boolean;
    path?: UnipikaFlattenTreeItem['path'];
    onToggle: () => void;
}

function ToggleCollapseButton(props: ToggleCollapseProps) {
    const {collapsed, onToggle, path} = props;
    return (
        <span title={path} className={block('collapsed')}>
            <Button onClick={onToggle} view="flat-secondary" size={'s'}>
                <span className={'unipika'}>{collapsed ? '[+]' : '[-]'}</span>
            </Button>
        </span>
    );
}

function formatValue(
    value: UnipikaFlattenTreeItem['key'] | UnipikaFlattenTreeItem['value'],
    settings: Settings,
) {
    const __html = unipika.formatValue(value, settings, 0);
    return <span className={'unipika'} dangerouslySetInnerHTML={{__html}} />;
}
