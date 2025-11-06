import ypath from '../../../../../common/thor/ypath';
import format from '../../../../../common/hammer/format';

export default class Proxy {
    constructor(data) {
        // data comes in format like in /hosts/all, not like //sys/http_proxies
        this.name = data.name;
        this.host = data.name;

        let state = format.NO_VALUE;
        if (data?.state) {
            state = data.state;
        } else if (data.dead) {
            state = 'offline';
        } else {
            state = 'online';
        }

        this.state = state;
        this.effectiveState = this.banned ? 'banned' : this.state;

        this.banned = ypath.getBoolean(data, '/banned') || false;
        this.banMessage = ypath.getValue(data, '/ban_message') || '';
        this.role = ypath.getValue(data, '/role');
        this.version = ypath.getValue(data, '/version') || data?.version;
        this.physicalHost = ypath.getValue(data, '/annotations/physical_host');
        this.liveness = ypath.getValue(data, '/liveness');

        this.loadAverage = ypath.getValue(this.liveness, '/load_average');
        this.updatedAt = ypath.getValue(this.liveness, '/updated_at');
        this.networkLoad = ypath.getValue(this.liveness, '/network_coef');

        this.maintenanceRequests = ypath.getValue(data, '/maintenance_requests');
    }

    static ATTRIBUTES = [
        'ban_message',
        'banned',
        'liveness',
        'role',
        'version',
        'annotations',
        'maintenance_requests',
    ];
}
