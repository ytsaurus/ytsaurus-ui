import React, {Component} from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import map_ from 'lodash/map';

import {Popover} from '@gravity-ui/uikit';

import Tag from '../../components/Tag/Tag';

import './MultiSubjectsHelper.scss';

const block = cn('yt-multi-subjects');

type Props<T> = {
    className?: string;
    value: Array<{
        value: string;
        type: T;
        text?: string;
    }>;
    onChange: (value: Props<T>['value']) => void;
    onBlur?: () => void;
    onFocus?: () => void;

    children?: React.ReactNode;
};

export default class MultiSubjectHelper<T extends string> extends Component<Props<T>> {
    static propTypes = {
        placeholder: PropTypes.string,
        value: PropTypes.arrayOf(PropTypes.object),
        onChange: PropTypes.func.isRequired,
        children: PropTypes.node.isRequired,
    };

    static hasErrorRenderer = true;

    static getDefaultValue() {
        return [];
    }

    static isEmpty<T extends string>(value: Props<T>['value']) {
        return !value || !value.length;
    }

    render() {
        const {children} = this.props;

        return (
            <React.Fragment>
                {children}
                {this.renderTags()}
            </React.Fragment>
        );
    }

    renderTags() {
        const {value: items} = this.props;

        if (!items || !items.length) {
            return null;
        }

        return (
            <div className={block('tags')}>
                {map_(items, (item) => {
                    const {text, value, type} = item;
                    const tagText = type === 'users' ? text || value : text || `${type}:${value}`;

                    const content = (
                        <Tag
                            text={tagText}
                            onRemove={() => this.onRemove(item)}
                            asUsername={item.type === 'users'}
                        />
                    );

                    return (
                        <Popover
                            key={item.value}
                            className={block('tags-item')}
                            content={tagText}
                            delayClosing={400}
                            delayOpening={400}
                        >
                            {content}
                        </Popover>
                    );
                })}
            </div>
        );
    }

    onRemove = (item: Props<T>['value'][0]) => {
        const {value, onChange} = this.props;
        const newItems = value.filter((i) => i !== item);
        onChange(newItems);
    };
}
