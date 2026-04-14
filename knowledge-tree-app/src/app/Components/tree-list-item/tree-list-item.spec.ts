import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeListItem } from './tree-list-item';

describe('TreeListItem', () => {
  let component: TreeListItem;
  let fixture: ComponentFixture<TreeListItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeListItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreeListItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
