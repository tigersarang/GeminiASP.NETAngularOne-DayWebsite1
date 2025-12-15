import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  if (authService.isAdmin) {
    return true; // 통과
  } else {
    snackBar.open('Access Denied: Admins only.', 'Close', { duration: 3000, verticalPosition: 'top' });
    router.navigate(['/']); // 홈으로 튕겨냄
    return false;
  }
};
