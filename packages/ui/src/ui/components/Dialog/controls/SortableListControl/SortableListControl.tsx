// @ts-ignore
import {SortableContainer, SortableElement, SortableHandle} from 'react-sortable-hoc';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import './SortableListControl.scss';
import Icon from '../../../Icon/Icon';

const block = cn('ic-sortable-list-control');

const DragHandle = SortableHandle(({children}: {children: React.ReactNode}) => (
    <div className={block('drag-handle')}>
        <Icon className={block('icon')} face="solid" awesome="list" />
        {children}
    </div>
));

const SortableItem = SortableElement(({value}: {value: React.ReactNode}) => (
    <li className={block('item')}>
        <DragHandle>{value}</DragHandle>
    </li>
));

const SortableList = SortableContainer(({items}: {items: Array<React.ReactNode>}) => {
    return (
        <ul className={block()}>
            {items.map((value, index) => (
                <SortableItem key={`item-${value}`} index={index} {...{value}} />
            ))}
        </ul>
    );
});

interface Props
    extends Omit<
        React.ComponentProps<typeof SortableList>,
        'useDragHandle' | 'items' | 'onSortEnd'
    > {
    value: Array<React.ReactNode>;
    onChange: (value: Props['value']) => void;
    error?: string;

    extras?: any;
}

interface State {
    items: Props['value'];
}

class SortableListControl extends Component<Props> {
    static propTypes = {
        value: PropTypes.array.isRequired,
        onChange: PropTypes.func.isRequired,
        extras: PropTypes.object,
        error: PropTypes.string,
    };

    static defaultProps = {
        extras: {},
    };

    static getDefaultValue() {
        return [];
    }

    static isEmpty(value: Props['value']) {
        return Array.isArray(value) ? !value.length : true;
    }

    state: State = {
        items: this.props.value,
    };

    onSortEnd = ({oldIndex, newIndex}: {oldIndex: number; newIndex: number}) => {
        const {onChange} = this.props;

        this.setState(({items: prevItems}: State) => {
            const items = [...prevItems];
            const [removed] = items.splice(oldIndex, 1);
            items.splice(newIndex, 0, removed);
            onChange(items);

            return {items};
        });
    };

    render() {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {value, onChange, error, ...rest} = this.props;
        const {items} = this.state;

        return <SortableList {...rest} useDragHandle {...{items}} onSortEnd={this.onSortEnd} />;
    }
}

export default SortableListControl;
