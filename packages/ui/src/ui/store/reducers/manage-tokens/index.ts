import {combineReducers} from 'redux';
import modal from './modal';
import tokens from './tokens';

export const manageTokens = combineReducers({tokens, modal});
