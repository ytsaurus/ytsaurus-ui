/* eslint-disable react/prop-types */
import React, {useState} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import {RangeInputPicker} from '../../../../../components/common/RangeInputPicker';
import Button from '../../../../../components/Button/Button';
import Filter from '../../../../../components/Filter/Filter';
import Icon from '../../../../../components/Icon/Icon';
import OffsetSelectorButton from '../../../../../pages/navigation/content/Table/TableOverview/OffsetSelectorButton';

import {
    selectOffsetValue,
    selectProgressWidth,
    selectRowCount,
} from '../../../../../store/selectors/navigation/content/table';
import {selectIsDynamic} from '../../../../../store/selectors/navigation/content/table-ts';
import {moveOffset} from '../../../../../store/actions/navigation/content/table/pagination';

import './TableOverview.scss';
import i18n from './i18n';

TableOverview.propTypes = {
    // from parent
    block: PropTypes.func.isRequired,

    // from connect
    isDynamic: PropTypes.bool.isRequired,
    rowCount: PropTypes.number.isRequired,
    progressWidth: PropTypes.string.isRequired,
    offsetValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    moveOffset: PropTypes.func.isRequired,
};

const renderInput = (props, {onEndEditing, onUpdate}) => {
    const {offsetValue, rowCount, isDynamic} = props;

    return isDynamic ? (
        <Filter
            iconLeft={<Icon awesome="key" size={13} />}
            onBlur={(v) => {
                onEndEditing();
                onUpdate(v);
            }}
            value={offsetValue}
            placeholder=""
            size="m"
            pin={'brick-clear'}
            hasClear={false}
        />
    ) : (
        <RangeInputPicker
            iconLeft={<Icon awesome="hashtag" size={13} />}
            onOutsideClick={onEndEditing}
            onAfterUpdate={onUpdate}
            onSubmit={onUpdate}
            maxValue={Math.max(0, rowCount - 1)}
            infoPointsCount={0}
            value={offsetValue}
            autoFocus
            size="m"
        />
    );
};

const renderPlaceholder = (props, handleStartEditing) => {
    const {block, isDynamic, offsetValue, progressWidth: width} = props;

    return (
        <div className={block('query-current')} onClick={handleStartEditing}>
            <Icon awesome={isDynamic ? 'key' : 'hashtag'} size={13} />
            {offsetValue || i18n('value_no-offset')}
            {!isDynamic && <div className={block('query-progress')} style={{width}} />}
        </div>
    );
};

function TableOverview(props) {
    const {block, moveOffset, isDynamic} = props;
    const [editing, changeEditing] = useState(false);

    const onUpdate = (value) => moveOffset(value);

    const onEndEditing = () => {
        changeEditing(false);
    };

    const onStartEditing = () => {
        changeEditing(true);
    };

    return (
        <div className={block('input', {edit: editing, dynamic: isDynamic})}>
            {isDynamic && <OffsetSelectorButton disabled={editing} />}
            {editing
                ? renderInput(props, {onEndEditing, onUpdate})
                : renderPlaceholder(props, onStartEditing)}
            {isDynamic && (
                <Button
                    size="m"
                    view="action"
                    title={i18n('action_confirm')}
                    pin="clear-round"
                    disabled={!editing}
                >
                    {i18n('action_confirm')}
                </Button>
            )}
        </div>
    );
}

const mapStateToProps = (state) => {
    const progressWidth = selectProgressWidth(state);
    const offsetValue = selectOffsetValue(state);
    const isDynamic = selectIsDynamic(state);
    const rowCount = selectRowCount(state);

    return {progressWidth, offsetValue, rowCount, isDynamic};
};

const mapDispatchToProps = {
    moveOffset,
};

export default connect(mapStateToProps, mapDispatchToProps)(TableOverview);
