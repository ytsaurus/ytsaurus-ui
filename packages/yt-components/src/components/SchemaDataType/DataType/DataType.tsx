import React from 'react';
import cn from 'bem-cn-lite';

import './DataType.scss';

const b = cn('data-type');

export type DataTypeProps = {
    name?: string;
    complex?: boolean;
    optional?: boolean;
    optionalLevel?: number;
    tagged?: boolean;
    tags?: string[];
    level?: number;
    type?: object | object[];
    struct?: Array<{key: string | number; type: DataTypeProps}>;
    params?: unknown[];
};

type DataTypeStructKeyProps = {
    entry: {key: string | number; type: DataTypeProps};
    level: number;
};

const DataTypeStructKey = ({entry, level}: DataTypeStructKeyProps) => [
    <span key="key" className={b('struct-key')}>
        {entry.key}
    </span>,
    '\u00a0:\u00a0',
    <DataType key="type" level={level} {...entry.type} />,
];

type DataTypeState = {
    expanded: boolean;
};

export class DataType extends React.Component<DataTypeProps, DataTypeState> {
    static defaultProps = {
        level: 0,
    };

    state: DataTypeState = {
        expanded: (this.props.level ?? 0) < 2,
    };

    onToggleClick = () => {
        this.setState({expanded: !this.state.expanded});
    };

    renderComplexTypeEntry = (entry: DataTypeProps, index: number) => {
        return <DataType key={index} level={(this.props.level ?? 0) + 1} {...entry} />;
    };

    renderStructTypeEntry = (entry: {key: string | number; type: DataTypeProps}, index: number) => {
        return <DataTypeStructKey key={index} level={(this.props.level ?? 0) + 1} entry={entry} />;
    };
    render() {
        const {optional, optionalLevel, complex, name, tagged, tags, type, struct, params} =
            this.props;
        const {expanded} = this.state;
        const complexType = complex && type ? (Array.isArray(type) && type) || [type] : false;
        return [
            <span
                key="name"
                className={b({optional, complex, 'optional-multilevel': Boolean(optionalLevel)})}
                data-optional={optionalLevel ? `optional × ${optionalLevel}` : undefined}
                onClick={this.onToggleClick}
            >
                {name}
                {Array.isArray(params) && params.length > 0 && `(${params.map(String).join(', ')})`}
                {tagged &&
                    tags?.map((tag) => (
                        <span key={tag} className={b('tag')}>
                            {tag}
                        </span>
                    ))}
            </span>,
            complex ? (
                <div key="subtype" className={b('subtype', {expanded})}>
                    <span className={b('ellipsis')} onClick={this.onToggleClick} />
                    {expanded ? (
                        <div className={b('content', {expanded})}>
                            {complexType && complexType.map(this.renderComplexTypeEntry)}
                            {Boolean(struct) && struct?.map(this.renderStructTypeEntry)}
                        </div>
                    ) : null}
                </div>
            ) : (
                <br key="separator" />
            ),
        ];
    }
}
