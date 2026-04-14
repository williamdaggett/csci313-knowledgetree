import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeContentEditor } from './node-content-editor';

describe('NodeContentEditor', () => {
  let component: NodeContentEditor;
  let fixture: ComponentFixture<NodeContentEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeContentEditor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodeContentEditor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
