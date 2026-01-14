import {TConnection, TPoint} from '@gravity-ui/graph';

export type MultipointConnection = TConnection & {
    points?: TPoint[];
};
