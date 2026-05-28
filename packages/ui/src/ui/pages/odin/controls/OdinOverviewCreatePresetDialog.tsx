import React from 'react';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {getOdinOverviewShowCreatePresetDialog} from '../_selectors/odin-overview';
import {YTDFDialog} from '../../../containers/Dialog';
import {odinOverviewAddPreset, odinOverviewShowCreatePresetDialog} from '../_actions/odin-overview';
import {getSettingOdinOverviewVisiblePresets} from '../_selectors';
import i18n from './i18n';

export default function OdinOverviewCreatePresetDialog() {
    const dispatch = useDispatch();

    const visible = useSelector(getOdinOverviewShowCreatePresetDialog);

    const closeDialog = () => dispatch(odinOverviewShowCreatePresetDialog(false));

    const presets = useSelector(getSettingOdinOverviewVisiblePresets);
    const validateName = React.useCallback(
        (name: string) => {
            for (let i = 0; i < presets.length; ++i) {
                if (name === presets[i].name) {
                    return i18n('alert_preset-name-must-be-unique');
                }
            }
            return undefined;
        },
        [presets],
    );

    return (
        <YTDFDialog
            visible={visible}
            headerProps={{
                title: i18n('title_create-preset'),
            }}
            onAdd={(form: any) => {
                const {name, isDefault} = form.getState().values;
                const res = dispatch(odinOverviewAddPreset(name, isDefault));
                return (res as any).then(closeDialog);
            }}
            onClose={closeDialog}
            initialValues={{
                name: '',
                asDefault: false,
            }}
            fields={[
                {
                    name: 'name',
                    type: 'text',
                    caption: i18n('field_preset-name'),
                    required: true,
                    validator: validateName,
                },
                {
                    name: 'isDefault',
                    type: 'tumbler',
                    caption: i18n('field_use-as-default'),
                },
            ]}
        />
    );
}
