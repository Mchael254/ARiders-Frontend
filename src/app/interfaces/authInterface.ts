export interface signupForm {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
}

export interface guestSignupForm extends signupForm {
    role?: string | null; // Optional role field for guest signup
}

export interface loginForm {
    password: string;
    email: string;
}
