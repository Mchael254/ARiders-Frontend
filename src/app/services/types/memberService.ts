export interface ChangeMemberRoleResponse {
    success: boolean;
    message: string;
    data?: {
        member_id: string;
        email: string;
        first_name: string;
        last_name: string;
        previous_role: string;
        new_role: string;
        role_name: string;
        changed_by: string;
        changed_at: string;
    };
    error_code?: string;
    current_role?: string;
    requested_role?: string;
    authorizer_status?: string;
    authorizer_role?: string;
}

export interface MemberRecordsResponse {
    success: boolean;
    data?: {
        member_info: {
            id: string;
            first_name: string;
            last_name: string;
            email: string;
            phone_number: string;
            membership_status: string;
            membership_contribution: number;
            joined: string;
            dob: string;
            gender: string;
            city: string;
            county: string;
            current_role: string;
            role_start_date: string;
        };
        role_history: Array<{
            role_name: string;
            role_description: string;
            start_date: string;
            end_date: string | null;
            status: string;
            duration_days: number;
        }>;
        membership_history: Array<{
            status: string;
            start_date: string;
            end_date: string | null;
            duration_days: number;
            is_current: boolean;
        }>;
    };
    message?: string;
    error_code?: string;
}

export interface Role {
    value: string;
    label: string;
}

export interface ChangeMemberRoleRequest {
    authorizer_id: string;
    member_authorized_id: string;
    role_id: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface updateRolePayload {
    authorizer_id: string | null,
    member_authorized_id: string,
    role_id: string
}