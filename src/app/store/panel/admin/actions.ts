import { createAction, props } from '@ngrx/store';

export const setAdminPanelView = createAction(
  '[Panel] Set View',
  props<{ view: string, data?: any }>()
);