import React from 'react';
import withLazyLoading from '../../hocs/withLazyLoading';

async function importDefaultSubjectLink() {
    return import(/* webpackChunkName: "default-subject-link" */ './DefaultSubjectLink');
}

export const DefaultSubjectLinkLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importDefaultSubjectLink()).DefaultSubjectCard};
    }),
);

export const SubjectNameLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importDefaultSubjectLink()).SubjectName};
    }),
);
