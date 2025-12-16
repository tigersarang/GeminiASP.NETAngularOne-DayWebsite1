import { Component, ViewChild, inject } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from './auth.service';
import { ChangePasswordDialogComponent } from './components/change-password-dialog/change-password-dialog.component';
import { MatDivider } from "@angular/material/divider";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterModule,
    MatSidenavModule, MatToolbarModule, MatIconModule, MatButtonModule,
    MatMenuModule, MatDialogModule, // [추가]
    SidebarComponent,
    MatDivider
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private breakpointObserver = inject(BreakpointObserver);
  public authService = inject(AuthService); // public으로 변경 (HTML에서 사용)
  private dialog = inject(MatDialog);

  @ViewChild('drawer') drawer!: MatSidenav;

  isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(map(result => result.matches), shareReplay());

  closeSideNavIfMobile() {
    if (this.drawer && this.drawer.mode === 'over') {
      this.drawer.close();
    }
  }

  // 1. 로그아웃
  logout() {
    this.authService.logout();
  }

  // 2. 비밀번호 변경 팝업
  openChangePassword() {
    this.dialog.open(ChangePasswordDialogComponent, { width: '400px' });
  }

  // 3. 회원 탈퇴
  deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      this.authService.deleteAccount().subscribe({
        next: () => {
          alert('Account deleted.');
          this.authService.logout(); // 탈퇴 후 로그아웃 처리
        },
        error: () => alert('Failed to delete account.')
      });
    }
  }
}
