import ypath from '../../../../../common/thor/ypath';

export default class Proxy {
    constructor(data) {
        // data comes in format like in /hosts/all, not like //sys/http_proxies
        this.name = data.name;
        this.host = data.name;
<<<<<<< Updated upstream
        this.state = data.dead ? 'offline' : 'online';
=======
        this.state = data?.state ? data.state : data.dead ? 'offline' : 'online';
>>>>>>> Stashed changes
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
        'state',
        'annotations',
        'maintenance_requests',
    ];
}
