import {TokenFormState} from '../AddQueryTokenForm.reducer';
import {YT} from '../../../../config/yt-config';
import {getClusterProxy} from '../../../../store/selectors/global';
import {ytApiV3} from '../../../../rum/rum-wrap-api';
import {QueryToken} from '../../../../../shared/constants/settings-types';

type ValidationResult =
    | {valid: true; errors?: undefined}
    | {valid: false; errors: TokenFormState['errors']};

type Props = (token: QueryToken, tokens: QueryToken[]) => Promise<ValidationResult>;

export const validateToken: Props = async ({name, path, cluster}, tokens) => {
    const errors = {
        name: !name?.trim() ? 'Name is required' : '',
        cluster: !cluster?.trim() ? 'Cluster is required' : '',
        path: !path?.trim() ? 'Path is required' : '',
    };

    if (tokens.some((token) => token.name === name)) {
        errors.name = 'Name already exists';
    }

    if (Object.values(errors).some((error) => error)) {
        return {valid: false, errors};
    }

    const trimmedPath = path.trim();
    const clusterConfig = YT.clusters[cluster];

    try {
        const apiSetup = {setup: {proxy: getClusterProxy(clusterConfig)}};
        const exists = await ytApiV3.exists({...apiSetup, parameters: {path: trimmedPath}});
        if (!exists) {
            return {valid: false, errors: {...errors, path: 'Path does not exist'}};
        }
    } catch (error) {
        return {valid: false, errors: {...errors, path: (error as Error).message}};
    }

    return {valid: true};
};
