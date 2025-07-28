import {isIdmAclAvailable} from '../config';

export const getExternalSystem = (ldap: boolean, idm: boolean) => {
    const hasIdm = idm && isIdmAclAvailable();

    if (ldap) return 'ldap';
    if (hasIdm) return 'idm';
    return '-';
};
