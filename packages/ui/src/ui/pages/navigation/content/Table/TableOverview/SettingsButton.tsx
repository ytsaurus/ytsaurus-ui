import React, {ComponentProps, VFC} from 'react';
import {ConnectedProps, connect} from 'react-redux';
import type cn from 'bem-cn-lite';
import {Checkbox} from '@gravity-ui/uikit';

import RadioButton from '../../../../../components/RadioButton/RadioButton';
import Dropdown from '../../../../../components/Dropdown/Dropdown';
import Button from '../../../../../components/Button/Button';
import Icon from '../../../../../components/Icon/Icon';

import {
    cellSizeRadioButtonItems,
    pageSizeRadioButtonItems,
} from '../../../../../constants/navigation/content/table';
import {
    changeCellSize,
    changePageSize,
} from '../../../../../store/actions/navigation/content/table/table';
import {getCellSize, getPageSize} from '../../../../../store/selectors/navigation/content/table-ts';
import {getSettingTableDisplayRawStrings} from '../../../../../store/selectors/settings';
import {setTableDisplayRawStrings} from '../../../../../store/actions/settings/settings';
import type {RootState} from '../../../../../store/reducers';

interface Props extends ConnectedProps<typeof connector> {
    block: ReturnType<typeof cn>;
}

const SettingsButton: VFC<Props> = ({
    block,
    pageSize,
    changePageSize,
    cellSize,
    changeCellSize,
    allowRawStrings,
    setTableDisplayRawStrings,
}) => {
    const stringLimitProps: ComponentProps<typeof RadioButton> = {
        size: 'm',
        name: 'table-string-limit',
        value: String(cellSize),
        items: cellSizeRadioButtonItems,
        onChange(evt) {
            const value = Number(evt.target.value);
            changeCellSize(value);
        },
    };

    const pageSizeProps: ComponentProps<typeof RadioButton> = {
        size: 'm',
        name: 'table-page-size',
        value: String(pageSize),
        items: pageSizeRadioButtonItems,
        onChange(evt) {
            const value = Number(evt.target.value);
            changePageSize(value);
        },
    };

    return (
        <Dropdown
            trigger="click"
            className={block('settings')}
            button={
                <Button size="m" title="settings">
                    <Icon awesome="cog" face="solid" />
                </Button>
            }
            template={
                <div className={block('settings-modal')}>
                    <div className="elements-form__label">Rows per page</div>
                    <div className="elements-form__field">
                        <RadioButton {...pageSizeProps} />
                    </div>
                    <div className="elements-form__label">Cell size limit</div>
                    <div className="elements-form__field">
                        <RadioButton {...stringLimitProps} />
                    </div>
                    <div className="elements-form__field">
                        <Checkbox
                            checked={allowRawStrings}
                            onChange={(evt) => {
                                setTableDisplayRawStrings(evt.target.checked);
                            }}
                        >
                            Allow raw strings
                        </Checkbox>
                    </div>
                </div>
            }
        />
    );
};

const mapStateToProps = (state: RootState) => {
    const {isFullScreen} = state.navigation.content.table;
    const pageSize = getPageSize(state);
    const cellSize = getCellSize(state);

    const allowRawStrings = getSettingTableDisplayRawStrings(state);

    return {pageSize, cellSize, isFullScreen, allowRawStrings};
};

const mapDispatchToProps = {
    changePageSize,
    changeCellSize,
    setTableDisplayRawStrings,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(SettingsButton);
