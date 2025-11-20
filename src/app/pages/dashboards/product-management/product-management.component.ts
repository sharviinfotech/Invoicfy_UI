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

  @ViewChild('newcompanyTemplate') newcompanyTemplate!: TemplateRef<any>;

  ProductCreationForm!: FormGroup;
  selectedImageBase64: string = '';
  productList: any[] = [];

  editMode: boolean = false;
  editingProductId: any = null;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private service: GeneralserviceService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {

    // Form
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
      image: [''],
      qmReq: ['', Validators.required]
    });

    this.getProductList();
  }

  // Get Base64 Image
  onImageSelect(event: any) {
    let file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.selectedImageBase64 = reader.result as string;
      this.ProductCreationForm.patchValue({ image: this.selectedImageBase64 });
    };
    reader.readAsDataURL(file);
  }

  // Open Modal - Add New
  newCompanyCreation(templateRef: TemplateRef<any>) {
    this.editMode = false;
    this.editingProductId = null;
    this.selectedImageBase64 = '';
    this.ProductCreationForm.reset();
    this.modalService.open(templateRef, { size: 'lg' });
  }

  // Open Modal - Edit Product
  editProduct(product: any, templateRef: TemplateRef<any>) {
    this.editMode = true;

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
      batchReq: product.batchReq,
      hsnCode: product.hsnCode,
      image: product.image,
      qmReq: product.qmReq
    });

    this.selectedImageBase64 = product.image;

    this.modalService.open(templateRef, { size: 'lg' });
  }

  // Save + Update
  savecompanyCreation(modal?: any) {

    if (this.ProductCreationForm.invalid) {
      this.toastr.error("Please fill all required fields");
      return;
    }

    let payload: any = {
      companyNameORPlant: this.ProductCreationForm.value.companyNameORPlant.toUpperCase(),
      productCode: this.ProductCreationForm.value.productCode.toUpperCase(),
      productName: this.ProductCreationForm.value.productName.toUpperCase(),
      materialType: this.ProductCreationForm.value.materialType.toUpperCase(),
      purchasePrice: this.ProductCreationForm.value.purchasePrice,
      cogm: this.ProductCreationForm.value.cogm,
      salesPrice: this.ProductCreationForm.value.salesPrice,
      igstPer: this.ProductCreationForm.value.igstPer,
      sgstPer: this.ProductCreationForm.value.sgstPer,
      cgstPer: this.ProductCreationForm.value.cgstPer,
      selfLifeDays: this.ProductCreationForm.value.selfLifeDays,
      batchReq: this.ProductCreationForm.value.batchReq.toUpperCase(),
      hsnCode: this.ProductCreationForm.value.hsnCode.toUpperCase(),
      image: this.selectedImageBase64,
      qmReq: this.ProductCreationForm.value.qmReq.toUpperCase()
    };

    // ===== UPDATE CALL =====
    if (this.editMode) {
      payload.productMasterUniqueId = this.editingProductId;
      this.spinner.show();

      this.service.updateExitProductMaster(payload).subscribe({
        next: (res: any) => {
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
      return;
    }

    // ===== SAVE CALL =====
    this.spinner.show();
    this.service.SaveProductMaster(payload).subscribe({
      next: (res: any) => {
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

        this.productList.splice(index, 1); // remove row from array

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
