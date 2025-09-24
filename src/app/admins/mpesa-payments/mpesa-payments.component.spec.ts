import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MpesaPaymentsComponent } from './mpesa-payments.component';

describe('MpesaPaymentsComponent', () => {
  let component: MpesaPaymentsComponent;
  let fixture: ComponentFixture<MpesaPaymentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MpesaPaymentsComponent]
    });
    fixture = TestBed.createComponent(MpesaPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
