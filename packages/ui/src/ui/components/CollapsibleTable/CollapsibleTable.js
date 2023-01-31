import React, {Component} from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import ElementsTable from '../../components/ElementsTable/ElementsTable';
import withCollapsible from '../../hocs/withCollapsible';

import hammer from '../../common/hammer';

import './CollapsibleTable.scss';

const headingBlock = cn('elements-heading');
const block = cn('collapsible-table');

class CollapsibleTable extends Component {
    static propTypes = {
        allItemsCount: PropTypes.number.isRequired,
        renderToggler: PropTypes.func.isRequired,
        heading: PropTypes.string.isRequired,
        className: PropTypes.string,
    };

    renderHeading() {
        const {heading, allItemsCount} = this.props;

        return (
            <div className={headingBlock({size: 's'})}>
                <span className={block('heading')}>{hammer.format['ReadableField'](heading)}</span>
                <span className={block('size')}>{allItemsCount}</span>
            </div>
        );
    }

    render() {
        const {className, renderToggler, ...rest} = this.props;

        return (
            <div className={block(null, className)}>
                {this.renderHeading()}
                <ElementsTable {...rest} />
                {renderToggler()}
            </div>
        );
    }
}

export default withCollapsible(CollapsibleTable);
