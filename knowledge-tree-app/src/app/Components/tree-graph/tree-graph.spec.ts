import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeGraph } from './tree-graph';

describe('TreeGraph', () => {
  let component: TreeGraph;
  let fixture: ComponentFixture<TreeGraph>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeGraph]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreeGraph);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
