import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function uniquePhoneNumbersValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control as any;
    const phoneNumbers = [
      formGroup.get('phone_number')?.value,
      formGroup.get('emergency_phone')?.value,
      formGroup.get('work_phone')?.value
    ].filter(num => num); 

    const hasDuplicates = new Set(phoneNumbers).size !== phoneNumbers.length;
    
    return hasDuplicates ? { duplicateNumbers: true } : null;
  };
}