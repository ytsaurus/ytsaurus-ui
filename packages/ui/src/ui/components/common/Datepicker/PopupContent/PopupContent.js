import React from 'react';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';
import {Button} from '@gravity-ui/uikit';
import {Tabs} from '@gravity-ui/uikit/legacy';

import i18n from '../i18n';
import {Presets} from '../Presets/Presets';
import {Calendar} from '../Calendar/Calendar';
import {getTabs} from '../constants';

import './PopupContent.scss';

const b = block('yc-datepicker-popup-content');

export class PopupContent extends React.PureComponent {
    static propTypes = {
        from: PropTypes.object,
        to: PropTypes.object,
        min: PropTypes.object,
        max: PropTypes.object,
        zone: PropTypes.string,
        activeTab: PropTypes.string,
        mod: PropTypes.string,
        pick: PropTypes.number,
        range: PropTypes.bool,
        scrollCalendar: PropTypes.bool,
        showTabs: PropTypes.bool,
        showApply: PropTypes.bool,
        onDateClick: PropTypes.func,
        onRangeDateClick: PropTypes.func,
        onSelectTab: PropTypes.func,
        onSubmit: PropTypes.func,
    };

    render() {
        const {
            from,
            to,
            min,
            max,
            zone,
            activeTab,
            mod,
            pick,
            range,
            scrollCalendar,
            showTabs,
            showApply,
        } = this.props;

        return (
            <div className={b(null, mod)}>
                {showTabs && (
                    <React.Fragment>
                        <div className={b('tabs')}>
                            <Tabs
                                items={getTabs()}
                                activeTab={activeTab}
                                onSelectTab={this.props.onSelectTab}
                            />
                        </div>
                        {range && (
                            <Presets
                                zone={zone}
                                activeTab={activeTab}
                                range={range}
                                onRangeDateClick={this.props.onRangeDateClick}
                            />
                        )}
                    </React.Fragment>
                )}
                <Calendar
                    from={from}
                    to={to}
                    min={min}
                    max={max}
                    zone={zone}
                    activeTab={activeTab}
                    pick={pick}
                    range={range}
                    scrollCalendar={scrollCalendar}
                    onDateClick={this.props.onDateClick}
                    onRangeDateClick={this.props.onRangeDateClick}
                />
                {showApply && (
                    <div className={b('apply-btn')}>
                        <Button view="action" size="l" width="max" onClick={this.props.onSubmit}>
                            {i18n('apply_button_text')}
                        </Button>
                    </div>
                )}
            </div>
        );
    }
}
