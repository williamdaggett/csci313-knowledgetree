import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeContentList } from './node-content-list';

describe('NodeContentList', () => {
  let component: NodeContentList;
  let fixture: ComponentFixture<NodeContentList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeContentList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodeContentList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
