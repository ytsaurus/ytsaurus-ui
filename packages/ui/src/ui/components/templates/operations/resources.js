import templates from '../../../components/templates/utils';
import hammer from '../../../common/hammer';

templates.add('operations/detail/resources/intermediate', {
    account(item, column) {
        return hammer.format['ValueOrDefault'](item[column]);
    },
    chunk_count(item, column) {
        return hammer.format['Number'](item[column]);
    },
    node_count(item, column) {
        return hammer.format['Number'](item[column]);
    },
    disk_space(item, column) {
        return hammer.format['Bytes'](item[column]);
    },
});
