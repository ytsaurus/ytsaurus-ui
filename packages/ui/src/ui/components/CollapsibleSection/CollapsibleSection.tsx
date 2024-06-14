import React, {Component} from 'react';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';

import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';

import './CollapsibleSection.scss';
import Icon from '../../components/Icon/Icon';

const b = block('collapsible-section');
const headingCN = block('elements-heading');

type PropsStateLess = Props & {
    onToggle: Required<Props>['onToggle'];
};

export class CollapsibleSectionStateLess extends Component<PropsStateLess> {
    static propTypes = {
        name: PropTypes.node.isRequired,
        collapsed: PropTypes.bool,
        onToggle: PropTypes.func.isRequired,
        size: PropTypes.oneOf(['s', 'ss', 'xs', 'm', 'l', 'xl', 'ns']),
        children: PropTypes.node,
        overview: PropTypes.node,
        className: PropTypes.string,
    };

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
        const {name, children, size, overview, className, collapsed, marginDirection} = this.props;

        return (
            <ErrorBoundary>
                <div className={b({margin: marginDirection}, className)}>
                    <div className={headingCN({size, overview: 'yes'})}>
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
                                    className={b('toggler')}
                                    awesome={collapsed ? 'angle-down' : 'angle-up'}
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

export interface Props {
    className?: string;
    name: React.ReactNode;
    collapsed?: boolean;
    onToggle?: (value: boolean) => void;

    size?: 'unset' | 'xs' | 's' | 'ss' | 'ns' | 'n' | 'm' | 'l';
    children?: React.ReactNode;
    overview?: React.ReactNode;

    marginDirection?: 'top' | 'bottom';
}

export default function CollapsibleSection(props: Props) {
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
