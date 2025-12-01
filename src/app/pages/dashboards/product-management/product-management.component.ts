import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GeneralserviceService } from 'src/app/generalservice.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-product-management',
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxSpinnerModule],
})
export class ProductManagementComponent implements OnInit {

  @ViewChild('addProductTemplate') addProductTemplate!: TemplateRef<any>;
  @ViewChild('editProductTemplate') editProductTemplate!: TemplateRef<any>;

  ProductCreationForm!: FormGroup;
  selectedImageBase64: string = '';
  productList: any[] = [];

  editingProductId: any = null;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private service: GeneralserviceService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {

    this.ProductCreationForm = this.fb.group({
      companyNameORPlant: ['', Validators.required],
      productCode: ['', Validators.required],
      productName: ['', Validators.required],
      materialType: ['', Validators.required],
      purchasePrice: ['', Validators.required],
      cogm: [''],
      salesPrice: ['', Validators.required],
      igstPer: [''],
      sgstPer: [''],
      cgstPer: [''],
      selfLifeDays: [''],
      batchReq: ['', Validators.required],
      hsnCode: ['', Validators.required],
      uom: ['', Validators.required],
      sLock: ['', Validators.required],
      image: [''],
      qmReq: ['', Validators.required]
    });

    this.getProductList();
  }

  // Image Selection
  onImageSelect(event: any) {
    let file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.selectedImageBase64 = reader.result as string;
      this.ProductCreationForm.patchValue({ image: this.selectedImageBase64 });
    };
    reader.readAsDataURL(file);
  }

  // Open Add Product Modal
  openAddModal() {
    this.ProductCreationForm.reset();
    this.selectedImageBase64 = '';
    this.modalService.open(this.addProductTemplate, { size: 'lg' });
  }

  // Open Edit Product Modal
  openEditModal(product: any) {
    this.editingProductId = product.productMasterUniqueId;

    this.ProductCreationForm.patchValue({
      companyNameORPlant: product.companyNameORPlant,
      productCode: product.productCode,
      productName: product.productName,
      materialType: product.materialType,
      purchasePrice: product.purchasePrice,
      cogm: product.cogm,
      salesPrice: product.salesPrice,
      igstPer: product.igstPer,
      sgstPer: product.sgstPer,
      cgstPer: product.cgstPer,
      selfLifeDays: product.selfLifeDays,
      batchReq: product.batchReq?.trim().toLowerCase() === 'yes' ? 'Yes' : 'No',
      hsnCode: product.hsnCode,
      uom: product.uom,
      sLock: product.sLock,
      image: product.image,
      qmReq: product.qmReq?.trim().toLowerCase() === 'yes' ? 'Yes' : 'No'
    });

    this.selectedImageBase64 = product.image;

    this.modalService.open(this.editProductTemplate, { size: 'lg' });
  }

  // Save Add Product
  saveAddProduct() {
    if (this.ProductCreationForm.invalid) {
      this.toastr.error("Please fill all required fields");
      return;
    }

    let payload = {
      ...this.ProductCreationForm.value,
      companyNameORPlant: this.ProductCreationForm.value.companyNameORPlant.toUpperCase(),
      productCode: this.ProductCreationForm.value.productCode.toUpperCase(),
      productName: this.ProductCreationForm.value.productName.toUpperCase(),
      materialType: this.ProductCreationForm.value.materialType.toUpperCase(),
      batchReq: this.ProductCreationForm.value.batchReq.toUpperCase(),
      hsnCode: this.ProductCreationForm.value.hsnCode.toUpperCase(),
      image: this.selectedImageBase64,
      qmReq: this.ProductCreationForm.value.qmReq.toUpperCase()
    };

    this.spinner.show();
    this.service.SaveProductMaster(payload).subscribe({
      next: () => {
        this.spinner.hide();
        this.toastr.success("Product Saved Successfully");
        this.modalService.dismissAll();
        this.getProductList();
      },
      error: () => {
        this.spinner.hide();
        this.toastr.error("Error saving product");
      }
    });
  }

  // Save Edit Product
  saveEditProduct() {
    if (this.ProductCreationForm.invalid) {
      this.toastr.error("Please fill all required fields");
      return;
    }

    let payload = {
      ...this.ProductCreationForm.value,
      companyNameORPlant: this.ProductCreationForm.value.companyNameORPlant.toUpperCase(),
      productCode: this.ProductCreationForm.value.productCode.toUpperCase(),
      productName: this.ProductCreationForm.value.productName.toUpperCase(),
      materialType: this.ProductCreationForm.value.materialType.toUpperCase(),
      batchReq: this.ProductCreationForm.value.batchReq.toUpperCase(),
      hsnCode: this.ProductCreationForm.value.hsnCode.toUpperCase(),
      image: this.selectedImageBase64,
      qmReq: this.ProductCreationForm.value.qmReq.toUpperCase(),
      productMasterUniqueId: this.editingProductId
    };

    this.spinner.show();
    this.service.updateExitProductMaster(payload).subscribe({
      next: () => {
        this.spinner.hide();
        this.toastr.success("Product Updated Successfully");
        this.modalService.dismissAll();
        this.getProductList();
      },
      error: () => {
        this.spinner.hide();
        this.toastr.error("Update Failed");
      }
    });
  }

  // Load Product List
  getProductList() {
    this.spinner.show();
    this.service.getproductList().subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.productList = res.data || [];
      },
      error: () => {
        this.spinner.hide();
        this.toastr.error("Failed to load product list");
      }
    });
  }

  // Delete Product
  deleteProduct(index: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to delete this product?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productList.splice(index, 1);
        Swal.fire({
          title: 'Deleted!',
          text: "Product removed successfully",
          icon: 'success',
          timer: 2000
        });
      }
    });
  }

}
