import React from 'react';
import cn from 'bem-cn-lite';

const block = cn('yt-toolbar');

interface Props {
    className?: string;
    itemsToWrap: Array<ToolbarItemToWrap>;
    children?: React.ReactNode;
    marginTopSkip?: boolean;
}

export type ToolbarItemToWrap = {
    name?: string;
    node?: React.ReactNode;
    wrapperClassName?: string;
    growable?: boolean;
    shrinkable?: boolean;
    marginRight?: 'half' | 'none';
    overflow?: 'hidden';
    width?: number;
};

export class Toolbar extends React.Component<Props> {
    render() {
        const {className, children, marginTopSkip} = this.props;
        return (
            <div className={block({'margin-top-skip': marginTopSkip}, className)}>
                <div className={block('container')}>{this.renderItems()}</div>
                {children}
            </div>
        );
    }

    renderItems() {
        const {itemsToWrap = []} = this.props;
        return itemsToWrap.map(
            ({name, node, growable, shrinkable, wrapperClassName, marginRight, width}, index) => {
                return node ? (
                    <div
                        key={name || index}
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
