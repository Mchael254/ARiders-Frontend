import { createAction, props } from '@ngrx/store';

export const setGuestPanelView = createAction(
    '[Guest Panel] Set View',
    props<{ view: string, data?: any }>()
);
