import {type YTError} from '../../../../@types/types';

export interface BundleCell {
    id: string;
    bundle: string;
    health: BundleHealth;
    memory: number;
    compressed: number;
    tablets: number;
    uncompressed: number;
    peerAddress: string;
    state: string;
    lastHydraRestartReason?: YTError;

    peer: BundleCellPeer;
    peers: Array<BundleCellPeer>;
}

export type BundleHealth = 'good' | 'failed' | 'initializing';

export interface BundleCellPeer {
    address: string;
    last_seen: string;
    state: string;
    last_hydra_restart_reason?: YTError;
}
