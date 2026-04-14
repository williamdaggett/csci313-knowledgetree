import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeDisplay } from './tree-display';

describe('TreeDisplay', () => {
  let component: TreeDisplay;
  let fixture: ComponentFixture<TreeDisplay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeDisplay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreeDisplay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
