import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category';
import { CategoryDialogComponent } from '../category-dialog/category-dialog.component';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule, MatSnackBarModule
  ],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss'
})
export class CategoryListComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  categories: Category[] = [];
  displayedColumns: string[] = ['id', 'name', 'actions'];

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getAll().subscribe(data => this.categories = data);
  }

  openDialog(category?: Category) {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '300px',
      data: category ? { ...category } : { id: 0, name: '' } // 복사본 전달 또는 초기값
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id === 0) {
          // 생성
          this.categoryService.create(result).subscribe(() => {
            this.loadCategories();
            this.showSnack('Category created!');
          });
        } else {
          // 수정
          this.categoryService.update(result.id, result).subscribe(() => {
            this.loadCategories();
            this.showSnack('Category updated!');
          });
        }
      }
    });
  }

  deleteCategory(id: number) {
    if(confirm('Are you sure you want to delete this category?')) {
      this.categoryService.delete(id).subscribe(() => {
        this.loadCategories();
        this.showSnack('Category deleted!');
      });
    }
  }

  showSnack(message: string) {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }
}
