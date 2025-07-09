import { createAction, props } from "@ngrx/store";

export const setMemberPanelView = createAction(
  '[Panel] Set View',
  props<{ view: string, data?: any }>()
);