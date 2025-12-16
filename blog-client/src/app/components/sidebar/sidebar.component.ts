// src/app/core/components/sidebar/sidebar.component.ts

import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatExpansionModule,
    MatButtonModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  authService = inject(AuthService); // 추가
  private categoryService = inject(CategoryService);
  route = inject(ActivatedRoute); // [추가]

  // 트리 구조로 변환된 카테고리를 저장할 변수
  categoryTree: Category[] = [];
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
        // [핵심] 서버에서 받은 평탄한 리스트를 트리 구조로 변환
        this.categoryTree = this.buildCategoryTree(data);
      },
      error: (err) => console.error(err),
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

  buildCategoryTree(categories: Category[]): Category[] {
    const map = new Map<number, Category>();
    const roots: Category[] = [];

    // 1. 모든 카테고리를 맵에 등록하고 children 배열 초기화
    categories.forEach((cat) => {
      map.set(cat.id, { ...cat, children: [] });
    });

    // 2. 부모-자식 연결
    categories.forEach((cat) => {
      if (cat.parentId) {
        // 부모가 있으면 부모의 children에 추가
        const parent = map.get(cat.parentId);
        if (parent) {
          parent.children?.push(map.get(cat.id)!);
        }
      } else {
        // 부모가 없으면 최상위(Root) 노드
        roots.push(map.get(cat.id)!);
      }
    });

    return roots;
  }
}
