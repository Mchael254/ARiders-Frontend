import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembershippComponent } from './membershipp.component';

describe('MembershippComponent', () => {
  let component: MembershippComponent;
  let fixture: ComponentFixture<MembershippComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MembershippComponent]
    });
    fixture = TestBed.createComponent(MembershippComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
