import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeCreator } from './tree-creator';

describe('TreeCreator', () => {
  let component: TreeCreator;
  let fixture: ComponentFixture<TreeCreator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeCreator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreeCreator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
