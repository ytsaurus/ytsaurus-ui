import {connect} from 'react-redux';

import {ChaosBundleEditorDialog} from '../../../../pages/chaos_cell_bundles/bundles/ChaosBundleEditorDialog/ChaosBundleEditorDialog';
import {
    hideChaosCellBundleEditor,
    setBundleQuota,
    setBunndleAttributes,
} from '../../../../store/actions/chaos_cell_bundles/tablet-cell-bundle-editor';
import type {RootState} from '../../../../store/reducers';
import {getChaosCellBundleEditorData} from '../../../../store/selectors/chaos_cell_bundles/tablet-cell-bundle-editor';

const mapStateToProps = (state: RootState) => {
    return {
        bundleEditorData: getChaosCellBundleEditorData(state),
    };
};

const mapDispatchToProps = {
    hideBundleEditor: hideChaosCellBundleEditor,
    setBundleQuota,
    setBunndleAttributes,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(ChaosBundleEditorDialog);
