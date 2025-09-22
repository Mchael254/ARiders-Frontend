import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestSigninComponent } from './guest-signin.component';

describe('GuestSigninComponent', () => {
  let component: GuestSigninComponent;
  let fixture: ComponentFixture<GuestSigninComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GuestSigninComponent]
    });
    fixture = TestBed.createComponent(GuestSigninComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
