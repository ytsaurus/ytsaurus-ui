import React from 'react';
import PropTypes from 'prop-types';

import {Datepicker} from '../../Datepicker/Datepicker';

export class TimelineDatepicker extends React.Component {
    static propTypes = {
        separate: PropTypes.bool,
        controlWidth: PropTypes.oneOf([PropTypes.number, PropTypes.string]),
        from: PropTypes.number,
        to: PropTypes.number,
        onFromChange: PropTypes.func,
        onToChange: PropTypes.func,
        onRangeChange: PropTypes.func,
    };
    static defaultProps = {
        separate: false,
        controlWidth: '130px',
    };
    render() {
        const {from, to, separate, controlWidth} = this.props;
        return separate ? (
            <>
                <Datepicker
                    range={false}
                    controlWidth={controlWidth}
                    onUpdate={this.props.onFromChange}
                    format="dd.MM.yyyy HH:mm"
                    from={from}
                />
                {' — '}
                <Datepicker
                    range={false}
                    controlWidth={controlWidth}
                    onUpdate={this.props.onToChange}
                    format="dd.MM.yyyy HH:mm"
                    from={to}
                />
            </>
        ) : (
            <Datepicker
                onUpdate={this.props.onRangeChange}
                format="yyyy-MM-dd HH:mm"
                from={from}
                to={to}
            />
        );
    }
}
