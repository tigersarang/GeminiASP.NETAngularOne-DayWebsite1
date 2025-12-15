// src/app/core/services/post.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagedResult } from '../models/paged-result';
import { BlogPost } from '../models/post';

@Injectable({
  providedIn: 'root' // 전역에서 사용 가능
})
export class PostService {
  private http = inject(HttpClient);

  // [주의] 실제 실행 중인 백엔드 API 주소로 변경해주세요.
  private baseUrl = 'http://localhost:5000/api/posts';

  // 페이징된 게시글 목록 가져오기
getPosts(page: number, pageSize: number, categoryId?: number): Observable<PagedResult<BlogPost>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    // 카테고리 ID가 있을 때만 파라미터 추가
    if (categoryId) {
      params = params.set('categoryId', categoryId.toString());
    }

    return this.http.get<PagedResult<BlogPost>>(this.baseUrl, { params });
  }

  // 게시글 상세 가져오기
  getPost(id: number): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${this.baseUrl}/${id}`);
  }

  // 글쓰기 (POST)
  createPost(post: Partial<BlogPost>): Observable<BlogPost> {
    return this.http.post<BlogPost>(this.baseUrl, post);
  }
}
