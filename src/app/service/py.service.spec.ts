import { TestBed } from '@angular/core/testing';

import { PyService } from './py.service';

describe('PyService', () => {
  let service: PyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
