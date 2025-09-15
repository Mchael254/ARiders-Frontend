import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, Observable, Subject, take, takeUntil } from 'rxjs';
import { AuthState } from '../store/auth/auth.reducer';
import { select, Store } from '@ngrx/store';
import { PaymentService } from '../services/payment/payment.service';
import { ToastrService } from 'ngx-toastr';
import * as AuthActions from '../store/auth/auth.actions';
import { selectUser } from '../store/auth/auth.selector';
import { localStorageSyncReducer } from '../store';
import { UserService } from '../services/members/user.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { RegistrationService } from '../services/registration/registration.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit, OnDestroy {
  activationForm: FormGroup;
  activationSuccess = false;
  currentStatus = 'Not Member Yet';
  roleActivated = false;
  profileId: any
  private destroy$ = new Subject<void>();
  paymentTypeId: string = "";
  paymentTypeMap: { [key: string]: string } = {};
  showPaymentModal = false;
  profile$: Observable<AuthState>;
  registrationAmount: number | null = null;
  currentPaymentTypeName: string = '';

  constructor(
    private fb: FormBuilder,
    private store: Store<{ auth: AuthState }>,
    private paymentService: PaymentService,
    private toastr: ToastrService,
    private userService: UserService,
    private spinner: NgxSpinnerService,
    private registrationService: RegistrationService
  ) {
    this.profile$ = this.store.pipe(select('auth'));
    this.activationForm = this.fb.group({
      agreeTerms: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    this.paymentService.getAllPaymentTypes().subscribe(types => {
      this.paymentTypeMap = types.reduce((acc, type) => {
        acc[type.name.toLowerCase()] = type.id;
        return acc;
      }, {} as { [key: string]: string });
    });

    this.profile$
      .pipe(takeUntil(this.destroy$))
      .subscribe((profile) => {
        const id = profile.user?.id;

        if (id) {
          this.profileId = id;
          this.refreshUserProfile();
        }
      });
  }

  roleActivate(): void {
    this.roleActivated = true;
    this.activationSuccess = true;
    this.currentStatus = 'Active Member';
  }

  checkRoleActivated(): void {
    if (this.roleActivated) {
      this.roleActivate();
    } else {
      this.currentStatus = 'Not Member Yet';
    }
  }

  openPaymentModalFor(typeName: string): void {
    const id = this.paymentTypeMap[typeName.toLowerCase()];
    if (!id) {
      this.toastr.error(`Payment type "${typeName}" not found`);
      return;
    }

    this.paymentTypeId = id;
    
    this.currentPaymentTypeName = this.capitalizeFirst(typeName);

    if (typeName.toLowerCase() === 'registration') {
      this.registrationService.getRegistrationAmount().subscribe({
        next: (amount) => {
          this.registrationAmount = amount;
          this.showPaymentModal = true;
        },
        error: () => {
          this.toastr.error("Failed to fetch registration amount");
          this.showPaymentModal = true; 
        }
      });
    } else {
      this.showPaymentModal = true;
    }
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  handlePaymentSuccess(): void {
    this.toastr.success("Membership payment successful");
  }

  refreshUserProfile(): void {
    this.spinner.show();

    const memberId = this.profileId;
    console.log("profile id", memberId);

    this.userService.getUserProfile(memberId).subscribe({
      next: (res) => {
        this.roleActivated = res?.member.role_activated;
        this.checkRoleActivated();
        this.spinner.hide();
      },
      error: (error) => {
        console.log(error);
        this.toastr.error("Failed to refresh user profile");
        this.spinner.hide();
      }
    });
  }

  newMember(): void {
    this.store.dispatch(AuthActions.logout());
  }

  onPaymentClosed(): void {
    this.showPaymentModal = false;
    this.refreshUserProfile();
    this.currentPaymentTypeName = '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
