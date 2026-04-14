import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeContent } from './node-content';

describe('NodeContent', () => {
  let component: NodeContent;
  let fixture: ComponentFixture<NodeContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeContent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodeContent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
