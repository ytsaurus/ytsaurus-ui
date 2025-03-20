import {QueryEngine} from '../../../pages/query-tracker/module/engines';
import {getWindowStore} from '../../../store/window-store';

type Path =
    | {
          path: string;
          position: {
              start: number;
              end: number;
          };
      }
    | {path: null; position: null};

type Props = (
    rawPath: string,
    engine: QueryEngine,
) => {
    cluster: string | null;
} & Path;

export const getClusterAndPath: Props = (rawPath, engine) => {
    const pathMatch = [...rawPath.matchAll(/`(\/\/([^`]*))`/g)][0];

    let pathData: Path = {path: null, position: null};
    if (pathMatch) {
        const start = pathMatch.index ? pathMatch.index + 1 : 0;
        pathData = {
            path: pathMatch[1],
            position: {
                start,
                end: start + pathMatch[0].length,
            },
        };
    }

    const clusterMatch = [...rawPath.matchAll(/(\w+)\./g)][0];
    let cluster = clusterMatch ? clusterMatch[1] : null;

    if (!cluster || engine === QueryEngine.SPYT) {
        const state = getWindowStore().getState();
        cluster = state.queryTracker.query?.draft.settings?.cluster || null;
    }

    return {
        ...pathData,
        cluster,
    };
};
