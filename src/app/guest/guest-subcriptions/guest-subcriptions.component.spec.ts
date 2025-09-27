import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestSubcriptionsComponent } from './guest-subcriptions.component';

describe('GuestSubcriptionsComponent', () => {
  let component: GuestSubcriptionsComponent;
  let fixture: ComponentFixture<GuestSubcriptionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GuestSubcriptionsComponent]
    });
    fixture = TestBed.createComponent(GuestSubcriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
