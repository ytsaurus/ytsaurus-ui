import React, {type ComponentProps, type VFC} from 'react';
import type cn from 'bem-cn-lite';
import {Checkbox} from '@gravity-ui/uikit';

import RadioButton from '../../../../../../components/RadioButton/RadioButton';
import Dropdown from '../../../../../../components/Dropdown/Dropdown';
import Button from '../../../../../../components/Button/Button';
import Icon from '../../../../../../components/Icon/Icon';

import i18n from '../i18n';

import {
    cellSizeRadioButtonItems,
    pageSizeRadioButtonItems,
} from '../../../../../../constants/navigation/content/table';

interface Props {
    block: ReturnType<typeof cn>;
    pageSize: 10 | 50 | 100 | 200;
    cellSize: 1024 | 16384 | 32768 | 65536;
    allowRawStrings: boolean;
    changePageSize(pageSize: number): void;
    changeCellSize(cellSize: number): void;
    setTableDisplayRawStrings(value: boolean): void;
}

export const SettingsButtonBase: VFC<Props> = ({
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
                <Button size="m" title={i18n('title_settings')}>
                    <Icon awesome="cog" face="solid" size={13} />
                </Button>
            }
            template={
                <div className={block('settings-modal')}>
                    <div className="elements-form__label">{i18n('field_rows-per-page')}</div>
                    <div className="elements-form__field">
                        <RadioButton {...pageSizeProps} />
                    </div>
                    <div className="elements-form__label">{i18n('field_cell-size-limit')}</div>
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
                            {i18n('action_allow-raw-strings')}
                        </Checkbox>
                    </div>
                </div>
            }
        />
    );
};
