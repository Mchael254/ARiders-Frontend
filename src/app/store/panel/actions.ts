import { createAction, props } from '@ngrx/store';

export const setPanelView = createAction(
  '[Panel] Set View',
  props<{ view: string, data?: any }>()
);
