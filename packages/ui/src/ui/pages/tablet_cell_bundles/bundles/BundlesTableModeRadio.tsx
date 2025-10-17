import React from 'react';
import {useDispatch, useSelector} from '../../../store/redux-hooks';

import CustomRadioButton from '../../../components/RadioButton/RadioButton';
import type {setTabletsPartial} from '../../../store/actions/tablet_cell_bundles';
import type {BundlesTableMode} from '../../../store/reducers/tablet_cell_bundles';
import {getClusterUiConfigEnablePerBundleTabletAccounting} from '../../../store/selectors/global';

interface Props {
    bundlesTableMode: BundlesTableMode;
    setTabletsPartial: typeof setTabletsPartial;
    modes: BundlesTableMode[];
}

function BundlesTableModeRadio({bundlesTableMode: value, setTabletsPartial, modes}: Props) {
    const dispatch = useDispatch();

    const allowTabs = useSelector(getClusterUiConfigEnablePerBundleTabletAccounting);

    const handleChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            dispatch(setTabletsPartial({bundlesTableMode: e.target.value as any}));
        },
        [dispatch],
    );

    const modeItems = modes.map(CustomRadioButton.prepareSimpleValue);

    return !allowTabs ? null : (
        <CustomRadioButton items={modeItems} value={value} onChange={handleChange} />
    );
}

export default React.memo(BundlesTableModeRadio);
