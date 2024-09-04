import {ThunkAction} from 'redux-thunk';

import CancelHelper, {isCancelled} from '../../../utils/cancel-helper';
import {wrapApiPromiseByToaster} from '../../../utils/utils';
import {ChytCliqueOptionsAction} from '../../reducers/chyt/options';
import {RootState} from '../../reducers';
import {getCluster} from '../../selectors/global';
import {isDeveloper} from '../../selectors/global/is-developer';
import {
    StrawberryListAttributes,
    StrawberryListResponseItem,
    chytApiAction,
} from '../../../utils/strawberryControllerApi';
import {CHYT_OPTIONS} from '../../../constants/chyt-page';
import {chytCliqueLoad} from './clique';
import {chytLoadCliqueSpeclet} from './speclet';

type OptionsThunkAction = ThunkAction<Promise<void>, RootState, unknown, ChytCliqueOptionsAction>;

const cancelHelper = new CancelHelper();

export function chytLoadCliqueOptions(
    alias: string,
    showTooltipError?: boolean,
): OptionsThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const cluster = getCluster(state);
        const isAdmin = isDeveloper(state);
        dispatch({type: CHYT_OPTIONS.REQUEST, data: {dataAlias: alias}});

        return wrapApiPromiseByToaster(
            chytApiAction(
                'describe_options',
                cluster,
                {alias},
                {
                    isAdmin,
                    cancelToken: cancelHelper.removeAllAndGenerateNextToken(),
                    skipErrorToast: true,
                },
            ),
            {
                toasterName: 'chytLoadCliqueOptions_' + alias,
                skipSuccessToast: true,
                skipErrorToast: !showTooltipError,
            },
        )
            .then((data) => {
                dispatch({type: CHYT_OPTIONS.SUCCESS, data: {data: data.result, dataAlias: alias}});
            })
            .catch((error) => {
                if (!isCancelled(error)) {
                    dispatch({type: CHYT_OPTIONS.FAILURE, data: {error}});
                }
            });
    };
}

export function chytEditOptions(
    alias: string,
    options: Required<StrawberryListResponseItem>['$attributes'],
): OptionsThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const cluster = getCluster(state);
        const isAdmin = isDeveloper(state);

        const options_to_remove: Array<StrawberryListAttributes> = [];
        const options_to_set: typeof options = {};

        Object.keys(options).forEach((k) => {
            const key = k as StrawberryListAttributes;
            if (options[key] === undefined) {
                options_to_remove.push(key);
            } else {
                options_to_set[key] = options[key] as any;
            }
        });

        return chytApiAction(
            'edit_options',
            cluster,
            {alias, options_to_set, options_to_remove},
            {isAdmin},
        ).then(() => {
            dispatch(chytLoadCliqueOptions(alias));
            dispatch(chytCliqueLoad(alias));
            dispatch(chytLoadCliqueSpeclet(alias));
        });
    };
}
