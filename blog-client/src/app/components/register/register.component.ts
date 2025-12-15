import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../auth.service';

// [커스텀 유효성 검사] 비밀번호와 비밀번호 확인이 같은지 체크
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    // 에러가 있음을 표시
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  } else {
    // 에러가 없으면 기존 에러가 'passwordMismatch'인 경우에만 null로 초기화
    if (confirmPassword?.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }
    return null;
  }
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  registerForm = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatchValidator }); // 그룹 레벨에서 검사 수행

  onSubmit() {
    if (this.registerForm.invalid) return;

    // 서버로 보낼 때는 confirmPassword를 제외하고 전송
    const { confirmPassword, ...requestData } = this.registerForm.value;

    this.authService.register(requestData).subscribe({
      next: () => {
        this.showSnack('Registration successful! Please login.', true);
        this.router.navigate(['/login']); // 로그인 페이지로 이동
      },
      error: (err) => {
        console.error(err);
        // 서버에서 오는 에러 메시지 (예: Email already exists) 표시
        const msg = err.error || 'Registration failed.';
        this.showSnack(msg, false);
      }
    });
  }

  private showSnack(message: string, isSuccess: boolean) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: isSuccess ? ['success-snackbar'] : ['error-snackbar']
    });
  }
}
