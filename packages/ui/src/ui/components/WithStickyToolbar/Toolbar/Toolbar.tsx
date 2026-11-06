import React from 'react';
import cn from 'bem-cn-lite';
import PropTypes from 'prop-types';

const block = cn('yt-toolbar');

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
    itemsToWrap: Array<ToolbarItemToWrap>;
    children?: React.ReactNode;
    marginTopSkip?: boolean;
    containerRef?: React.Ref<HTMLDivElement>;
}

export type ToolbarItemToWrap = {
    name?: string;
    node?: React.ReactNode;
    wrapperClassName?: string;
    elementRef?: React.Ref<HTMLDivElement>;
    growable?: boolean;
    shrinkable?: boolean;
    marginRight?: 'half' | 'none';
    overflow?: 'hidden';
    width?: number;
};

export class Toolbar extends React.Component<Props> {
    static propTypes = {
        className: PropTypes.string,
        itemsToWrap: PropTypes.arrayOf(PropTypes.shape(ToolbarItemPropTypes)),
    };

    override render() {
        const {className, children, marginTopSkip, containerRef} = this.props;
        return (
            <div className={block({'margin-top-skip': marginTopSkip}, className)}>
                <div className={block('container')} ref={containerRef}>
                    {this.renderItems()}
                </div>
                {children}
            </div>
        );
    }

    renderItems() {
        const {itemsToWrap = []} = this.props;
        return itemsToWrap.map(
            (
                {
                    name,
                    node,
                    growable,
                    shrinkable,
                    wrapperClassName,
                    marginRight,
                    width,
                    elementRef,
                },
                index,
            ) => {
                return node ? (
                    <div
                        key={name || index}
                        ref={elementRef}
                        className={block(
                            'item',
                            {name, growable, shrinkable, 'margin-right': marginRight},
                            wrapperClassName,
                        )}
                        style={{width}}
                    >
                        {node}
                    </div>
                ) : null;
            },
        );
    }
}
