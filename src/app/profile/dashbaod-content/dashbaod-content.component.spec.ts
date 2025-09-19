import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashbaodContentComponent } from './dashbaod-content.component';

describe('DashbaodContentComponent', () => {
  let component: DashbaodContentComponent;
  let fixture: ComponentFixture<DashbaodContentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashbaodContentComponent]
    });
    fixture = TestBed.createComponent(DashbaodContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
