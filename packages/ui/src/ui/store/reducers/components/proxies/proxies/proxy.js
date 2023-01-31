import ypath from '../../../../../common/thor/ypath';

export default class Proxy {
    constructor(data) {
        // data comes in format like in /hosts/all, not like //sys/proxies
        this.name = data.name;
        this.host = data.name;
        this.state = data.dead ? 'offline' : 'online';
        this.effectiveState = this.banned ? 'banned' : this.state;

        this.banned = ypath.getBoolean(data, '/banned') || false;
        this.banMessage = ypath.getValue(data, '/ban_message') || '';
        this.role = ypath.getValue(data, '/role');
        this.version = ypath.getValue(data, '/version');
        this.physicalHost = ypath.getValue(data, '/annotations/physical_host');
        this.liveness = ypath.getValue(data, '/liveness');

        this.loadAverage = ypath.getValue(this.liveness, '/load_average');
        this.updatedAt = ypath.getValue(this.liveness, '/updated_at');
        this.networkLoad = ypath.getValue(this.liveness, '/network_coef');
    }

    static ATTRIBUTES = ['ban_message', 'banned', 'liveness', 'role', 'version', 'annotations'];
}
