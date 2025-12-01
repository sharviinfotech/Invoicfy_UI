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
  @ViewChild('addInventoryTemplate') addInventoryTemplate!: TemplateRef<any>;
  @ViewChild('editInventoryTemplate') editInventoryTemplate!: TemplateRef<any>;

  addInventoryForm!: FormGroup;
  editInventoryForm!: FormGroup;

  inventoryList: any[] = [];
  productList: any[] = [];
  companyList: any[] = [];

  filteredProductsForAdd: any[] = [];
  filteredProductsForEdit: any[] = [];

  selectedPurchasePriceForAdd: number = 0;
  selectedPurchasePriceForEdit: number = 0;

  editingInventoryId: any = null;
  loginData: any;
  submitAdd: boolean = false;
  submitEdit: boolean = false;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private service: GeneralserviceService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.initForms();
    this.loginData = this.service.getLoginResponse();
    this.getInventoryList();
    this.getCompanyListFromProducts();
    this.setupValueCalculation();
  }

  initForms() {
    this.addInventoryForm = this.fb.group({
      sourceOfStock: ['', Validators.required],
      companyNameORPlant: ['', Validators.required],
      postingDate: ['', Validators.required],
      productCode: ['', Validators.required],
      productName: ['', Validators.required],
      materialType: ['', Validators.required],
      value: [''],
      batch: ['', Validators.required],
      sLock: ['', Validators.required],
      availableStock: ['', Validators.required],
      uom: [''],
      createdAt: [''],
      updatedAt: [''],
    });

    this.editInventoryForm = this.fb.group({
      sourceOfStock: ['', Validators.required],
      companyNameORPlant: ['', Validators.required],
      postingDate: ['', Validators.required],
      productCode: ['', Validators.required],
      productName: ['', Validators.required],
      materialType: ['', Validators.required],
      value: [''],
      batch: ['', Validators.required],
      sLock: ['', Validators.required],
      availableStock: ['', Validators.required],
      uom: [''],
      createdAt: [''],
      updatedAt: [''],
    });
  }

  setupValueCalculation() {
    // Add form auto-calc
    this.addInventoryForm.get('availableStock')?.valueChanges.subscribe(qty => {
      qty = Number(qty);
      if (qty > 0 && this.selectedPurchasePriceForAdd > 0) {
        this.addInventoryForm.patchValue({ value: qty * this.selectedPurchasePriceForAdd }, { emitEvent: false });
      } else {
        this.addInventoryForm.patchValue({ value: '' }, { emitEvent: false });
      }
    });

    // Edit form auto-calc
    this.editInventoryForm.get('availableStock')?.valueChanges.subscribe(qty => {
      qty = Number(qty);
      if (qty > 0 && this.selectedPurchasePriceForEdit > 0) {
        this.editInventoryForm.patchValue({ value: qty * this.selectedPurchasePriceForEdit }, { emitEvent: false });
      } else {
        this.editInventoryForm.patchValue({ value: '' }, { emitEvent: false });
      }
    });
  }

  getCompanyListFromProducts() {
    this.service.getproductList().subscribe({
      next: (res: any) => {
        this.productList = res.data || [];
        this.companyList = [...new Set(this.productList.map(p => p.companyNameORPlant))];
      },
      error: () => this.toastr.error('Failed to load company list'),
    });
  }

  // ADD MODAL
  openAddModal() {
    this.submitAdd = false;
    this.addInventoryForm.reset();
    this.filteredProductsForAdd = [];
    this.selectedPurchasePriceForAdd = 0;
    this.modalService.open(this.addInventoryTemplate, { size: 'lg', backdrop: 'static' });
  }

  onAddCompanyChange(event: any) {
    const selectedCompany = event.target.value;
    this.filteredProductsForAdd = this.productList.filter(p => p.companyNameORPlant === selectedCompany);
    this.addInventoryForm.patchValue({
      productCode: '',
      productName: '',
      materialType: '',
      uom: '',
      sLock: '',
    });
    this.selectedPurchasePriceForAdd = 0;
  }

  onAddProductSelect(event: any) {
    const selectedCode = event.target.value;
    const selectedProduct = this.filteredProductsForAdd.find(p => p.productCode === selectedCode);
    if (selectedProduct) {
      this.selectedPurchasePriceForAdd = Number(selectedProduct.purchasePrice);
      this.addInventoryForm.patchValue({
        productCode: selectedProduct.productCode,
        productName: selectedProduct.productName,
        materialType: selectedProduct.materialType,
        uom: selectedProduct.uom,
        sLock: selectedProduct.sLock,
      });
    }
  }

  saveAddInventory() {
    this.submitAdd = true;
    if (this.addInventoryForm.invalid) {
      this.toastr.error('Please fill all required fields');
      return;
    }

    const payload = { ...this.addInventoryForm.value };
    this.spinner.show();
    this.service.SaveInventory(payload).subscribe({
      next: () => {
        this.spinner.hide();
        this.toastr.success('Inventory Saved Successfully');
        this.modalService.dismissAll();
        this.getInventoryList();
        this.submitAdd = false;
      },
      error: () => {
        this.spinner.hide();
        this.toastr.error('Error saving inventory');
      },
    });
  }

  // EDIT MODAL
  openEditModal(data: any) {
    this.submitEdit = false;
    this.editingInventoryId = data.inventoryUniqueId;
    this.filteredProductsForEdit = this.productList.filter(p => p.companyNameORPlant === data.companyNameORPlant);

    this.editInventoryForm.patchValue({
      sourceOfStock: data.sourceOfStock,
      companyNameORPlant: data.companyNameORPlant,
      postingDate: this.formatDateForInput(data.postingDate),
      productCode: data.productCode,
      productName: data.productName,
      materialType: data.materialType,
      batch: data.batch,
      sLock: data.sLock,
      availableStock: Number(data.availableStock),
      value: Number(data.value),
      uom: data.uom,
      createdAt: this.formatDateForInput(data.createdAt),
      updatedAt: this.formatDateForInput(data.updatedAt),
    });

    this.selectedPurchasePriceForEdit = Number(this.productList.find(p => p.productCode === data.productCode)?.purchasePrice) || 0;

    this.modalService.open(this.editInventoryTemplate, { size: 'lg', backdrop: 'static' });
  }

  onEditCompanyChange(event: any) {
    const selectedCompany = event.target.value;
    this.filteredProductsForEdit = this.productList.filter(p => p.companyNameORPlant === selectedCompany);
    this.editInventoryForm.patchValue({
      productCode: '',
      productName: '',
      materialType: '',
      uom: '',
      sLock: '',
    });
    this.selectedPurchasePriceForEdit = 0;
  }

  onEditProductSelect(event: any) {
    const selectedCode = event.target.value;
    const selectedProduct = this.filteredProductsForEdit.find(p => p.productCode === selectedCode);
    if (selectedProduct) {
      this.selectedPurchasePriceForEdit = Number(selectedProduct.purchasePrice);
      this.editInventoryForm.patchValue({
        productCode: selectedProduct.productCode,
        productName: selectedProduct.productName,
        materialType: selectedProduct.materialType,
        uom: selectedProduct.uom,
        sLock: selectedProduct.sLock,
      });
    }
  }

  saveEditInventory() {
    this.submitEdit = true;
    if (this.editInventoryForm.invalid) {
      this.toastr.error('Please fill all required fields');
      return;
    }

    const payload = {
      ...this.editInventoryForm.value,
      inventoryUniqueId: this.editingInventoryId,
    };

    this.spinner.show();
    this.service.updateExitInventory(payload).subscribe({
      next: () => {
        this.spinner.hide();
        this.toastr.success('Inventory Updated Successfully');
        this.modalService.dismissAll();
        this.getInventoryList();
        this.submitEdit = false;
        this.editingInventoryId = null;
      },
      error: () => {
        this.spinner.hide();
        this.toastr.error('Error updating inventory');
      },
    });
  }

  // COMMON METHODS
  getInventoryList() {
    this.spinner.show();
    this.service.getInventoryList().subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.inventoryList = res.data || [];
      },
      error: () => {
        this.spinner.hide();
        this.toastr.error('Failed to load inventory');
      },
    });
  }

  deleteInventory(data: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this inventory?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(result => {
      if (result.isConfirmed) {
        this.inventoryList = this.inventoryList.filter(i => i.inventoryUniqueId !== data.inventoryUniqueId);
        Swal.fire({ title: 'Deleted!', text: 'Inventory removed successfully', icon: 'success', timer: 2000 });
      }
    });
  }

  formatDateForInput(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    const hours = ('0' + d.getHours()).slice(-2);
    const minutes = ('0' + d.getMinutes()).slice(-2);
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
