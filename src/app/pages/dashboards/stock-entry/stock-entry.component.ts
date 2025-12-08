import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
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
  productList: any[] = [];
  filteredProducts: any[] = [];
  inventoryList: any[] = [];

  constructor(private fb: FormBuilder, private spinner: NgxSpinnerService, private service: GeneralserviceService, private toastr: ToastrService,) {
    this.stockForm = this.fb.group({
      items: this.fb.array([this.createItem()])
    });
    this.getProductList();
    this.getInventoryList();
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
      purchasePrice: [0],
      value: [0, Validators.required],
      batch: [''],
      uom: ['']
    });
  }

  setupRowValueCalc(index: number) {
    const row = this.items.at(index);

    row.get('availableStock')?.valueChanges.subscribe(qty => {
      const purchasePrice = Number(row.get('purchasePrice')?.value);
      qty = Number(qty);

      if (qty > 0 && purchasePrice > 0) {
        row.patchValue({ value: qty * purchasePrice }, { emitEvent: false });
      } else {
        row.patchValue({ value: 0 }, { emitEvent: false });
      }
    });
  }



  // Add row
  addRow(): void {
    this.items.push(this.createItem());
  }

  getProductList() {
    this.spinner.show();
    this.service.getproductList().subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.productList = res.data || [];
      },
      error: () => {
        this.spinner.hide();
      }
    });
  }

  // onCompanySelect(index: number) {
  //   const selectedCompany = this.items.at(index).get('companyNameORPlant')?.value;

  //   // PRODUCT details
  //   const product = this.productList.find(p =>
  //     p.companyNameORPlant === selectedCompany
  //   );

  //   // INVENTORY details
  //   const inventory = this.inventoryList.find(inv =>
  //     inv.companyNameORPlant === selectedCompany
  //   );

  //   if (product) {
  //     this.items.at(index).patchValue({
  //       productCode: product.productCode,
  //       productName: product.productName,
  //       materialType: product.materialType,
  //       purchasePrice: product.purchasePrice,
  //       sLock: product.sLock,
  //       uom: product.uom
  //     });
  //     // 🔥 Batch Enable/Disable Logic
  //     if (product.batchReq?.toLowerCase() === 'yes') {
  //       this.items.at(index).get('batch')?.enable();
  //     } else {
  //       this.items.at(index).get('batch')?.disable();
  //       this.items.at(index).patchValue({ batch: '' }); // clear batch
  //     }
  //   }

  //   this.setupRowValueCalc(index);

  //   // if (inventory) {
  //   //   this.items.at(index).patchValue({
  //   //     availableStock: inventory.availableStock,
  //   //     value: inventory.value
  //   //   });
  //   // }
  // }
  onCompanySelect(index: number) {
    const row = this.items.at(index);
    const selectedCompany = row.get('companyNameORPlant')?.value;

    // Filter products like Inventory screen
    row['filteredProducts'] = this.productList.filter(
      p => p.companyNameORPlant === selectedCompany
    );

    // Clear fields
    row.patchValue({
      productCode: '',
      productName: '',
      materialType: '',
      purchasePrice: '',
      sLock: '',
      uom: '',
      batch: '',
      availableStock: 0,
      value: 0
    });

    // Disable batch by default
    row.get('batch')?.disable();
  }
  onProductSelect(index: number, event: any) {
    const selectedCode = event.target.value;

    const row = this.items.at(index);
    const filtered = row['filteredProducts'] || [];

    const product = filtered.find(p => p.productCode === selectedCode);

    if (product) {
      row.patchValue({
        productCode: product.productCode,
        productName: product.productName,
        materialType: product.materialType,
        purchasePrice: product.purchasePrice,
        sLock: product.sLock,
        uom: product.uom
      });

      // Batch Required Logic (same as Inventory)
      if (product.batchReq?.toLowerCase() === 'yes') {
        row.get('batch')?.enable();
      } else {
        row.get('batch')?.disable();
        row.patchValue({ batch: '' });
      }

      this.setupRowValueCalc(index);
    }
  }



  getInventoryList() {
    this.spinner.show();
    this.service.getInventoryList().subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.inventoryList = res.data || [];
      },
      error: () => {
        this.spinner.hide();
      }
    });
  }

  // Remove row
  removeRow(index: number): void {
    this.items.removeAt(index);
  }

  // Save all data
  // saveStockEntry(): void {
  //   console.log("data", this.stockForm.value.items)
  //   if (this.stockForm.valid) {
  //     const payload = this.stockForm.value.items;
  //     console.log('Stock Entry Data:', payload);

  //     this.service.SaveInventory(payload).subscribe({
  //       next: (res: any) => {
  //         this.spinner.hide();


  //       },
  //       error: () => {
  //         this.spinner.hide();

  //       }
  //     });
  //   } else {
  //     alert('Please fill all required fields.');
  //   }
  // }
  saveStockEntry(): void {
    console.log("data", this.stockForm.value.items);

    if (this.stockForm.valid) {

      const payload = this.stockForm.value.items;

      this.service.SaveInventory(payload).subscribe({
        next: (res: any) => {
          this.spinner.hide();

          const firstRow = payload[0];
          const nature = firstRow.sourceOfStock;
          const product = firstRow.productCode;

          this.toastr.success(`${nature} of ${product} posted successfully`, 'Success');

          // 🔥 Refresh data lists
          this.getProductList();
          this.getInventoryList();

          // 🔥 Reset form
          this.stockForm.reset();
          this.items.clear();
          this.items.push(this.createItem());
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

