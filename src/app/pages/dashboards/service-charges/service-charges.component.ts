import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GeneralserviceService } from 'src/app/generalservice.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
@Component({
  selector: 'app-service-charges',
  templateUrl: './service-charges.component.html',
  styleUrls: ['./service-charges.component.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxSpinnerModule, NgSelectModule],
  standalone: true
})
export class ServiceChargesComponent implements OnInit {
  @ViewChild('editservicesChargeTemplate') editservicesChargeTemplate!: TemplateRef<any>;
  servicesForm: FormGroup;
  editForm: FormGroup;
  allCharges: any[] = []; // Initialize as an empty array
  // submit: boolean = false;
  submit = false;
  chargesUniqueId: number;
  userRole: string = '';
  customerList: any[] = [];
  companyList: any[] = [];
  servicesEditForm: FormGroup;
  currentChargeId: string | null = null;
  isEditing = false;
  submited: boolean;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private modalService: NgbModal,
    private service: GeneralserviceService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService, private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.servicesForm = this.fb.group({
      servicesName: ['', Validators.required],
      poNumber: ['', Validators.required],
      HSN_SAC: ['', Validators.required],
      UOM: ['', Validators.required],
      customerName: [null, [Validators.required, this.objectIdValidator]],
      companyName: [null, [Validators.required, this.objectIdValidator]],
    });
    this.editForm = this.fb.group({
      servicesName: ['', Validators.required],
      poNumber: ['', Validators.required],
      HSN_SAC: ['', Validators.required],
      UOM: ['', Validators.required],
      customerName: [null, [Validators.required, this.objectIdValidatorEdit]],
      companyName: [null, [Validators.required, this.objectIdValidatorEdit]]
    });


    this.getAllCharges(); // Fetch charges when the component initializes
    this.getAllcompanyList();
    this.getAllCustomerList();
    this.route.queryParams.subscribe(params => {
      this.userRole = params['role'];
      console.log('User Role:', this.userRole);
    });
  }

  objectIdValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    return value && typeof value === 'object' && value._id ? null : { invalidObject: true };
  }

  objectIdValidatorEdit(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value) return { required: true };

    // If string, assume valid
    if (typeof value === 'string') return null;

    // If object, check for expected property (like customerName or _id)
    if (typeof value === 'object' && value.customerName) return null;

    return { invalidObject: true };
  }
  // Allow only letters for service name
  allowOnlyLetters(event: KeyboardEvent) {
    const charCode = event.keyCode;
    if ((charCode > 64 && charCode < 91) || (charCode > 96 && charCode < 123) || charCode === 32) {
      return true;
    }
    event.preventDefault();
    return false;
  }

  // Allow only numbers for PO number
  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }
  // get serivicesName() {
  //   return this.servicesForm.get('serivicesName');
  // }
  get validation() { return this.servicesForm.controls; }

  get editFormValidation() { return this.editForm.controls; }
  // Save() {
  //   console.log("this.servicesForm.invalid",this.servicesForm.invalid)
  //   if (this.servicesForm.invalid) {
  //     this.submit = true;
  //     return;
  //   }

  //   let data = {
  //     customerName: this.servicesForm.value.customerName,
  //     companyName: this.servicesForm.value.companyName,
  //     serviceName: this.servicesForm.value.servicesName,
  //     PoNumber:this.servicesForm.value.poNumber




  //   };
  //   this.spinner.show()
  //   this.service.SaveCharges(data).subscribe((res: any) => {
  //     this.spinner.hide()

  //     if (res.status === 200) {

  //       this.getAllCharges(); // Refresh the list after saving
  //       this.servicesForm.reset(); // Reset the form
  //         Swal.fire({
  //                   text: res.message,
  //                   icon: 'success',
  //                   confirmButtonText: 'OK'
  //                 }).then(() => {

  //                 });

  //     } else {
  //       this.toastr.error('Failed to save charge.');
  //     }
  //   }, error => {
  //     this.toastr.error('An error occurred while saving the charge.');
  //     console.error("Error saving charge:", error);
  //     this.spinner.hide()

  //   });

  // }
  //   Save() {
  //     console.log("Form validity:", this.servicesForm.valid);
  //     console.log("Form value:", this.servicesForm.value);
  //     console.log("Form errors:", this.servicesForm.errors);

  //     // Log each control's status
  //     Object.keys(this.servicesForm.controls).forEach(key => {
  //       const control = this.servicesForm.get(key);
  //       console.log(`Control ${key}:`, {
  //         valid: control.valid,
  //         errors: control.errors,
  //         value: control.value
  //       });
  //     });

  //     // if (this.servicesForm.invalid) {
  //     //   console.warn("Form is invalid - not submitting");
  //     //   this.submit = true;

  //     //   // Mark all controls as touched to show validation messages
  //     //   this.servicesForm.markAllAsTouched();
  //     //   return;
  //     // }
  //     let customerNameObj;
  //     if (this.servicesForm.value.customerName &&
  //         typeof this.servicesForm.value.customerName === "object" &&
  //         "customerName" in this.servicesForm.value.customerName) {
  //       customerNameObj = this.servicesForm.value.customerName.customerName;
  //     } else {
  //       customerNameObj = this.servicesForm.value.customerName;
  //     }

  //     let companyNameObj;
  //     if (this.servicesForm.value.companyName &&
  //         typeof this.servicesForm.value.companyName === "object" &&
  //         "companyName" in this.servicesForm.value.companyName) {
  //           companyNameObj = this.servicesForm.value.companyName.companyName;
  //     } else {
  //         companyNameObj = this.servicesForm.value.companyName;
  //     }

  //     let data = {
  //       customerName: customerNameObj,
  //       companyName: companyNameObj,
  //       servicesName: this.servicesForm.value.servicesName, // Note: 'servicesName' vs 'serviceName'
  //       PoNumber: this.servicesForm.value.poNumber // Note: 'poNumber' vs 'PoNumber'
  //     };

  //     // Add validation for required fields
  //     if (!data.customerName || !data.servicesName) {
  //       this.toastr.error('Customer name and service name are required');
  //       return;
  //     }

  //     console.log("Submitting data:", data);

  //     this.spinner.show();
  //     this.service.SaveCharges(data).subscribe(
  //       (res: any) => {
  //         this.spinner.hide();
  //         console.log("Save response:", res);

  //         if (res.status === 200) {
  //           this.getAllCharges();
  //           this.servicesForm.reset();
  //           Swal.fire({
  //             text: res.message,
  //             icon: 'success',
  //             confirmButtonText: 'OK'
  //           });
  //         } else {
  //           this.toastr.error(res.message || 'Failed to save charge.');
  //         }
  //       },
  //       error => {
  //         this.spinner.hide();
  //         console.error("Save error:", error);
  //         this.toastr.error(error.message || 'An error occurred while saving the charge.');
  //       }
  //     );
  // }
  Save() {
    // Debug logs
    console.log("Form data before submission:", this.servicesForm.value);
    console.log('Edit services:', this.editForm.value);
    Object.keys(this.servicesForm.controls).forEach(key => {
      const control = this.servicesForm.get(key);
      console.log("issue", `${key} status:`, control?.status, 'value:', control?.value, 'errors:', control?.errors);
    });
    // Validate only required fields
    if (this.servicesForm.invalid == true) {
      this.submit = true;
      // this.servicesForm.markAllAsTouched();
      // this.toastr.error('Customer name and service name are required');
      return;
    }

    // Process customer name
    let customerNameObj;
    if (this.servicesForm.value.customerName &&
      typeof this.servicesForm.value.customerName === "object") {
      customerNameObj = this.servicesForm.value.customerName.customerName ||
        this.servicesForm.value.customerName;
    } else {
      customerNameObj = this.servicesForm.value.customerName;
    }

    console.log("this.servicesForm.value.companyName", this.servicesForm.value.companyName)
    let companyNameObj = '';
    if (this.servicesForm.value.companyName) {
      if (typeof this.servicesForm.value.companyName === "object") {
        companyNameObj = this.servicesForm.value.companyName.companyName ||
          this.servicesForm.value.companyName;
      } else {
        companyNameObj = this.servicesForm.value.companyName;
      }
    }

    // Prepare data object matching backend expectations
    let data = {
      customerName: customerNameObj,
      companyName: companyNameObj, // will be empty string if null
      servicesName: this.servicesForm.value.servicesName,
      poNumber: this.servicesForm.value.poNumber, // or PoNumber if backend expects that
      HSN_SAC: this.servicesForm.value.HSN_SAC,
      UOM: this.servicesForm.value.UOM


    };

    console.log("Final data being sent:", data);

    this.spinner.show();
    this.service.SaveCharges(data).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.status === 200) {
          this.getAllCharges();
          this.submit = false;
          this.servicesForm.reset();
          Swal.fire({
            text: res.message,
            icon: 'success',
            confirmButtonText: 'OK'
          });
        } else {
          this.toastr.error(res.message || 'Failed to save charge.');
        }
      },
      error => {
        this.spinner.hide();
        console.error("Full error response:", error);
        if (error.error) {
          this.toastr.error(error.error.message || 'Server validation failed');
        } else {
          this.toastr.error('An error occurred while saving the charge.');
        }
      }
    );
  }
  // editCharge(charge: any) {
  //   // Store the charge ID for updating
  //   this.currentChargeId = charge.chargesUniqueId;

  //   // Populate the form with the selected charge's data
  //   this.servicesForm.patchValue({
  //     customerName: charge.customerName,
  //     companyName: charge.companyName,
  //     servicesName: charge.servicesName,
  //     poNumber: charge.PoNumber
  //   });

  //   // Open the modal
  //   this.modalService.open(this.editservicesChargeTemplate, {
  //     centered: true,
  //     backdrop: 'static'
  //   });

  //   this.isEditing = true;
  // }
  // Add these properties to your component

  editservicesCharge(charge: any) {
    this.currentChargeId = charge.chargesUniqueId;

    this.editForm.patchValue({
      customerName: charge.customerName,
      companyName: charge.companyName,
      servicesName: charge.servicesName,
      poNumber: charge.poNumber,
      HSN_SAC: charge.HSN_SAC,
      UOM: charge.UOM,
    });

    this.modalService.open(this.editservicesChargeTemplate, {
      centered: true,
      backdrop: 'static',
      size: 'lg' // Adjust size as needed
    });

    this.isEditing = true;
    this.submit = false; // Reset submit flag
  }
  convertToUpperCase(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    inputElement.value = inputElement.value.toUpperCase();
  }

  // Add this new method for updating
  updateCharge() {
    console.log('Edit services:', this.editForm.value);
    Object.keys(this.editForm.controls).forEach(key => {
      const control = this.editForm.get(key);
      console.log("issue", `${key} status:`, control?.status, 'value:', control?.value, 'errors:', control?.errors);
    });

    if (this.editForm.invalid) {
      this.submited = true
      return;
    }

    let updatedata = {
      chargesUniqueId: this.currentChargeId,
      customerName: this.editForm.value.customerName,
      companyName: this.editForm.value.companyName,
      servicesName: this.editForm.value.servicesName, // Note: 'servicesName' vs 'serviceName'
      poNumber: this.editForm.value.poNumber, // Note: 'poNumber' vs 'PoNumber'
      HSN_SAC: this.editForm.value.HSN_SAC,
      UOM: this.editForm.value.UOM
    };
    console.log("Updating services with data:", updatedata);
    this.spinner.show();


    this.service.UpdateCharges(updatedata).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res.status === 200) {
          this.getAllCharges();
          this.submited = false
          this.modalService.dismissAll();
          Swal.fire({
            text: res.message,
            icon: 'success',
            confirmButtonText: 'OK'
          });
        } else {
          this.toastr.error(res.message || 'Failed to update charge');
        }
      },
      error: (err) => {
        this.spinner.hide();
        this.toastr.error(err.error?.message || 'Error updating charge');
      }
    });

  }


  //   delete(data): void {

  //     // if (!servicescharge || !servicescharge.currentChargeId) {
  //     //     console.error("Error: Missing chargesUniqueId in servicescharge object");
  //     //     this.toastr.error("Invalid request: chargesUniqueId is missing");
  //     //     return; // Stop execution if the required ID is missing
  //     // }

  //     console.log('Deleting Services Charge with ID:', data);

  //     this.chargesUniqueId = data.chargesUniqueId;

  //     let deletePayload = {
  //         globalId: this.chargesUniqueId,
  //         screenName: "servicescharge"
  //     };

  //     console.log("Delete payload:", deletePayload);
  //     this.spinner.show();

  //     this.service.deteleGlobal(deletePayload).subscribe(
  //         (res: any) => {
  //             console.log("deleteGlobal response:", res);
  //             this.spinner.hide();

  //             if (res.status === 400) {
  //                 this.toastr.error(res.message);
  //             } else {
  //                 Swal.fire({
  //                     title: 'Success',
  //                     text: res.message,
  //                     icon: 'success',
  //                     confirmButtonText: 'OK'
  //                 }).then(() => {
  //                     this.getAllCharges();
  //                 });

  //                 this.modalService.dismissAll();
  //             }
  //         },
  //         (error) => {
  //             this.spinner.hide();
  //             console.error("Error deleting service charge:", error);
  //             this.toastr.error("Failed to delete service charge");
  //         }
  //     );
  // }
  delete(data): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to delete this service charge?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      timer: 10000
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Deleting Services Charge with ID:', data);
        this.chargesUniqueId = data.chargesUniqueId;

        let deletePayload = {
          globalId: this.chargesUniqueId,
          screenName: "servicescharge"
        };

        console.log("Delete payload:", deletePayload);
        this.spinner.show();

        this.service.deteleGlobal(deletePayload).subscribe(
          (res: any) => {
            console.log("deleteGlobal response:", res);
            this.spinner.hide();

            if (res.status === 200) {
              this.getAllCharges();
              Swal.fire({
                title: 'Success',
                text: res.message,
                icon: 'success',
                confirmButtonText: 'OK',
                timer: 5000
              }).then(() => {

                this.modalService.dismissAll();
              });
            } else {
              this.toastr.error(res.message);
            }
          },
          (error) => {
            this.spinner.hide();
            console.error("Error deleting service charge:", error);
            this.toastr.error("Failed to delete service charge");
          }
        );
      }
    });
  }



  getAllCharges() {
    this.spinner.show()
    this.service.getAllCharges().subscribe((res: any) => {
      this.allCharges = res.data; // Update the allCharges array with the fetched data
      this.spinner.hide()
    }, error => {
      console.error("Error fetching charges:", error);
      this.spinner.hide()

    });
  }
  getAllcompanyList() {
    this.companyList = [];
    this.spinner.show()
    this.service.getAllCompanyList().subscribe((res: any) => {
      this.companyList = res.data
      console.log("this.companyList", this.companyList)
      this.spinner.hide()
    }, error => {
      console.log("error", error)
      this.spinner.hide();
    })
  }
  getAllCustomerList() {
    this.customerList = [];
    this.spinner.show()
    this.service.getAllCustomerList().subscribe(
      (res: any) => {
        this.spinner.hide()
        this.customerList = res.data;
        console.log('this.customerList', this.customerList);
      },
      (error) => {
        this.spinner.hide()
        console.log('error', error);
      }
    );
  }
}