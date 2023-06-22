import React, {Component} from 'react';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';

import ElementsTableRow from '../../components/ElementsTable/ElementsTableRow';

import {ELEMENTS_TABLE, TemplatesPropType, prepareColumnsData} from './utils';

import './ElementsTable.scss';

export default class ElementsTableFooter extends Component {
    static propTypes = {
        footer: PropTypes.object.isRequired,
        templates: TemplatesPropType.isRequired,
        cssHover: PropTypes.bool,
    };

    static defaultProps = {
        templates: {},
        cssHover: false,
    };

    constructor(props) {
        super(props);

        this.state = {};
    }

    static getDerivedStateFromProps(props) {
        const {columns} = props;
        const {items, set} = prepareColumnsData(columns);

        return {
            columnItems: items,
            columnSet: set,
        };
    }

    renderRow(item, index, key = index) {
        const {css, itemHeight, templates, itemMods, selectedIndex, computeKey, cssHover} =
            this.props;
        const {columnSet, columnItems} = this.state;

        const selected = selectedIndex === index;
        const currentKey = typeof computeKey === 'function' ? computeKey(item) : key;

        return (
            <ElementsTableRow
                key={currentKey}
                columnSet={columnSet}
                columnItems={columnItems}
                item={item}
                itemHeight={itemHeight}
                css={css}
                templates={templates}
                selected={selected}
                index={index}
                itemMods={itemMods}
                cssHover={cssHover}
            />
        );
    }

    render() {
        const bFooter = block(ELEMENTS_TABLE)('footer');
        const {footer} = this.props;

        return <tfoot className={bFooter}>{this.renderRow(footer, 0)}</tfoot>;
    }
}
