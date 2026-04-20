import ypath from '../../../common/thor/ypath';
import {
    type MasterAddress,
    type MasterAlert,
    type MasterDataItem,
} from '../../reducers/system/masters';
import {type RootState} from '../../reducers';
import {getPathByMasterType} from '../../actions/system/masters';

export class MasterInstance {
    $attributes: {
        read_only?: boolean;
        voting?: boolean;
        warming_up?: boolean;
        state?: MasterAddress['state'] | MasterDataItem['state'];
        automaton_version?: string;
        committed_version?: string;
    };

    $rowAddress: MasterAddress;
    $address: string;
    $physicalAddress: string;
    $type: string;
    $cell?: number;
    $state: MasterAddress['state'];
    state?:
        | 'elections'
        | 'follower_recovery'
        | 'following'
        | 'leader_recovery'
        | 'leading'
        | 'stopped'
        | 'unknown';
    committedVersion?: string;

    constructor(address: MasterAddress, type: string, cell?: number) {
        this.$rowAddress = address;
        this.$address = address.host;
        this.$physicalAddress = address.physicalHost || address.host;
        this.$state = address.state;
        this.$type = type; // 'primary' | 'secondary' | 'provider'
        this.$cell = cell; // Cell tag
        this.$attributes = {};
    }
    toObject() {
        return {
            host: this.$address,
            physicalHost: this.$physicalAddress,
            type: this.$type,
            cellTag: this.$cell,
        };
    }
    clone() {
        return new MasterInstance(this.$rowAddress, this.$type, this.$cell);
    }

    getMaintenance() {
        return ypath.getValue(this.$rowAddress, '/attributes/maintenance');
    }

    getMaintenanceMessage() {
        return ypath.getValue(this.$rowAddress, '/attributes/maintenance_message');
    }

    getHost() {
        return ypath.getValue(this.$address, '');
    }

    getType() {
        return this.$type;
    }

    getPath() {
        return `${getPathByMasterType(this.getType(), this.$cell?.toString())}/${this.getHost()}`;
    }

    update(data: MasterInstance['$attributes'] = {}) {
        this.$attributes = data;
        this.state = ypath.getValue(this.$attributes, '/state') || 'unknown';

        const automatonVersion = ypath.getValue(this.$attributes, '/automaton_version');
        const committedVersion = ypath.getValue(this.$attributes, '/committed_version');

        this.committedVersion = automatonVersion || committedVersion;
        return this;
    }
}

export const selectMasterAlerts = (state: RootState): MasterAlert[] => state.system.masters.alerts;
