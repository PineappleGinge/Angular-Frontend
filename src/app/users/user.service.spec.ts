import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request users list', () => {
    let users: any[] = [];
    service.getUsers().subscribe((data) => {
      users = data;
    });

    const req = httpMock.expectOne('http://localhost:3000/api/v1/users');
    expect(req.request.method).toBe('GET');
    req.flush([{ _id: '1', name: 'Dara' }]);

    expect(users.length).toBe(1);
    expect(users[0].name).toBe('Dara');
  });

  it('should map 403 to authorization error', () => {
    let errorMessage = '';
    service.deleteUser('1').subscribe({
      error: (err: Error) => {
        errorMessage = err.message;
      },
    });

    const req = httpMock.expectOne('http://localhost:3000/api/v1/users/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({}, { status: 403, statusText: 'Forbidden' });

    expect(errorMessage).toBe('You are not authorised for that action');
  });

  it('should return generic error for non-http errors', () => {
    let errorMessage = '';
    // Force handleError via updateUser path with invalid server response
    service.updateUser('1', {} as any).subscribe({
      error: (err: Error) => {
        errorMessage = err.message;
      },
    });

    const req = httpMock.expectOne('http://localhost:3000/api/v1/users/1');
    req.error(new ProgressEvent('error'));

    expect(errorMessage).toBe('Something bad happened; please try again later.');
  });
});
