import React, {Component} from 'react';
import cn from 'bem-cn-lite';

import ElementsTable from '../../components/ElementsTable/ElementsTable';
import withCollapsible from '../../hocs/withCollapsible';

import hammer from '../../common/hammer';

import './CollapsibleTable.scss';

const headingBlock = cn('elements-heading');
const block = cn('collapsible-table');

export type CollapsibleTableProps = {
    allItemsCount: number;
    renderToggler: () => React.ReactNode;
    heading: string;
    className?: string;
    items: object[];
    columns?: object;
    templates?: object;
    css?: string;
};

class CollapsibleTable extends Component<CollapsibleTableProps> {
    renderHeading() {
        const {heading, allItemsCount} = this.props;

        return (
            <div className={headingBlock({size: 's'})}>
                <span className={block('heading')}>{hammer.format['ReadableField'](heading)}</span>
                <span className={block('size')}>{allItemsCount}</span>
            </div>
        );
    }

    override render() {
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
