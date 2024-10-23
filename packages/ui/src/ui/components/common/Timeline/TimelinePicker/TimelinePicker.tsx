import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';
import {Button, ButtonProps, Icon, Popup} from '@gravity-ui/uikit';

import noop_ from 'lodash/noop';
import moment, {MomentInput} from 'moment';
import i18n from '../i18n';
import {formatInterval, formatTimeCanonical, getTimestampFromDate, humanizeInterval} from '../util';

import {EnterInput} from '../../EnterInput/EnterInput';
import {TimelineDatepicker} from './TimelineDatepicker';
import iconCalendar from '../../../../assets/img/svg/calendar.svg';

import './TimelinePicker.scss';

const b = cn('yc-timeline-picker');
const SHORTCUT_CUSTOM = 'custom';

interface TimeHotButtonProps extends Pick<ButtonProps, 'size' | 'width'> {
    className?: string;
    title?: React.ReactNode;

    checked?: boolean;
    time?: string;
    onClick(v?: string): void;
}

class TimeHotButton extends React.Component<TimeHotButtonProps> {
    static propTypes = {
        size: PropTypes.string,
        width: PropTypes.string,
        className: PropTypes.string,
        title: PropTypes.string,
        time: PropTypes.string,
        checked: PropTypes.bool,
        onClick: PropTypes.func,
    };
    static defaultProps = {
        size: 'l',
    };
    onClick = () => {
        this.props.onClick(this.props.time);
    };
    render() {
        const {size, width, title, className, checked} = this.props;
        return (
            <Button
                view={checked ? 'normal' : 'flat-secondary'}
                size={size}
                width={width}
                onClick={this.onClick}
                className={className}
            >
                {title}
            </Button>
        );
    }
}

const formatInputTime = (from?: MomentInput, to?: MomentInput) =>
    `${formatTimeCanonical(from)} - ${formatTimeCanonical(to)}`;

interface TimelinePickerProps {
    className?: string;

    from: number;
    to: number;

    onUpdate: (value: Pick<TimelinePickerProps, 'from' | 'to'>) => void;
    hasDatePicker?: boolean;

    onShortcut: (shortcut: string, title: string) => void;

    shortcut?: string;
    topShortcuts?: Array<ShorcutItem>;
    shortcuts?: Array<Array<ShorcutItem>>;
}

interface ShorcutItem {
    title?: string;
    time: string;
}

interface State {
    from: number;
    to: number;
    prevFrom?: number;
    prevTo?: number;
    opened?: boolean;
    customInput?: boolean;

    datetime?: string;
}

export class TimelinePicker extends React.Component<TimelinePickerProps, State> {
    static propTypes = {
        from: PropTypes.number,
        to: PropTypes.number,
        shortcut: PropTypes.string,
        onUpdate: PropTypes.func.isRequired,
        onShortcut: PropTypes.func,
        hasDatePicker: PropTypes.bool,
        topShortcuts: PropTypes.array,
        shortcuts: PropTypes.array,
    };
    static defaultProps = {
        shortcuts: [],
        topShortcuts: [],
    };
    static getDerivedStateFromProps(props: TimelinePickerProps, state: State) {
        const {from, to} = props;
        if (state.prevFrom === from && state.prevTo === to) {
            return state;
        } else {
            return {
                from: from,
                to: to,
                prevFrom: from,
                prevTo: to,
                datetime: formatInputTime(from, to),
            };
        }
    }
    state: State = {} as any;
    _datepickerRef = React.createRef<HTMLDivElement>();
    _inputRef = React.createRef<EnterInput>();

    componentDidUpdate() {
        if (this.state.opened && this._inputRef.current) {
            this._inputRef.current?.focus();
        }
    }
    onCustomClick = () => {
        this.setState({customInput: true});
    };
    onCustomCancel = () => {
        this.setState({customInput: false});
    };
    onCustomDone = (value: string) => {
        this.setState({customInput: false});
        this.props.onShortcut?.(value, SHORTCUT_CUSTOM);
    };
    onOpenPickerClick = () => {
        this.setState({opened: true});
    };
    onPopupClose = (event: MouseEvent | KeyboardEvent) => {
        const inside = Boolean((event.target as Element)?.closest('.yc-datepicker-body'));
        if (!inside) {
            this.setState({opened: false});
            this.props.onUpdate({
                from: new Date(this.state.from).valueOf(),
                to: new Date(this.state.to).valueOf(),
            });
        }
    };
    onInputChange = (value: string) => {
        this.setState({datetime: value});
    };
    onInputDone = (value: string) => {
        const re =
            /(?:(\d{4}-\d{2}-\d{2})(?:[ T]?(\d{2}:\d{2}))?)\s*-\s*(?:(\d{4}-\d{2}-\d{2})?[ T]?(\d{2}:\d{2})?)/;
        const match = re.exec(value);
        if (match) {
            const [, fd, ft, td, tt] = match;
            const from = getTimestampFromDate(`${fd} ${ft}`);
            const to = getTimestampFromDate(`${td || fd} ${tt}`);
            if (!(isNaN(from) || isNaN(to))) {
                this.props.onUpdate({from, to});
            }
            this.setState({opened: false});
        }
    };
    onFromChange = ({from}: Pick<State, 'from'>) => {
        const {to} = this.state;
        this.setState({from: moment(from).valueOf(), datetime: formatInputTime(from, to)});
    };
    onToChange = ({from: to}: Pick<State, 'from'>) => {
        const {from} = this.state;
        this.setState({to: moment(to).valueOf(), datetime: formatInputTime(from, to)});
    };
    onRangeChange = ({from, to}: Pick<State, 'from' | 'to'>) => {
        this.setState({
            from,
            to,
            datetime: formatInputTime(from, to),
        });
    };
    onShortcutClick = (value: string) => {
        this.setState({opened: false});
        this.props.onShortcut?.(value, value);
    };
    onTopShortcutClick = (value: string) => {
        this.props.onShortcut?.(value, value);
    };
    renderOpenedPicker() {
        const {datetime} = this.state;
        return (
            <Fragment>
                {this.renderClosedPicker()}
                <EnterInput
                    ref={this._inputRef}
                    size="l"
                    text={datetime}
                    autoselect={true}
                    onUpdate={this.onInputChange}
                    onDone={this.onInputDone}
                    onCancel={noop_}
                />
            </Fragment>
        );
    }
    renderClosedPicker() {
        const {from, to} = this.props;
        return (
            <div className={b('date-text')}>
                <Icon data={iconCalendar} width={36} className={b('icon')} />
                <div className={b('text')}>{formatInterval(from, to)}</div>
            </div>
        );
    }
    renderShortcuts() {
        const {shortcut, shortcuts = []} = this.props;
        return (
            <div className={b('shortcut-pane')}>
                {shortcuts.map((group, index) => (
                    <div key={index} className={b('shortcut-group')}>
                        {group.map((item) => (
                            <TimeHotButton
                                key={item.time}
                                {...item}
                                size="m"
                                checked={shortcut === item.time}
                                className={b('shortcut')}
                                onClick={this.onShortcutClick}
                            />
                        ))}
                    </div>
                ))}
            </div>
        );
    }

    renderCustomShortcut() {
        const {from, to, shortcut} = this.props;
        const isShortcutCustom = shortcut === SHORTCUT_CUSTOM;
        const {customInput} = this.state;

        return (
            <div className={b('hot-custom')} key="custom">
                {customInput ? (
                    <EnterInput
                        autoFocus={true}
                        placeholder="6h"
                        onCancel={this.onCustomCancel}
                        onDone={this.onCustomDone}
                    />
                ) : (
                    <TimeHotButton
                        checked={isShortcutCustom}
                        onClick={this.onCustomClick}
                        title={isShortcutCustom ? humanizeInterval(from, to) : i18n('label_custom')}
                        width="max"
                    />
                )}
            </div>
        );
    }
    renderTopShortcuts = (item: ShorcutItem) => {
        const {shortcut} = this.props;
        if (item.time === SHORTCUT_CUSTOM) {
            return this.renderCustomShortcut();
        } else {
            return (
                <TimeHotButton
                    key={item.time}
                    {...item}
                    checked={shortcut === item.time}
                    className={b('hot')}
                    onClick={this.onTopShortcutClick}
                />
            );
        }
    };
    render() {
        const {className, from, to, topShortcuts, hasDatePicker} = this.props;
        const {opened} = this.state;
        const picker = opened ? this.renderOpenedPicker() : this.renderClosedPicker();
        return (
            <div className={b(null, className)}>
                <div className={b('hot-buttons', {divider: hasDatePicker})}>
                    {topShortcuts?.map(this.renderTopShortcuts)}
                </div>
                {hasDatePicker && (
                    <React.Fragment>
                        <div
                            ref={this._datepickerRef}
                            className={b('datepicker', {opened})}
                            onClick={this.onOpenPickerClick}
                        >
                            {picker}
                        </div>
                        <Popup
                            anchorRef={this._datepickerRef}
                            open={opened}
                            onClose={this.onPopupClose}
                        >
                            <div className={b('shortcuts')}>
                                <div className={b('range-datepicker')}>
                                    <TimelineDatepicker
                                        from={from}
                                        to={to}
                                        onRangeChange={this.onRangeChange}
                                        onFromChange={this.onFromChange}
                                        onToChange={this.onToChange}
                                    />
                                </div>
                                <div className={b('shortcuts-title')}>
                                    {i18n('label_shortcut-list')}:
                                </div>
                                {this.renderShortcuts()}
                            </div>
                        </Popup>
                    </React.Fragment>
                )}
            </div>
        );
    }
}
