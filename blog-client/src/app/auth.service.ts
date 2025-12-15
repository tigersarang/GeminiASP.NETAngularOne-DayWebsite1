import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private baseUrl = 'http://localhost:5000/api/auth';
  private tokenKey = 'authToken';
  private userKey = 'authUser';

  // 로그인 상태를 실시간으로 알리기 위한 Subject
  private currentUserSubject = new BehaviorSubject<any>(
    this.getUserFromStorage()
  );
  currentUser$ = this.currentUserSubject.asObservable();

  private roleKey = 'authRole'; // [추가] 로컬 스토리지 키

  // 로그인 (수정)
  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          localStorage.setItem(
            this.userKey,
            JSON.stringify({
              username: response.username,
              role: response.role,
            })
          );

          this.currentUserSubject.next({
            username: response.username,
            role: response.role,
          });
        }
      })
    );
  }

  // 회원가입
  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData);
  }

  // 로그아웃
  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/posts']);
  }

  // 토큰 가져오기
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // 로그인 여부 확인
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private getUserFromStorage() {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  // 비밀번호 변경
  changePassword(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/change-password`, data);
  }

  // 회원 탈퇴
  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete-account`);
  }
  get isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user && user.role === 'Admin';
  }
}
