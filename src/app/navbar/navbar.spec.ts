import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { Navbar } from './navbar';
import { AuthCustomService } from '../users/auth-custom.service';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;
  let router: Router;
  const isAuthenticated$ = new BehaviorSubject<boolean>(false);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        provideRouter([]),
        {
          provide: AuthCustomService,
          useValue: {
            isAuthenticated$,
          },
        },
      ],
    })
    .compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to car-list when query is empty', () => {
    spyOn(router, 'navigateByUrl').and.stub();
    component.entity = 'cars';
    component.query = '   ';
    component.onSearch();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/car-list');
  });

  it('should navigate with query params for car search', () => {
    spyOn(router, 'navigate').and.stub();
    component.entity = 'cars';
    component.query = ' mustang ';
    component.onSearch();
    expect(router.navigate).toHaveBeenCalledWith(['/car-list'], { queryParams: { q: 'mustang' } });
  });

  it('should force entity back to cars when unauthenticated user tries user search', () => {
    spyOn(router, 'navigateByUrl').and.stub();
    isAuthenticated$.next(false);
    component.entity = 'users';
    component.query = '';
    component.onSearch();
    expect(component.entity).toBe('cars');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/car-list');
  });

  it('should allow user search when authenticated', () => {
    spyOn(router, 'navigate').and.stub();
    isAuthenticated$.next(true);
    component.entity = 'users';
    component.query = 'dara';
    component.onSearch();
    expect(router.navigate).toHaveBeenCalledWith(['/user-list'], { queryParams: { q: 'dara' } });
  });
});
