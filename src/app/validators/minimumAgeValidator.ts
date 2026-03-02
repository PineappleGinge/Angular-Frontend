import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function minimumAgeValidator(minAge: number) : ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const inputDate = new Date(control.value);
    const today = new Date();
    const minDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());

    if (isNaN(inputDate.getTime())) {
      return { invalidDate: true };
    }

    if (inputDate > minDate) {
      return { tooYoung: { requiredAge: minAge, actualAgeDate: inputDate } };
    }

    return null;
  };
}
