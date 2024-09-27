import Cookies from 'js-cookie';
import moment from 'moment';

const getCookiesClusterName = (cluster: string) => `override_${cluster}_maintenance`;

export function setMaintenanceIgnored(cluster: string) {
    const name = getCookiesClusterName(cluster);

    Cookies.set(name, cluster, {
        expires: moment().add(3, 'hours').toDate(),
    });
}

export function isMaintenanceIgnored(cluster: string) {
    const name = getCookiesClusterName(cluster);

    return Cookies.get(name) === cluster;
}
