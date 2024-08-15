import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import Suggest, {itemsProps} from '../../../components/Suggest/Suggest';

export default class OperationSuggestFilter extends Component {
    static propTypes = {
        // from props
        name: PropTypes.string.isRequired,
        placeholder: PropTypes.string.isRequired,
        statesProvider: PropTypes.func,
        // from connect
        updateFilter: PropTypes.func.isRequired,
        value: PropTypes.string.isRequired,
        defaultValue: PropTypes.string.isRequired,
        states: itemsProps,
        pin: PropTypes.string,
    };

    static simpleSuggestLoader(items, text) {
        text = text.toLowerCase();

        items = _.filter(items, (item) => {
            const itemText = typeof item === 'string' ? item : item.value;

            return text ? itemText.toLowerCase().indexOf(text) !== -1 : true;
        });

        return items;
    }

    render() {
        const {states, name, placeholder, updateFilter, value, defaultValue, pin} = this.props;

        return (
            <Suggest
                key={value}
                apply={(newValue) => updateFilter(name, newValue || defaultValue)}
                filter={OperationSuggestFilter.simpleSuggestLoader}
                text={value !== defaultValue ? value : ''}
                items={states}
                placeholder={placeholder}
                zIndexGroupLevel={1}
                clear={() => updateFilter(name, defaultValue)}
                pin={pin}
            />
        );
    }
}
