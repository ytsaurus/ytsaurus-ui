import {QueryEngine} from '../../../../shared/constants/engines';
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

type ClusterAndPath = {
    cluster: string | null;
} & Path;

type Props = (rawPath: string, engine: QueryEngine) => ClusterAndPath[];

export const getClustersAndPaths: Props = (rawPath, engine) => {
    const pathMatches = [...rawPath.matchAll(/`(\/\/([^`]*)?)`/g)];

    if (pathMatches.length === 0) {
        return [];
    }

    return pathMatches.map((pathMatch) => {
        const start = pathMatch.index ? pathMatch.index + 1 : 0;
        const textBeforePath = rawPath.slice(0, pathMatch.index);
        const clusterMatches = [...textBeforePath.matchAll(/(\w+)\.$/g)];
        let cluster =
            clusterMatches.length > 0 ? clusterMatches[clusterMatches.length - 1][1] : null;

        if (!cluster || engine === QueryEngine.SPYT) {
            const state = getWindowStore().getState();
            cluster = state.queryTracker.query?.draft?.settings?.cluster || null;
        }

        return {
            path: pathMatch[1],
            position: {
                start,
                end: start + pathMatch[0].length,
            },
            cluster,
        };
    });
};
