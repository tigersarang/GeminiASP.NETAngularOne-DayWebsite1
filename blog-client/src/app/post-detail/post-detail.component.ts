import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { PostService } from '../services/post.service';
import { BlogPost } from '../models/post';

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
    MatDividerModule
  ],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.scss'
})
export class PostDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private postService = inject(PostService);

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
        }
      });
    } else {
      this.errorMessage = 'Invalid Post ID.';
      this.isLoading = false;
    }
  }
}
