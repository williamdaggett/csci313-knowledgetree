import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeEditor } from './tree-editor';

describe('TreeEditor', () => {
  let component: TreeEditor;
  let fixture: ComponentFixture<TreeEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeEditor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreeEditor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
