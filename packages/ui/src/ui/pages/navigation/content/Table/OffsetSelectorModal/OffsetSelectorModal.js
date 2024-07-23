import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import cn from 'bem-cn-lite';

import escapeRegExp_ from 'lodash/escapeRegExp';
import filter_ from 'lodash/filter';
import isEmpty_ from 'lodash/isEmpty';
import map_ from 'lodash/map';

import {TextInput} from '@gravity-ui/uikit';
import Modal from '../../../../../components/Modal/Modal';

import Query from '../../../../../utils/navigation/content/table/query';

import {
    getCurrentOffsetValues,
    getIsTableSorted,
} from '../../../../../store/selectors/navigation/content/table';
import {
    closeOffsetSelectorModal,
    moveOffset,
} from '../../../../../store/actions/navigation/content/table/pagination';

import './OffsetSelectorModal.scss';

const block = cn('offset-selector');

class OffsetSelectorModal extends Component {
    static itemProps = PropTypes.shape({
        name: PropTypes.string.isRequired,
        value: PropTypes.string,
        checked: PropTypes.bool.isRequired,
    });

    static propTypes = {
        // from connect
        isOffsetSelectorOpen: PropTypes.bool.isRequired,
        closeOffsetSelectorModal: PropTypes.func.isRequired,
        moveOffset: PropTypes.func.isRequired,
        initialItems: PropTypes.arrayOf(OffsetSelectorModal.itemProps).isRequired,
        isTableSorted: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);
        const {initialItems} = this.props;
        this.state = {
            filter: '',
            initialItems,
            items: initialItems,
        };
    }

    static getDerivedStateFromProps({initialItems}, state) {
        if (initialItems === state.initialItems) {
            return null;
        }
        return {
            initialItems,
            items: initialItems,
        };
    }

    _handleCONFIRMButtonClick = () => {
        const {items} = this.state;
        const {isTableSorted, moveOffset, closeOffsetSelectorModal} = this.props;
        const minKeyValue = isTableSorted ? 'null' : '0';
        const offsetValues = map_(items, (item) => {
            return isEmpty_(item.value) ? minKeyValue : item.value;
        });
        moveOffset(Query.prepareKey(offsetValues));
        closeOffsetSelectorModal();
    };

    _handleCANCELButtonClick = () => {
        const {closeOffsetSelectorModal} = this.props;
        this.setState(({initialItems}) => ({items: initialItems}));
        closeOffsetSelectorModal();
    };

    _changeFilter = (filter) => {
        this.setState({filter});
    };

    updateItemValue = (name, value) => {
        this.setState(({items: prevItems}) => {
            const items = [...prevItems];
            const index = items.findIndex((item) => item.name === name);
            const changedItem = items[index];
            items[index] = {...changedItem, value};
            return {items};
        });
    };

    _handleInputChange = (name) => (value) => {
        this.updateItemValue(name, value);
    };

    renderSearchBox() {
        return (
            <TextInput
                theme="normal"
                size="s"
                placeholder="Search..."
                onUpdate={this._changeFilter}
                text={this.state.filter}
                hasClear={true}
            />
        );
    }

    filterItemsByName(items, filter) {
        const re = new RegExp(escapeRegExp_(filter), 'i');
        return filter_(items, (item) => re.test(item.name));
    }

    renderItems() {
        const {items, filter} = this.state;
        const visibleItems = this.filterItemsByName(items, filter);
        return (
            <div className={block('items')}>
                <div className={block('item-group')}>{this.renderSearchBox()}</div>
                {map_(visibleItems, (item) => {
                    return (
                        <label
                            key={item.name}
                            className={block('item-group', {
                                disabled: !item.checked,
                            })}
                        >
                            {item.name}
                            <div className={block('item')}>
                                <TextInput
                                    theme="normal"
                                    size="s"
                                    placeholder=""
                                    onUpdate={this._handleInputChange(item.name)}
                                    text={item.value}
                                    hasClear={true}
                                />
                            </div>
                        </label>
                    );
                })}
            </div>
        );
    }

    renderContent() {
        return <div className={block('content')}>{this.renderItems()}</div>;
    }

    render() {
        const {isOffsetSelectorOpen} = this.props;
        return (
            <Modal
                size="m"
                title="Keys"
                borderless={true}
                visible={isOffsetSelectorOpen}
                confirmText="Confirm"
                onConfirm={this._handleCONFIRMButtonClick}
                onCancel={this._handleCANCELButtonClick}
                content={this.renderContent()}
                className={block()}
                contentClassName={block(null, 'pretty-scroll')}
            />
        );
    }
}

const mapStateToProps = (state) => {
    const {isOffsetSelectorOpen} = state.navigation.content.table;
    const initialItems = getCurrentOffsetValues(state);
    const isTableSorted = getIsTableSorted(state);

    return {isOffsetSelectorOpen, initialItems, isTableSorted};
};

const mapDispatchToProps = {
    closeOffsetSelectorModal,
    moveOffset,
};

export default connect(mapStateToProps, mapDispatchToProps)(OffsetSelectorModal);
