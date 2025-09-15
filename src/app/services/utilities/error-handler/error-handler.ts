import { HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";

export function handleError(error: HttpErrorResponse): Observable<never> {
  let errorMessage = 'An unknown error occurred';

  if (error.error instanceof ErrorEvent) {
    errorMessage = `Client Error: ${error.error.message}`;
  } else {
    errorMessage = error.error?.message || `Server Error: ${error.status} ${error.statusText}`;
  }

  console.error('HTTP Error:', errorMessage);
  return throwError(() => new Error(errorMessage));
}