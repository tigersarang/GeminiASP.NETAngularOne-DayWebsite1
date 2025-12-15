import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: `./change-password-dialog.component.html`,
  styleUrl: `./change-password-dialog.component.scss`
})
export class ChangePasswordDialogComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private dialogRef = inject(MatDialogRef<ChangePasswordDialogComponent>);
  private snackBar = inject(MatSnackBar);

  form = this.fb.group({
    oldPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    if (this.form.invalid) return;

    this.authService.changePassword(this.form.value).subscribe({
      next: () => {
        this.snackBar.open('Password changed successfully!', 'Close', { duration: 3000, verticalPosition: 'top' });
        this.dialogRef.close();
      },
      error: (err) => {
        this.snackBar.open(err.error || 'Failed to change password.', 'Close', { duration: 3000, verticalPosition: 'top' });
      }
    });
  }
}
