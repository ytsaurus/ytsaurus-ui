import {reactHooksModule} from '@reduxjs/toolkit/query/react';
import {Api, CoreModule} from '@reduxjs/toolkit/query';
import {ytModule} from '../types';

export type ApiModules =
    | CoreModule
    | ReturnType<typeof reactHooksModule>['name']
    | ReturnType<typeof ytModule>['name'];

export type AnyApi = Api<any, any, any, any, ApiModules>;
