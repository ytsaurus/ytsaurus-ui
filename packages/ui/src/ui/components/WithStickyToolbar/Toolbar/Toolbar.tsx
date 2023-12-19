import React from 'react';
import cn from 'bem-cn-lite';
import PropTypes from 'prop-types';

const block = cn('toolbar');

export const TOOLBAR_COMPONENT_HEIGHT = 48;

const ToolbarItemPropTypes = {
    name: PropTypes.string, // used as key and as a modifier for className
    node: PropTypes.node,
    wrapperClassName: PropTypes.string,
    growable: PropTypes.bool,
    shrinkable: PropTypes.bool,
    marginRight: PropTypes.string,
};

interface Props {
    className?: string;
    itemsToWrap: Array<{
        name?: string;
        node?: React.ReactNode;
        wrapperClassName?: string;
        growable?: boolean;
        shrinkable?: boolean;
        marginRight?: 'half';
    }>;
    children?: React.ReactNode;
}

export class Toolbar extends React.Component<Props> {
    static propTypes = {
        className: PropTypes.string,
        itemsToWrap: PropTypes.arrayOf(PropTypes.shape(ToolbarItemPropTypes)),
    };

    render() {
        const {className, children} = this.props;
        return (
            <div className={block(null, className)}>
                <div className={block('container')}>{this.renderItems()}</div>
                {children}
            </div>
        );
    }

    renderItems() {
        const {itemsToWrap = []} = this.props;
        return itemsToWrap.map(
            ({name, node, growable, shrinkable, wrapperClassName, marginRight}, index) => {
                return node ? (
                    <div
                        key={name || index}
                        className={block(
                            'item',
                            {name, growable, shrinkable, 'margin-right': marginRight},
                            wrapperClassName,
                        )}
                    >
                        {node}
                    </div>
                ) : null;
            },
        );
    }
}
