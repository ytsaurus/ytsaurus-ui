import React from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import './DataType.scss';

const b = cn('data-type');

const DataTypeStructKey = ({entry, level}) => [
    <span key="key" className={b('struct-key')}>
        {entry.key}
    </span>,
    '\u00a0:\u00a0',
    <DataType key="type" level={level} {...entry.type} />,
];

class DataType extends React.Component {
    static propTypes = {
        name: PropTypes.string,
        complex: PropTypes.bool,
        optional: PropTypes.bool,
        optionalLevel: PropTypes.number,
        tagged: PropTypes.bool,
        tags: PropTypes.array,
        level: PropTypes.number,
        type: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
        struct: PropTypes.array,
        params: PropTypes.array,
    };
    static defaultProps = {
        level: 0,
    };
    state = {
        expanded: this.props.level < 2,
    };
    onToggleClick = () => {
        this.setState({expanded: !this.state.expanded});
    };
    renderComplexTypeEntry = (entry, index) => {
        return <DataType key={index} level={this.props.level + 1} {...entry} />;
    };
    renderStructTypeEntry = (entry, index) => {
        return <DataTypeStructKey key={index} level={this.props.level + 1} entry={entry} />;
    };
    render() {
        const {optional, optionalLevel, complex, name, tagged, tags, type, struct, params} =
            this.props;
        const {expanded} = this.state;
        const complexType = complex && type ? (Array.isArray(type) && type) || [type] : false;
        return [
            <span
                key="name"
                className={b({optional, complex, 'optional-multilevel': optionalLevel > 0})}
                data-optional={optionalLevel ? `optional × ${optionalLevel}` : undefined}
                onClick={this.onToggleClick}
            >
                {name}
                {Array.isArray(params) && params.length > 0 && `(${params.join(', ')})`}
                {tagged &&
                    tags.map((tag) => (
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
                            {Boolean(struct) && struct.map(this.renderStructTypeEntry)}
                        </div>
                    ) : null}
                </div>
            ) : (
                <br key="separator" />
            ),
        ];
    }
}

export default DataType;
