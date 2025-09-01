import React from 'react';
import cn from 'bem-cn-lite';

import isEqual_ from 'lodash/isEqual';
import throttle_ from 'lodash/throttle';

import SimpleModal from '../../components/Modal/SimpleModal';
import {Tooltip} from '../Tooltip/Tooltip';

import './CommaSeparateListWithRestCounter.scss';

const block = cn('comma-separated-list-with-rest-counter');

function counterText(length: number) {
    return `  +${length}`; // one space more than required
}

const MAX_TOOLTIP_COUNT = 20;

export type CommaSeparatedListWithRestCounterProps = {
    className?: string;
    items?: Array<string>;
    maxTooltipCount?: number;

    itemRenderer?: (v: string) => React.ReactNode;
};

type State = {
    offsetWidth?: number;
    offsetHeight?: number;
    font?: string;
    lineHeight?: string;
    items?: Array<string>;
    rows?: Array<Array<string>>;
    restCounter?: number;

    showDialog?: boolean;
};

/**
 * The rendered result depends on:
 *   - offsetWidth
 *   - offsetHeight
 *   - lineHeight   (from getComputedStyle(...))
 *   - font         (from getComputedStyle(...))
 * properties of main-block of the component,
 * but the component does not try to detect any changes of these properties.
 * So you must force re-rendering of the component from outside
 * for each changing of these properties. Or the properties should be constant.
 */
export default class CommaSeparatedListWithRestCounter extends React.Component<
    CommaSeparatedListWithRestCounterProps,
    State
> {
    static defaultProps = {
        maxTooltipCount: MAX_TOOLTIP_COUNT,
    };

    ref?: HTMLDivElement | null;
    unmounted = false;

    state: State = {
        restCounter: 0,
        rows: [],
        showDialog: false,
    };

    onRef = (ref: HTMLDivElement | null) => {
        this.ref = ref;
        this.updateState();
    };

    componentWillUnmount() {
        this.unmounted = true;
    }

    componentDidUpdate() {
        this.updateState();
    }

    updateStateImpl = () => {
        if (this.unmounted) {
            this.unmounted = true;
        }

        const {items} = this.props;
        if (!this.ref || !items || !items.length) {
            this.setStateIfChanged({rows: [], restCounter: 0});
            return;
        }

        const {offsetWidth, offsetHeight} = this.ref;
        const {fontWeight, lineHeight, fontSize, fontFamily} = getComputedStyle(this.ref);
        const font = `${fontWeight} ${fontSize}/${lineHeight} ${fontFamily}`;

        if (!offsetWidth || !offsetHeight) {
            this.setStateIfChanged({rows: [], restCounter: 0});
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        ctx.font = font;
        const rows = [];
        let pos = 0;

        const lh = parseInt(lineHeight);

        let currentRow: Array<string> = [];
        let currentRowWidth = 0;
        while ((rows.length + 1) * lh <= offsetHeight && pos < items.length) {
            const isLastItem = pos === items.length - 1;

            const text = items[pos++];
            const {width} = ctx.measureText(text + ', ');
            currentRowWidth += width;

            const isLastRow = offsetHeight - (rows.length + 1) * lh < lh;
            const counterWidth =
                isLastRow && !isLastItem
                    ? ctx.measureText(counterText(items.length - pos)).width
                    : 0;
            const maxWidth = offsetWidth - counterWidth;

            if (currentRowWidth <= maxWidth) {
                currentRow.push(text);
                if (isLastItem) {
                    rows.push(currentRow);
                }
            } else {
                rows.push(currentRow);

                if (isLastRow) {
                    --pos;
                } else {
                    currentRow = [text];
                    currentRowWidth = width;
                    if (isLastItem) {
                        rows.push(currentRow);
                    }
                }
            }
        }

        const stateToCompare = {
            offsetWidth,
            offsetHeight,
            font,
            lineHeight,
            items,
            rows,
            restCounter: items.length - pos,
        };
        this.setStateIfChanged(stateToCompare);
    };

    // eslint-disable-next-line @typescript-eslint/member-ordering
    updateState = throttle_(this.updateStateImpl, 30);

    setStateIfChanged(toCompare: State) {
        const changed = Object.keys(toCompare).some((k) => {
            const key = k as keyof typeof toCompare;
            return !isEqual_(this.state[key], toCompare[key]);
        });

        if (changed) {
            this.setState({...toCompare});
        }
        return changed;
    }

    renderRows() {
        const {rows} = this.state;
        return rows?.map((row, index) => {
            return (
                <div key={index} className={block('row')}>
                    {this.renderRow(row, index === rows.length - 1)}
                </div>
            );
        });
    }

    renderRow(items: Array<string>, isLastRow: boolean) {
        return (
            <React.Fragment>
                <div className={block('row-items')}>{this.renderItems(items, isLastRow)}</div>
                {isLastRow && this.renderCounter()}
            </React.Fragment>
        );
    }

    renderItems(items: Array<string>, isLastRow: boolean) {
        return items.map((item, index) => {
            const isLastItem = index === items.length - 1;
            const comma = !isLastRow || !isLastItem || this.state.restCounter ? ', ' : '';
            return (
                <span key={index} className={block('row-item')}>
                    {this.renderItem(item)}
                    {comma}
                </span>
            );
        });
    }

    renderItem = (item: string) => {
        const {itemRenderer} = this.props;
        return itemRenderer ? itemRenderer(item) : item;
    };

    renderCounter() {
        const {restCounter} = this.state;
        if (!restCounter) {
            return null;
        }

        const clickable = !this.allowItemsInTooltip();
        const toolTip = !clickable ? this.renderTooltip() : 'Click to show all items';

        const {showDialog} = this.state;
        const key = showDialog; // the key is required to hide tooltip behind the dialog with all items

        return (
            <Tooltip key={String(key)} className={block('hover-tooltip')} content={toolTip}>
                <div className={block('row-counter', {clickable})} onClick={this.onCounterClick}>
                    +{restCounter}
                </div>
                <SimpleModal title={'All items'} visible={showDialog} onCancel={this.closeDialog}>
                    {showDialog && this.renderTooltip()}
                </SimpleModal>
            </Tooltip>
        );
    }

    closeDialog = () => {
        this.setState({showDialog: false});
    };

    onCounterClick = () => {
        if (this.allowItemsInTooltip()) {
            return;
        }

        this.setState({showDialog: true});
    };

    renderTooltip() {
        const {items} = this.state;
        return (
            <div className={block('tooltip', 'yc-root')}>
                {items?.map((item) => {
                    return <div key={item}>{this.renderItem(item)}</div>;
                })}
            </div>
        );
    }

    allowItemsInTooltip() {
        const {maxTooltipCount = MAX_TOOLTIP_COUNT} = this.props;
        const {items = []} = this.state;
        return items.length <= Math.min(MAX_TOOLTIP_COUNT, maxTooltipCount);
    }

    render() {
        const {className} = this.props;
        return (
            <div ref={this.onRef} className={block(null, className)}>
                {this.renderRows()}
            </div>
        );
    }
}
