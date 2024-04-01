import React from 'react';
import cn from 'bem-cn-lite';

import withCollapsible from '../../hocs/withCollapsible';

import './CollapsibleList.scss';

const block = cn('collapsible-list');

type Props = {
    className?: string;
    items: Array<React.ReactElement<HTMLLIElement>>;
    renderToggler: () => React.ReactNode;
    useFlex?: boolean;
};

function CollapsibleList({className, useFlex, items, renderToggler}: Props) {
    return (
        <div className={block(null, className)}>
            <ul className={block('list', {'use-flex': useFlex})}>{items}</ul>

            {renderToggler()}
        </div>
    );
}

export default withCollapsible(CollapsibleList);
