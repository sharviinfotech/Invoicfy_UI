import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GeneralserviceService } from 'src/app/generalservice.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-inventory-management',
  templateUrl: './inventory-management.component.html',
  styleUrls: ['./inventory-management.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxSpinnerModule],
})
export class InventoryManagementComponent implements OnInit {

  @ViewChild('newcompanyTemplate') newcompanyTemplate!: TemplateRef<any>;

  InventoryForm!: FormGroup;
  inventoryList: any[] = [];

  editMode: boolean = false;
  editingInventoryId: any = null;

  loginData: any;
  submit: boolean = false;
  productList: any[] = [];
  companyList: any[] = [];
  filteredProducts: any[] = [];
  selectedPurchasePrice: number = 0;



  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private service: GeneralserviceService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {

    this.InventoryForm = this.fb.group({
      sourceOfStock: ['', Validators.required],
      companyNameORPlant: ['', Validators.required],
      postingDate: ['', Validators.required],
      productCode: ['', Validators.required],
      productName: ['', Validators.required],
      materialType: ['', Validators.required],
      value: ['', Validators.required],
      batch: ['', Validators.required],
      sLock: ['', Validators.required],
      availableStock: ['', Validators.required],
      uom: ['', Validators.required],
      createdAt: ['', Validators.required],
      updatedAt: ['', Validators.required]
    });

    this.loginData = this.service.getLoginResponse();
    this.getInventoryList();
    // ✅ Fetch companies dynamically from Product screen
    this.getCompanyListFromProducts();
    this.InventoryForm.get('availableStock')?.valueChanges.subscribe(qty => {
      qty = Number(qty);

      if (qty > 0 && this.selectedPurchasePrice > 0) {
        const totalValue = qty * this.selectedPurchasePrice;
        this.InventoryForm.patchValue({ value: totalValue }, { emitEvent: false });
      } else {
        this.InventoryForm.patchValue({ value: '' }, { emitEvent: false });
      }
    });



  }

  get f() {
    return this.InventoryForm.controls;
  }
  getCompanyListFromProducts() {
    this.service.getproductList().subscribe({
      next: (res: any) => {
        this.productList = res.data || [];
        const allProducts = res.data || [];
        // Extract unique company names
        this.companyList = [...new Set(allProducts.map(p => p.companyNameORPlant))];
        console.log('Company List from Products:', this.companyList);
      },
      error: () => {
        this.toastr.error("Failed to load company list from products");
      }
    });
  }





  onCompanyChange(event: any) {
    const selectedCompany = event.target.value;

    this.filteredProducts = this.productList.filter(
      p => p.companyNameORPlant === selectedCompany
    );

    this.InventoryForm.patchValue({
      productCode: '',
      productName: '',
      materialType: '',
      uom: '',
      sLock: ''
    });
    this.resetInventoryValueFields();
  }

  onProductSelect(event: any) {
    const selectedProductCode = event.target.value;
    const selectedProduct = this.productList.find(p => p.productCode === selectedProductCode);
    console.log('selected Product:', selectedProduct);
    if (selectedProduct) {
      this.resetInventoryValueFields();
      this.selectedPurchasePrice = Number(selectedProduct.purchasePrice);
      this.InventoryForm.patchValue({
        productCode: selectedProduct.productCode,
        productName: selectedProduct.productName,
        materialType: selectedProduct.materialType,
        uom: selectedProduct.uom,
        sLock: selectedProduct.sLock
      });
    }
  }


  resetInventoryValueFields() {
    this.selectedPurchasePrice = 0;

    this.InventoryForm.patchValue({
      availableStock: '',
      value: ''
    }, { emitEvent: false });
  }


  newCompanyCreation(template: TemplateRef<any>) {
    this.editMode = false;
    this.editingInventoryId = null;
    this.InventoryForm.reset();
    this.modalService.open(template, { size: 'lg', backdrop: 'static' });
  }


  openEditModal(data: any, template: TemplateRef<any>) {
    this.editMode = true;
    this.editingInventoryId = data.inventoryUniqueId;

    this.InventoryForm.patchValue({
      sourceOfStock: data.sourceOfStock,
      companyNameORPlant: data.companyNameORPlant,
      postingDate: data.postingDate,
      productCode: data.productCode,
      productName: data.productName,
      materialType: data.materialType,
      value: data.value,
      batch: data.batch,
      sLock: data.sLock,
      availableStock: data.availableStock,
      uom: data.uom,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    });

    this.modalService.open(template, { size: 'lg', backdrop: 'static' });
  }

  saveInventory() {
    this.submit = true;

    if (this.InventoryForm.invalid) {
      this.toastr.error("Please fill all required fields");
      return;
    }

    // Explicit payload
    const payload = {
      sourceOfStock: this.InventoryForm.value.sourceOfStock,
      companyNameORPlant: this.InventoryForm.value.companyNameORPlant,
      postingDate: this.InventoryForm.value.postingDate,
      productCode: this.InventoryForm.value.productCode,
      productName: this.InventoryForm.value.productName,
      materialType: this.InventoryForm.value.materialType,
      value: this.InventoryForm.value.value,
      batch: this.InventoryForm.value.batch,
      sLock: this.InventoryForm.value.sLock,
      availableStock: this.InventoryForm.value.availableStock,
      uom: this.InventoryForm.value.uom,
      createdAt: this.InventoryForm.value.createdAt,
      updatedAt: this.InventoryForm.value.updatedAt,
      partialDelete: ""
    };

    // Edit mode → update
    if (this.editMode && this.editingInventoryId) {
      payload['inventoryUniqueId'] = this.editingInventoryId;
      this.spinner.show();

      this.service.updateExitInventory(payload).subscribe({
        next: (res: any) => {
          this.spinner.hide();
          this.toastr.success("Inventory Updated Successfully");
          this.modalService.dismissAll();
          this.getInventoryList();
          this.editMode = false;
          this.editingInventoryId = null;
        },
        error: () => {
          this.spinner.hide();
          this.toastr.error("Error updating inventory");
        }
      });
      return;
    }

    // Save new inventory
    this.spinner.show();
    this.service.SaveInventory(payload).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.toastr.success("Inventory Saved Successfully");
        this.modalService.dismissAll();
        this.getInventoryList();
      },
      error: () => {
        this.spinner.hide();
        this.toastr.error("Error saving inventory");
      }
    });
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
        this.toastr.error("Failed to load inventory");
      }
    });
  }


  delete(data: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to delete this inventory?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {

        this.inventoryList = this.inventoryList.filter(i => i.inventoryUniqueId !== data.inventoryUniqueId);
        Swal.fire({
          title: 'Deleted!',
          text: "Inventory removed successfully",
          icon: 'success',
          timer: 2000
        });
      }
    });
  }

}
