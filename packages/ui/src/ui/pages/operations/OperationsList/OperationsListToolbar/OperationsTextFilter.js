import React, {Component} from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';
import {connect} from 'react-redux';
import {Redirect, withRouter} from 'react-router';

import Filter from '../../../../components/Filter/Filter';

import {isGotoEnabled} from '../../../../utils/operations/list';
import {updateFilter} from '../../../../store/actions/operations';
import Button from '../../../../components/Button/Button';

const block = cn('operations-list');
const tbBlock = cn('elements-toolbar');

class OperationsTextFilter extends Component {
    static propTypes = {
        // from connect
        updateFilter: PropTypes.func.isRequired,
        activePreset: PropTypes.string.isRequired,
        filter: PropTypes.shape({
            type: PropTypes.string.isRequired,
            defaultValue: PropTypes.string.isRequired,
            value: PropTypes.string.isRequired,
        }),
        // from react-router
        match: PropTypes.object,
    };

    state = {
        transition: false,
        value: '',
    };

    get value() {
        const {value: stateValue} = this.state;
        const {value: propsValue} = this.props.filter;

        if (stateValue) {
            return stateValue;
        }

        return propsValue;
    }

    gotoDetails = (value = this.props.filter.value) => {
        if (isGotoEnabled(value)) {
            this.setState({transition: true, value});
        }
    };

    handleKeyDown = (evt) => {
        if (evt.key === 'Enter') {
            this.gotoDetails(evt.target.value);
        }
    };

    render() {
        const {
            match,
            updateFilter,
            activePreset,
            filter: {value},
        } = this.props;
        const {transition} = this.state;

        return transition ? (
            <Redirect to={`${match.url}/${this.value}`} />
        ) : (
            <div className={block('toolbar-text-filter', tbBlock('component'))}>
                <Filter
                    key={activePreset}
                    placeholder="Filter operations..."
                    size="m"
                    value={this.value}
                    onChange={(newValue) => updateFilter('text', newValue)}
                    debounce={500}
                    onKeyDown={this.handleKeyDown}
                    pin="round-brick"
                />
                <Button
                    view="action"
                    pin="brick-round"
                    onClick={() => this.gotoDetails(value)}
                    disabled={!isGotoEnabled(this.value)}
                >
                    Go to operation
                </Button>
            </div>
        );
    }
}

function mapStateToProps({operations}) {
    return {
        filter: operations.list.filters.text,
        activePreset: operations.list.activePreset,
    };
}

const mapDispatchToProps = {updateFilter};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(OperationsTextFilter));
