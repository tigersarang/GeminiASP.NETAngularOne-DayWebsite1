// src/app/core/components/sidebar/sidebar.component.ts

import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CategoryService } from '../services/category.service';
import { Category } from '../models/category';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  authService = inject(AuthService); // 추가
  private categoryService = inject(CategoryService);
  route = inject(ActivatedRoute); // [추가]

  categories: Category[] = [];
  currentCategoryId?: number; // 현재 URL의 카테고리 ID 저장용

  currentUser$ = this.authService.currentUser$;

  // 메뉴 클릭 시 부모에게 '닫기' 신호를 보내기 위한 이벤트
  @Output() linkClicked = new EventEmitter<void>();

  ngOnInit() {
    this.loadCategories();

    // [추가] URL의 쿼리 파라미터 변화를 감시
    this.route.queryParams.subscribe((params) => {
      const id = params['categoryId'];
      this.currentCategoryId = id ? Number(id) : undefined;
    });
  }

  loadCategories() {
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => console.error('Failed to load categories', err),
    });
  }

  // 링크 클릭 시 호출
  onLinkClick() {
    this.linkClicked.emit();
  }

  logout() {
    this.authService.logout();
    this.onLinkClick();
  }
}
