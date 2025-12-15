// src/app/features/post-list/post-list.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PostService } from '../services/post.service';
import { CategoryService } from '../services/category.service';
import { BlogPost } from '../models/post';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatButtonModule,
    MatChipsModule, MatIconModule, MatPaginatorModule, MatProgressSpinnerModule
  ],
  templateUrl: './post-list.component.html',
  styleUrl: './post-list.component.scss'
})
export class PostListComponent implements OnInit {
  private postService = inject(PostService);
  private route = inject(ActivatedRoute);
  private categoryService = inject(CategoryService); // [추가] 서비스 주입
  public authService = inject(AuthService);

  posts: BlogPost[] = [];
  totalCount = 0;
  isLoading = true;

  pageSize = 5;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25];

  currentCategoryId?: number;

  // [추가] 화면에 표시할 제목 (기본값: Latest Posts)
  pageTitle: string = 'Latest Posts';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const catIdStr = params['categoryId'];
      this.currentCategoryId = catIdStr ? Number(catIdStr) : undefined;

      // [추가] 카테고리 ID 유무에 따라 제목 설정
      this.updatePageTitle();

      this.pageIndex = 0;
      this.loadPosts();
    });
  }

  // [추가] 제목 업데이트 메서드
  updatePageTitle() {
    if (this.currentCategoryId) {
      // 카테고리가 선택되었다면, 전체 목록에서 이름을 찾아 설정
      this.categoryService.getAll().subscribe(categories => {
        const found = categories.find(c => c.id === this.currentCategoryId);
        if (found) {
          this.pageTitle = found.name; // 예: "C#"
        } else {
          this.pageTitle = 'Category'; // 못 찾았을 경우 대비
        }
      });
    } else {
      // 전체 보기라면 기본 제목
      this.pageTitle = 'Latest Posts';
    }
  }

  loadPosts() {
    this.isLoading = true;
    this.postService.getPosts(this.pageIndex + 1, this.pageSize, this.currentCategoryId)
      .subscribe({
        next: (result) => {
          this.posts = result.items;
          this.totalCount = result.totalCount;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        }
      });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPosts();
  }
}
