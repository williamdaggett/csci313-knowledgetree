import { TestBed } from '@angular/core/testing';

import { TreeAPI } from './tree-api';

describe('TreeAPI', () => {
  let service: TreeAPI;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TreeAPI);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
