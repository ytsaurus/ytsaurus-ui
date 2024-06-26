import React, {Component} from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import Icon from '../../components/Icon/Icon';

import withCollapsible from '../../hocs/withCollapsible';

import './LabelsGroup.scss';
import Button from '../../components/Button/Button';

const block = cn('labels-group');

class LabelsGroup extends Component {
    static propTypes = {
        // from parent
        onClick: PropTypes.func,
        onRemove: PropTypes.func,
        onRemoveAll: PropTypes.func,

        // from hoc
        items: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string.isRequired,
                isDefault: PropTypes.bool,
            }).isRequired,
        ).isRequired,
        renderToggler: PropTypes.func.isRequired,
    };

    handleLabelClick = (label) => {
        const {onClick} = this.props;

        if (typeof onClick === 'function') {
            onClick(label);
        }
    };

    handleRemoveClick = (evt, label) => {
        const {onRemove} = this.props;

        evt.stopPropagation();
        if (typeof onRemove === 'function') {
            onRemove(label);
        }
    };

    renderLabel(label) {
        const {onRemove} = this.props;
        const {name, isDefault, onClick} = label;

        const onLabelClick = () => this.handleLabelClick(label);
        const onRemoveClick = (evt) => this.handleRemoveClick(evt, label);

        return (
            <li onClick={onLabelClick} className={block('label', {clickable: onClick})} key={name}>
                {name}

                {onRemove && !isDefault && (
                    <span onClick={onRemoveClick} className={block('close')}>
                        <Icon size="m" face="solid" awesome="times" />
                    </span>
                )}
            </li>
        );
    }

    render() {
        const {items, renderToggler, onRemoveAll} = this.props;

        return (
            <ul className={block()}>
                {_.map(items, (label) => this.renderLabel(label))}

                {renderToggler()}

                {onRemoveAll && items.length > 0 && (
                    <Button size="s" view="flat-secondary" onClick={onRemoveAll}>
                        Clear all
                    </Button>
                )}
            </ul>
        );
    }
}

export default withCollapsible(LabelsGroup);
