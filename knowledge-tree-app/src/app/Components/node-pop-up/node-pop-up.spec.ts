import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodePopUp } from './node-pop-up';

describe('NodePopUp', () => {
  let component: NodePopUp;
  let fixture: ComponentFixture<NodePopUp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodePopUp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodePopUp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
