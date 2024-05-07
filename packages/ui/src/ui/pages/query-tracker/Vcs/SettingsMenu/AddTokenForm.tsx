import React, {FC, useMemo, useState} from 'react';
import {SelectSingle} from '../../../../components/Select/Select';
import {Button, TextInput} from '@gravity-ui/uikit';
import {saveToken} from '../../module/vcs/actions';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';
import './AddTokenForm.scss';
import {selectVcsConfig} from '../../module/vcs/selectors';

const block = cn('add-token-form');

export const AddTokenForm: FC = () => {
    const dispatch = useDispatch();
    const [isSaving, setSaving] = useState(false);
    const [vcs, setVcs] = useState<string | undefined>();
    const [token, setToken] = useState('');
    const config = useSelector(selectVcsConfig);

    const handleSave = async () => {
        if (vcs && token) {
            try {
                setSaving(true);
                await dispatch(saveToken(vcs, token));
            } finally {
                setSaving(false);
                setVcs(undefined);
                setToken('');
            }
        }
    };

    const items = useMemo(() => {
        return config.map(({id, name}) => ({value: id, text: name}));
    }, [config]);

    return (
        <div className={block()}>
            <SelectSingle items={items} value={vcs} onChange={setVcs} hasClear placeholder="VCS" />
            <TextInput placeholder="token" value={token} onUpdate={setToken} hasClear />
            <Button view="action" onClick={handleSave} loading={isSaving}>
                Save
            </Button>
        </div>
    );
};
