import type {ThunkAction} from 'redux-thunk';
import map_ from 'lodash/map';
import hammer from '../../../common/hammer';
import {
    CHAOS_BUNDLES_EDITOR_LOAD_FAILURE,
    CHAOS_BUNDLES_EDITOR_LOAD_REQUREST,
    CHAOS_BUNDLES_EDITOR_LOAD_SUCCESS,
    CHAOS_BUNDLES_EDITOR_PARTIAL,
} from '../../../constants/tablets';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import type {RootState} from '../../../store/reducers';
import type {ChaosCellBundleEditorAction} from '../../../store/reducers/chaos_cell_bundles/tablet-cell-bundle-editor';
import {wrapApiPromiseByToaster} from '../../../utils/utils';
import {prepareSetCommandForBatch} from '../../../utils/cypress-attributes';
// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

type ChaosCellBundleEditorThunkAction = ThunkAction<
    any,
    RootState,
    any,
    ChaosCellBundleEditorAction
>;

export function showChaosCellBundleEditor(bundleName: string): ChaosCellBundleEditorThunkAction {
    return (dispatch) => {
        dispatch({type: CHAOS_BUNDLES_EDITOR_LOAD_REQUREST});

        dispatch({
            type: CHAOS_BUNDLES_EDITOR_PARTIAL,
            data: {bundleName, visibleEditor: true},
        });

        return ytApiV3Id
            .get(YTApiId.chaosCellBundlesEditData, {
                path: `//sys/chaos_cell_bundles/${bundleName}`,
                attributes: ['resource_usage', 'resource_limits', 'options', 'abc'],
            })
            .then((data: object) => {
                dispatch({
                    type: CHAOS_BUNDLES_EDITOR_LOAD_SUCCESS,
                    data: {data},
                });
            })
            .catch((e: any) => {
                dispatch({
                    type: CHAOS_BUNDLES_EDITOR_LOAD_FAILURE,
                    data: e,
                });
            });
    };
}

export function hideChaosCellBundleEditor(): ChaosCellBundleEditorThunkAction {
    return (dispatch) => {
        dispatch({
            type: CHAOS_BUNDLES_EDITOR_PARTIAL,
            data: {bundleName: undefined, loaded: true, visibleEditor: false},
        });
    };
}

export type BundleResourceType = 'tablet_count' | 'tablet_static_memory';

export function setBundleQuota(params: {
    bundleName: string;
    resourceType: BundleResourceType;
    limit: number;
}): ChaosCellBundleEditorThunkAction {
    return (dispatch) => {
        const {bundleName, resourceType, limit} = params;

        const resource = hammer.format['Readable'](resourceType);

        return wrapApiPromiseByToaster(
            yt.v3.set(
                {
                    path: `//sys/chaos_cell_bundles/${bundleName}/@resource_limits/${resourceType}`,
                },
                limit,
            ),
            {
                toasterName: `edit_bundle_${bundleName}`,
                successContent: `Set quota limit for ${resource}`,
                errorContent: `Cannot set quota limit for ${resource}`,
            },
        ).then(() => {
            dispatch(showChaosCellBundleEditor(bundleName));
        });
    };
}

export interface EditBundleParams {
    attributes: {
        abc?: {
            id: number;
            slug: string;
        };
    };
    options: {
        changelog_account?: string;
        snapshot_account?: string;
    };
}

export function setBunndleAttributes(
    bundle: string,
    attrs: Partial<EditBundleParams>,
): ChaosCellBundleEditorThunkAction {
    return (dispatch) => {
        console.log(attrs);
        const {attributes, options} = attrs;

        const bundlePath = `//sys/chaos_cell_bundles/${bundle}`;

        return wrapApiPromiseByToaster(
            ytApiV3Id.executeBatch(YTApiId.chaosCellBundlesSetAttrs, {
                requests: [
                    ...map_(attributes, (v, key) =>
                        prepareSetCommandForBatch(`${bundlePath}/@${key}`, v),
                    ),
                    ...map_(options, (v, key) =>
                        prepareSetCommandForBatch(`${bundlePath}/@options/${key}`, v),
                    ),
                ],
            } as any),
            {
                toasterName: `update-bundle_${bundle}`,
                successContent: `${bundle} successfully updated`,
                errorContent: `${bundle} cannot be updated`,
                isBatch: true,
                errorTitle: 'Failed to update bundle configuration',
            },
        ).then(() => {
            dispatch(showChaosCellBundleEditor(bundle));
        });
    };
}
