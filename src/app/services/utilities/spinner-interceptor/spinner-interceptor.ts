import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, map, Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HttpRequestInterceptor implements HttpInterceptor {

    constructor(private spinnner:NgxSpinnerService, private toastr:ToastrService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.spinnner.show()
        return next.handle(req).pipe(
            map((event:HttpEvent<any>) => {
                if (event instanceof HttpResponse){
                    this.toastr.success('request successful')

                }
                return event;
            }),
            catchError((error:HttpErrorResponse) => {
                return throwError(error);
            }),
            finalize(() => {
                this.spinnner.hide();
            })
        )
    }


}