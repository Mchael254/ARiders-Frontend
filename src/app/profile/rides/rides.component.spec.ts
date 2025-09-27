import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RidesComponent } from './rides.component';

describe('RidesComponent', () => {
  let component: RidesComponent;
  let fixture: ComponentFixture<RidesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RidesComponent]
    });
    fixture = TestBed.createComponent(RidesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
