import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { PostService } from '../../services/post.service';
import { BlogPost } from '../../models/post';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
  ],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.scss',
})
export class PostDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private postService = inject(PostService);
  private router = inject(Router);
  public authService = inject(AuthService);

  post: BlogPost | null = null;
  isLoading = true;
  errorMessage = '';

  ngOnInit() {
    this.loadPost();
  }

  loadPost() {
    // URL에서 id 파라미터 가져오기 (예: /posts/5 -> 5)
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      this.postService.getPost(id).subscribe({
        next: (data) => {
          this.post = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Failed to load post.';
          this.isLoading = false;
        },
      });
    } else {
      this.errorMessage = 'Invalid Post ID.';
      this.isLoading = false;
    }
  }

  downloadFile() {
    if (!this.post) return;

    this.postService.downloadFile(this.post.id).subscribe({
      next: (blob: Blob) => {
        // [Blob 데이터를 파일로 저장하는 트릭]
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.post?.attachmentName || 'downloaded_file'; // 파일명 설정
        document.body.appendChild(a);
        a.click(); // 강제 클릭 발생
        document.body.removeChild(a); // 요소 삭제
        window.URL.revokeObjectURL(url); // 메모리 해제
      },
      error: (err) => console.error('Download failed', err),
    });
  }

  deletePost() {
    if (!this.post) return;

    // 브라우저 기본 확인창 (간단하게 구현)
    if (
      confirm(
        'Are you sure you want to delete this post? This action cannot be undone.'
      )
    ) {
      this.isLoading = true; // 로딩 표시

      this.postService.deletePost(this.post.id).subscribe({
        next: () => {
          this.isLoading = false;
          // 삭제 후 목록으로 이동
          this.router.navigate(['/posts']);
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
          alert('Failed to delete post.');
        },
      });
    }
  }
}
