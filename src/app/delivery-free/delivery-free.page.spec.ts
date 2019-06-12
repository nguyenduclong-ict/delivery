import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryFreePage } from './delivery-free.page';

describe('DeliveryFreePage', () => {
  let component: DeliveryFreePage;
  let fixture: ComponentFixture<DeliveryFreePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeliveryFreePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryFreePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
