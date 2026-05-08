import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeContentViewer } from './node-content-viewer';

describe('NodeContentViewer', () => {
  let component: NodeContentViewer;
  let fixture: ComponentFixture<NodeContentViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeContentViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodeContentViewer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
