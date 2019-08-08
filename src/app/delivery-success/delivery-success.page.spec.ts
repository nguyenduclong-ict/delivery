import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliverySuccessPage } from './delivery-success.page';

describe('DeliverySuccessPage', () => {
  let component: DeliverySuccessPage;
  let fixture: ComponentFixture<DeliverySuccessPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeliverySuccessPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliverySuccessPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
