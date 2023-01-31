import React from 'react';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';
import {Icon} from '@gravity-ui/uikit';

import iconArrow from '../../../../../../img/svg/chevron-right.svg';

import './YearSwitcher.scss';

const b = block('yc-datepicker-year-switcher');

export class YearSwitcher extends React.Component {
    static propTypes = {
        switcherDate: PropTypes.object,
        offsetTop: PropTypes.number,
        visible: PropTypes.bool,
        onShiftMonths: PropTypes.func,
    };

    static getDerivedStateFromProps(props) {
        const changedState = {};

        if (props.switcherDate) {
            changedState.switcherDate = props.switcherDate;
        }

        return changedState;
    }

    state = {
        switcherDate: this.props.switcherDate,
    };

    onLeftArrowClick = () => this.props.onShiftMonths(-12);

    onRightArrowClick = () => this.props.onShiftMonths(12);

    render() {
        const {offsetTop, visible} = this.props;
        const {switcherDate} = this.state;

        if (!visible) {
            return null;
        }

        return (
            <div
                className={b()}
                style={{
                    top: offsetTop + 4,
                }}
            >
                <div className={b('arrow', {left: true})} onClick={this.onLeftArrowClick}>
                    <Icon data={iconArrow} />
                </div>
                <div className={b('value')}>{switcherDate.year}</div>
                <div className={b('arrow', {right: true})} onClick={this.onRightArrowClick}>
                    <Icon data={iconArrow} />
                </div>
            </div>
        );
    }
}
