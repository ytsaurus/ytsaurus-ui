import * as React from 'react';

import {Button, Icon, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import type {DataSet} from 'vis-data';

import {ProcessedNode, useOperationNodesStates} from '../../utils';

import infoIcon from '@gravity-ui/icons/svgs/circle-info.svg';
import closeIcon from '@gravity-ui/icons/svgs/xmark.svg';

import './Legend.scss';

const block = cn('legend');

interface Props {
    className?: string;
    orientation?: 'horizontal' | 'vertical';
    nodes: DataSet<ProcessedNode>;
    children?: React.ReactNode;
}
export function Legend({className, orientation, nodes, children}: Props) {
    const states = useOperationNodesStates(nodes);
    return (
        <div className={block({orientation}, className)}>
            {states.map(({state, title, count}) => {
                return (
                    <div key={state} className={block('item')}>
                        <div className={block('item-color', {state: state.toLowerCase()})} />
                        <Text className={block('item-title')} color="complementary">
                            {title}
                            {count ? <strong> {count}</strong> : null}
                        </Text>
                    </div>
                );
            })}
            {children}
        </div>
    );
}

interface LegendButtonProps {
    className?: string;
    nodes: DataSet<ProcessedNode>;
}
export function LegendInfo({className, nodes}: LegendButtonProps) {
    const [state, setState] = React.useState<'collapsed' | 'expanded'>('collapsed');

    return (
        <div className={className}>
            {state === 'collapsed' ? (
                <Button
                    title={'show-plan-legend.button-title'}
                    onClick={() => {
                        setState('expanded');
                    }}
                >
                    <Icon data={infoIcon} size={16} />
                </Button>
            ) : (
                <Legend nodes={nodes}>
                    <Button
                        view="flat-secondary"
                        title={'hide-plan-legend.button-title'}
                        onClick={() => {
                            setState('collapsed');
                        }}
                    >
                        <Icon data={closeIcon} />
                    </Button>
                </Legend>
            )}
        </div>
    );
}
