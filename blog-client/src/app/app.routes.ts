import { Routes } from '@angular/router';
import { PostListComponent } from './post-list/post-list.component';
import { PostDetailComponent } from './post-detail/post-detail.component';
import { PostWriteComponent } from './post-write/post-write.component';
import { CategoryListComponent } from './admin/category-list/category-list.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { adminGuard } from './guards/admin.guard';

// 컴포넌트 경로 확인 (폴더 구조에 맞게 import)
// 만약 post-write도 폴더로 옮겼다면: import { PostWriteComponent } from './features/post-write/post-write.component';

export const routes: Routes = [
  // 1. 기본 경로: /posts로 리다이렉트
  { path: '', redirectTo: 'posts', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // 2. 게시글 목록 (홈 & 카테고리 필터)
  { path: 'posts', component: PostListComponent },

  // 3. 게시글 상세 보기 (:id 파라미터)
  { path: 'posts/:id', component: PostDetailComponent },

  // 4. 글쓰기 페이지
  { path: 'write', component: PostWriteComponent },

  // 5. 관리자 - 카테고리 관리
  { path: 'admin/categories', component: CategoryListComponent },

  // 6. 예외 처리: 잘못된 URL은 홈으로 보냄
  { path: '**', redirectTo: 'posts' },
  {
    path: 'write',
    component: PostWriteComponent,
    canActivate: [adminGuard], // [추가] 관리자만 접근 가능
  },
  {
    path: 'admin/categories',
    component: CategoryListComponent,
    canActivate: [adminGuard], // [추가] 관리자만 접근 가능
  },
];
