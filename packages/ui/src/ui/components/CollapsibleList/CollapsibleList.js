import React, {Component} from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import withCollapsible from '../../hocs/withCollapsible';

import './CollapsibleList.scss';

const block = cn('collapsible-list');

class CollapsibleList extends Component {
    static propTypes = {
        items: PropTypes.arrayOf(PropTypes.element).isRequired,
        renderToggler: PropTypes.func,
        className: PropTypes.string,
    };

    render() {
        const {className, items, renderToggler} = this.props;

        return (
            <div className={block()}>
                <ul className={block('list', className)}>{items}</ul>

                {renderToggler()}
            </div>
        );
    }
}

export default withCollapsible(CollapsibleList);
