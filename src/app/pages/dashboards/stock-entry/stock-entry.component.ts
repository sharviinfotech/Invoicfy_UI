import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { GeneralserviceService } from 'src/app/generalservice.service';

@Component({
  selector: 'app-stock-entry',
  templateUrl: './stock-entry.component.html',
  styleUrl: './stock-entry.component.css',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
})
export class StockEntryComponent {
  stockForm: FormGroup;

  constructor(private fb: FormBuilder, private spinner: NgxSpinnerService, private service: GeneralserviceService,) {
    this.stockForm = this.fb.group({
      items: this.fb.array([this.createItem()])
    });
  }

  // FormArray getter
  get items(): FormArray {
    return this.stockForm.get('items') as FormArray;
  }

  createItem(): FormGroup {
    return this.fb.group({
      sourceOfStock: ['', Validators.required],
      companyNameORPlant: ['', Validators.required],
      postingDate: ['', Validators.required],
      productCode: ['', Validators.required],
      productName: ['', Validators.required],
      materialType: ['', Validators.required],
      sLock: ['', Validators.required],
      availableStock: [0, Validators.required],
      value: [0, Validators.required],
      batch: [''],
      uom: ['']
    });
  }

  // Add row
  addRow(): void {
    this.items.push(this.createItem());
  }

  // Remove row
  removeRow(index: number): void {
    this.items.removeAt(index);
  }

  // Save all data
  saveStockEntry(): void {
    console.log("data", this.stockForm.value.items)
    if (this.stockForm.valid) {
      const payload = this.stockForm.value.items;
      console.log('Stock Entry Data:', payload);

      this.service.SaveInventory(payload).subscribe({
        next: (res: any) => {
          this.spinner.hide();


        },
        error: () => {
          this.spinner.hide();

        }
      });
    } else {
      alert('Please fill all required fields.');
    }
  }
}

