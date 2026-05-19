import i18n from './i18n';

import {type ChytInfo} from '../../../store/reducers/chyt/list';

export const CHYT_TABLE_TITLES = {
    get alias() {
        return i18n('field_alias');
    },
    get pool() {
        return i18n('field_pool');
    },
    get creator() {
        return i18n('field_creator');
    },
    get creation_time() {
        return i18n('field_creation_time');
    },
    get health() {
        return i18n('field_health');
    },
    get health_reason() {
        return i18n('field_health_reason');
    },
    get instance_count() {
        return i18n('field_instance_count');
    },
    get speclet_modification_time() {
        return i18n('field_speclet_modification_time');
    },
    get stage() {
        return i18n('field_stage');
    },
    get state() {
        return i18n('field_state');
    },
    get strawberry_state_modification_time() {
        return i18n('field_strawberry_state_modification_time');
    },
    get total_cpu() {
        return i18n('field_total_cpu');
    },
    get total_memory() {
        return i18n('field_total_memory');
    },
    get yt_operation_id() {
        return i18n('field_yt_operation_id');
    },
    get yt_operation_finish_time() {
        return i18n('field_yt_operation_finish_time');
    },
    get yt_operation_start_time() {
        return i18n('field_yt_operation_start_time');
    },
} satisfies Record<keyof ChytInfo, string>;
