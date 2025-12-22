import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

// Material Modules
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// 3rd Party
import { AngularEditorModule } from '@kolkov/angular-editor';
import { PostService } from '../../services/post.service';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category';

// Services & Models

@Component({
  selector: 'app-post-write',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // 폼 모듈 필수
    RouterModule,
    HttpClientModule,
    AngularEditorModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSnackBarModule,
  ],
  templateUrl: './post-write.component.html',
  styleUrl: './post-write.component.scss',
})
export class PostWriteComponent implements OnInit {
  private fb = inject(FormBuilder);
  private postService = inject(PostService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private route = inject(ActivatedRoute); // [추가] 라우트 주입

  postForm!: FormGroup;
  categories: Category[] = [];
  isSubmitting = false;
  catIdStr?: string;

  selectedFile: File | null = null; // 선택된 파일 저장

  isEditMode = false; // 수정 모드 여부
  postId: number | null = null; // 수정할 글 ID

  // 기존 파일명을 보여주기 위한 변수
  existingFileName: string | null = null;

  // 에디터 설정
  editorConfig = {
    editable: true,
    spellcheck: false,
    height: '15rem',
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
  };

  ngOnInit() {
    this.initForm();
    this.loadCategories();

    // [핵심] URL에 id 파라미터가 있는지 확인
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.postId = Number(idParam);
      this.loadPostData(this.postId); // 기존 데이터 불러오기
    }
  }

  // 1. 폼 초기화
  initForm() {
    this.postForm = this.fb.group({
      category: ['', Validators.required], // 카테고리 필수
      title: ['', Validators.required], // 제목 필수
      content: ['', Validators.required], // 내용 필수
    });
  }

  loadCategoriesAndSetDefault() {
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories = data;

        // [추가] URL에 categoryId가 있는지 확인
        this.catIdStr = this.route.snapshot.queryParams['categoryId'];

        if (this.catIdStr) {
          const catId = Number(this.catIdStr);
          // ID에 해당하는 카테고리 객체 찾기
          const targetCategory = this.categories.find((c) => c.id === catId);

          // 찾았다면 폼의 category 컨트롤 값 변경 (이름으로 저장하므로 name 할당)
          if (targetCategory) {
            this.postForm.patchValue({
              category: targetCategory.name,
            });
          }
        }
      },
      error: (err) => console.error('Failed to load categories', err),
    });
  }

  // 2. 카테고리 목록 불러오기 (Select 박스용)
  loadCategories() {
    this.categoryService.getAll().subscribe({
      next: (data) => (this.categories = data),
      error: (err) => console.error('Failed to load categories', err),
    });
  }

  // 3. 작성 완료 (Submit)
  onSubmit() {
    if (this.postForm.invalid) {
      this.showNotification(
        '제목과 내용, 카테고리를 모두 입력해주세요.',
        '닫기',
        false
      );
      return;
    }

    this.isSubmitting = true;
    const formValue = this.postForm.value;

    // [중요] JSON 대신 FormData 생성
    const formData = new FormData();
    formData.append('title', formValue.title);
    formData.append('content', formValue.content);
    formData.append('category', formValue.category);
    formData.append('author', 'DevMaster'); // 혹은 로그인 유저

    // 파일이 있으면 추가
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    if (this.isEditMode && this.postId) {
      // [수정 모드] Update 요청
      this.postService.updatePost(this.postId, formData).subscribe({
        next: () => {
          this.showNotification('Post updated successfully!', 'Ok', true);
          this.router.navigate(['/posts', this.postId]); // 상세 페이지로 이동
        },
        error: () => {
          this.showNotification('Update failed.', 'Close', false);
          this.isSubmitting = false;
        },
      });
    } else {
      this.postService.createPost(formData).subscribe({
        next: (res) => {
          this.showNotification(
            '게시글이 성공적으로 등록되었습니다! 🎉',
            '확인',
            true
          );
          this.isSubmitting = false;

          // [수정된 부분]
          // 1. 방금 폼에서 선택한 카테고리 이름 가져오기
          const selectedCatName = formValue.category;

          // 2. 전체 카테고리 목록에서 해당 이름과 일치하는 객체(ID 포함) 찾기
          const targetCategory = this.categories.find(
            (c) => c.name === selectedCatName
          );

          // 3. 해당 카테고리 ID를 파라미터로 넣어서 이동
          if (targetCategory) {
            this.router.navigate(['/posts'], {
              queryParams: { categoryId: targetCategory.id },
            });
          } else {
            // 만약 못 찾으면 그냥 전체 목록으로 이동 (Fallback)
            this.router.navigate(['/posts']);
          }
        },
        error: (err) => {
          console.error(err);
          this.showNotification('게시글 등록에 실패했습니다.', '닫기', false);
          this.isSubmitting = false;
        },
      });
    }
  }

  // [추가] 메시지 표시 헬퍼 메서드
  private showNotification(
    message: string,
    action: string,
    isSuccess: boolean
  ) {
    this.snackBar.open(message, action, {
      duration: 3000, // 3초 뒤 자동 사라짐
      verticalPosition: 'top', // [핵심] 'top'으로 설정하면 위쪽에 뜸
      horizontalPosition: 'center', // 가운데 정렬
      panelClass: isSuccess ? ['success-snackbar'] : ['error-snackbar'], // (선택) 스타일 클래스 추가 가능
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  loadPostData(id: number) {
    this.postService.getPost(id).subscribe({
      next: (post) => {
        // 폼에 값 채워넣기 (patchValue)
        this.postForm.patchValue({
          title: post.title,
          content: post.content,
          category: post.category,
        });

        // 기존 첨부파일 이름 저장
        this.existingFileName = post.attachmentName || null;
      },
      error: (err) => {
        this.showNotification('Failed to load post data.', 'Close', false);
        this.router.navigate(['/posts']);
      },
    });
  }
}
