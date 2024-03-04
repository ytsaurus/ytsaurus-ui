import React from 'react';
import './AnimatedCollapse.scss';

type Props = {
    children: React.ReactNode;
    collapsed: boolean;
};

export const AnimatedCollapse = ({children, collapsed}: Props) => {
    return (
        <div className={'animated-collapse' + (collapsed ? ' collapsed' : '')}>
            <div>{children}</div>
        </div>
    );
};
