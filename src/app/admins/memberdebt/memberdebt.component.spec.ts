import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberdebtComponent } from './memberdebt.component';

describe('MemberdebtComponent', () => {
  let component: MemberdebtComponent;
  let fixture: ComponentFixture<MemberdebtComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemberdebtComponent]
    });
    fixture = TestBed.createComponent(MemberdebtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
