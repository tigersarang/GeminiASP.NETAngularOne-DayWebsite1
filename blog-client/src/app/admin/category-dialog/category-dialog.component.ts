import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { Category } from '../../models/category';

@Component({
  selector: 'app-category-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule
  ],
  templateUrl: './category-dialog.component.html'
})
export class CategoryDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Category
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
