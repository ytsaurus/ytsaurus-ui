import React, {Component} from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import map_ from 'lodash/map';

import {Link} from '@gravity-ui/uikit';

import Icon from '../../components/Icon/Icon';

import withCollapsible from '../../hocs/withCollapsible';

import './LabelsGroup.scss';
import Button from '../../components/Button/Button';

const block = cn('labels-group');

type LabelsGroupProps = {
    items: Array<LabelsGroupItem>;

    onClick?: (item: LabelsGroupItem) => void;
    onRemove?: (item: LabelsGroupItem) => void;
    onRemoveAll?: () => void;

    renderToggler: () => React.ReactNode;
};

type LabelsGroupItem = {
    name: string;
    isDefault?: boolean;
    onClick: () => void;
    url?: string;
};

class LabelsGroup extends Component<LabelsGroupProps> {
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

    handleLabelClick = (label: LabelsGroupItem) => {
        const {onClick} = this.props;

        if (typeof onClick === 'function') {
            onClick(label);
        }
    };

    handleRemoveClick = (evt: React.MouseEvent<HTMLElement>, label: LabelsGroupItem) => {
        const {onRemove} = this.props;

        evt.stopPropagation();
        if (typeof onRemove === 'function') {
            onRemove(label);
        }
    };

    renderLabel(label: LabelsGroupItem) {
        const {onRemove} = this.props;
        const {name, url, isDefault, onClick} = label;

        const onLabelClick = () => this.handleLabelClick(label);
        const onRemoveClick = (evt: React.MouseEvent<HTMLElement>) =>
            this.handleRemoveClick(evt, label);

        return (
            <li
                onClick={onLabelClick}
                className={block('label', {clickable: Boolean(onClick)})}
                key={name}
            >
                {url ? (
                    <Link href={url} target="_blank">
                        {name}
                    </Link>
                ) : (
                    name
                )}

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
                {map_(items, (label) => this.renderLabel(label))}

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
