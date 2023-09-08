import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {getOdinOverviewShowCreatePresetDialog} from '../_selectors/odin-overview';
import {YTDFDialog} from '../../../components/Dialog/Dialog';
import {odinOverviewAddPreset, odinOverviewShowCreatePresetDialog} from '../_actions/odin-overview';
import {getSettingOdinOverviewVisiblePresets} from '../_selectors';

export default function OdinOverviewCreatePresetDialog() {
    const dispatch = useDispatch();

    const visible = useSelector(getOdinOverviewShowCreatePresetDialog);

    const closeDialog = () => dispatch(odinOverviewShowCreatePresetDialog(false));

    const presets = useSelector(getSettingOdinOverviewVisiblePresets);
    const validateName = React.useCallback(
        (name: string) => {
            for (let i = 0; i < presets.length; ++i) {
                if (name === presets[i].name) {
                    return 'The name must be unique';
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
                title: 'Create preset',
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
                    caption: 'Preset name',
                    required: true,
                    validator: validateName,
                },
                {
                    name: 'isDefault',
                    type: 'tumbler',
                    caption: 'Use as default',
                },
            ]}
        />
    );
}
