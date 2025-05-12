import React from 'react';

import {GeneralCell} from '../../../../../../../pages/dashboard2/Dashboard/components/GeneralCell/GeneralCell';

export function General({name, url}: {name: string; url: string}) {
    return <GeneralCell name={name} url={url} />;
}
