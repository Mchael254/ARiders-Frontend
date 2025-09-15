export interface AdminPanelState {
  currentView: string;
  viewData: ViewDataMap;
  selectedMemberId: string | null;
}

export const initialAdminPanelState: AdminPanelState = {
  currentView: 'dashboard',
  viewData: {},
  selectedMemberId: null
};

export interface MemberDebtViewData {
  memberId: string;
  [key: string]: any;
}

export interface ViewDataMap {
  memberDebt?: MemberDebtViewData;
  dashboard?: any;
  members?: any;
  contributions?: any;
  debts?: any;
  reports?: any;
  settings?: any;
  events?: any;
  [key: string]: any;
}

export interface AdminPanelState {
  currentView: string;
  viewData: ViewDataMap;
  selectedMemberId: string | null;
}