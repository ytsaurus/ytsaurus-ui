import {QueryEngine} from '../../module/engines';
import {MonacoLanguage} from '../../../../constants/monaco';

export const getLanguageByEngine = (engine: QueryEngine): MonacoLanguage => {
    switch (engine) {
        case QueryEngine.CHYT:
            return MonacoLanguage.CHYT;
        case QueryEngine.SPYT:
            return MonacoLanguage.SPYT;
        case QueryEngine.YT_QL:
            return MonacoLanguage.YTQL;
        default:
            return MonacoLanguage.YQL;
    }
};
