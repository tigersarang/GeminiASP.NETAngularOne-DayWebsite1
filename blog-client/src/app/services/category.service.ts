import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5000/api/categories'; // 포트 확인 필요

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.baseUrl);
  }

  create(category: Category): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, category);
  }

  update(id: number, category: Category): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, category);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
