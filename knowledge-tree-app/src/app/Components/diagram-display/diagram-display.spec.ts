import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagramDisplay } from './diagram-display';

describe('DiagramDisplay', () => {
  let component: DiagramDisplay;
  let fixture: ComponentFixture<DiagramDisplay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiagramDisplay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiagramDisplay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
