import React, {Component} from 'react';
import block from 'bem-cn-lite';

import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';

import './CollapsibleSection.scss';
import Icon from '../../components/Icon/Icon';

const b = block('collapsible-section');
const headingCN = block('elements-heading');

type PropsStateLess = CollapsibleSectionProps & {
    onToggle: Required<CollapsibleSectionProps>['onToggle'];
};

export class CollapsibleSectionStateLess extends Component<PropsStateLess> {
    static defaultProps = {
        size: 'm',
        collapsed: false,
        marginDirection: 'top',
    };

    toggle = () => {
        const {onToggle} = this.props;

        onToggle(!this.props.collapsed);
    };

    render() {
        const {
            name,
            children,
            size,
            overview,
            className,
            headingClassName,
            collapsed,
            marginDirection,
            togglerRightPadding,
        } = this.props;

        return (
            <ErrorBoundary>
                <div className={b({margin: marginDirection}, className)}>
                    <div className={headingCN({size, overview: 'yes'}, headingClassName)}>
                        <span
                            className={headingCN(
                                'heading',
                                {
                                    clickable: 'yes',
                                },
                                b('title'),
                            )}
                            onClick={this.toggle}
                        >
                            {name}
                            <a>
                                <Icon
                                    className={b('toggler', {'right-padding': togglerRightPadding})}
                                    awesome={collapsed ? 'angle-down' : 'angle-up'}
                                    size={size === 'ss' ? 17 : undefined}
                                />
                            </a>
                        </span>
                        {overview}
                    </div>

                    {!collapsed && <ErrorBoundary>{children}</ErrorBoundary>}
                </div>
            </ErrorBoundary>
        );
    }
}

export interface CollapsibleSectionProps {
    className?: string;
    headingClassName?: string;
    name: React.ReactNode;
    collapsed?: boolean;
    onToggle?: (value: boolean) => void;

    size?: 'unset' | 'xs' | 's' | 'ss' | 'ns' | 'n' | 'm' | 'l';
    children?: React.ReactNode;
    overview?: React.ReactNode;

    marginDirection?: 'top' | 'bottom';

    togglerRightPadding?: 'small';
}

export default function CollapsibleSection(props: CollapsibleSectionProps) {
    const {onToggle} = props;
    const [collapsed, setCollapsed] = React.useState(props.collapsed);

    const onChange = React.useCallback(
        (value: boolean) => {
            setCollapsed(value);
            if (onToggle) {
                onToggle(value);
            }
        },
        [setCollapsed, onToggle],
    );

    return <CollapsibleSectionStateLess {...props} onToggle={onChange} collapsed={collapsed} />;
}
