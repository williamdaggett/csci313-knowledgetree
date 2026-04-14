import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseTrees } from './browse-trees';

describe('BrowseTrees', () => {
  let component: BrowseTrees;
  let fixture: ComponentFixture<BrowseTrees>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowseTrees]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrowseTrees);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
