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

// Guest Panel Interfaces
export interface GuestPanelState {
  currentView: string;
  viewData: GuestViewDataMap;
}

export const initialGuestPanelState: GuestPanelState = {
  currentView: 'dashboard',
  viewData: {}
};

export interface GuestViewDataMap {
  dashboard?: any;
  events?: any;
  profile?: any;
  registrations?: any;
  [key: string]: any;
}