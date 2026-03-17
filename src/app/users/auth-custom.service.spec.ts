import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthCustomService } from './auth-custom.service';

describe('AuthCustomService', () => {
  let service: AuthCustomService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthCustomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
