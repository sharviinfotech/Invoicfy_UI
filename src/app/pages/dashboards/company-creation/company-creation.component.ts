// import { Component } from '@angular/core';

import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GeneralserviceService } from 'src/app/generalservice.service'; // Adjust path if necessary
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-company-creation',
  templateUrl: './Company-creation.component.html',
  styleUrl: './Company-creation.component.css',
  imports: [CommonModule, ReactiveFormsModule, FormsModule,NgxSpinnerModule],
  standalone: true
})
export class CompanyCreationComponent {
  @ViewChild('editCompanyTemplate') editCompanyTemplate!: TemplateRef<any>;  creditPeriodList: string[] = ['15 days', '30 days', '45 days'];
   
  statesList: any[] = [];
  companyEditForm:  FormGroup;
   Createcompany: any[] = [];
   selectedcompany: any = null;
   modalRef: any;
 
 
   fieldTextType: boolean = false;
   submitted: boolean = false;
 confirmFieldTextType: boolean = false;
 companyList: any[];
   submit: boolean=false;
   companyUniqueId: number;
   loginData: any;
   StateName: string;
 
newcompanyTemplate: any;
  CompanyCreationForm: any;
  companyForm: any;


 // spinner: any;
 
 
 
 
   constructor(
     private modalService: NgbModal,
     private fb: FormBuilder,
     private service: GeneralserviceService,private toastr: ToastrService,private spinner:NgxSpinnerService
   ) {}
 
   ngOnInit(): void {
     this.getStates();
     this.CompanyCreationForm  = this.fb.group({
       companyName: ['', Validators.required],
       companyAddress: ['', Validators.required],
       companyCity: ['', Validators.required],
       companyState: ['', Validators.required],
       companyPincode: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{6}$/)
        ]
      ],
       companyGstNo: ['', Validators.required],
       companyPanNo:  ['',
        [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)]  // Correct PAN format
      ],
   
       companyEmail: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
       companyFinanceContact: ['', [Validators.required,  Validators.pattern('^[0-9]{10}$')]],
       companyAlernativecontact: ['',],
       companyBankName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
  companyBranchName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
  companyBankAccount_No: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.maxLength(17)]],
      companyIFSCcode: ['', [Validators.required, Validators.pattern('[A-Za-z]{4}[0][A-Za-z0-9]{6}')]], // Add required validator and pattern
 
 
     });
 
   
 
 
     this.companyEditForm  = this.fb.group({
 
       companyName: ['', Validators.required],
       companyAddress: ['', Validators.required],
       companyCity: ['', Validators.required],
       companyState: ['', Validators.required],
       companyPincode: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{6}$/)
        ]
      ],       companyGstNo: ['', Validators.required],
       companyPanNo: ['', [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)]],

       companyEmail: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
       companyFinanceContact: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
       companyAlernativecontact: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
       companyBankName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
  companyBranchName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
  companyBankAccount_No: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.maxLength(17)]],
      companyIFSCcode: ['', [Validators.required, Validators.pattern('[A-Za-z]{4}[0][A-Za-z0-9]{6}')]], // Add required validator and pattern
 
 
     }, {
       // validator: this.mustMatch('password', 'confirmPassword')
     });
   
     this.getInvoicecompanyDetails();
     this.getAllcompanyList();
   
   
     this.loginData = this.service.getLoginResponse()
   }
   convertToUpperCase(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
  }
  
   editcompany(selectedcompany: any, content: any) {
     console.log('selected company:', selectedcompany); // Debugging
 
     if (!selectedcompany) {
       console.error('No company data found');
       return;
     }
   }
   
     // Allow only letters
allowOnlyLetters(event: KeyboardEvent): boolean {
  const charCode = event.keyCode;
  if ((charCode > 64 && charCode < 91) ||  // A-Z
      (charCode > 96 && charCode < 123) || // a-z
      charCode === 32) {                   // space
    return true;
  }
  event.preventDefault();
  return false;
}

// Allow only numbers
allowOnlyNumbers(event: KeyboardEvent): boolean {
  const charCode = event.keyCode;
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    event.preventDefault();
    return false;
  }
  return true;
}



   
   openEditModal(company: any, editCompanyTemplate: TemplateRef<any>): void {
     this.submit = false
     console.log('company',company);
     this.companyUniqueId =null
     const selectedcompany = company;
     this.companyUniqueId = company.companyUniqueId
     this.companyEditForm.patchValue({
       companyName: selectedcompany.companyName,
       companyAddress: selectedcompany.companyAddress,
       companyCity: selectedcompany.companyCity,
       companyState: selectedcompany.companyState,
       companyPincode: selectedcompany.companyPincode,
       companyGstNo: selectedcompany.companyGstNo,
       companyPanNo:selectedcompany.companyPanNo,
       companyEmail:selectedcompany.companyEmail,
       companyFinanceContact: selectedcompany.companyFinanceContact,
       companyAlernativecontact: selectedcompany.companyAlernativecontact,
       companyBankName:selectedcompany.companyBankName,
       companyBankAccount_No:selectedcompany.companyBankAccount_No,
       companyIFSCcode:selectedcompany.companyIFSCcode,
       companyBranchName:selectedcompany.companyBranchName
 
     });
     this.modalService.open(editCompanyTemplate, {
      backdrop: 'static',
      keyboard: false,
      size: 'lg'
    }); 
     }
   getStates() {
     console.log("state ")
     this.spinner.show();
     this.service.getstateList().subscribe(
       (response: any) => {
         this.spinner.hide()
         if (response && response.responseData) {
           this.statesList = response.responseData.data;
         }
       },
       (error) => {
 
         console.error('Error fetching statesList:', error);
       }
     );
   }

   toggleFieldTextType() {
     this.fieldTextType = !this.fieldTextType;
   }
   toggleConfirmFieldTextType() {
     this.confirmFieldTextType = !this.confirmFieldTextType;
   }
   toggleStatus(): void {
     this.companyEditForm.patchValue({ status: !this.companyEditForm.value.status });
   }
 
 
 
   getInvoicecompanyDetails(): void {
   
   }
 
   newCompanyCreation(newcompanyTemplate: any): void {
    this.submit = false
    this.CompanyCreationForm.reset()
     // Form reset before opening the modal
    this.modalService.open(newcompanyTemplate, { 
      backdrop: 'static',
      keyboard: false,
      size: 'lg' 
    });
  }
  
  
   get f() {
      return this.CompanyCreationForm.controls;
      return this.companyEditForm.controls;
      }
     
    
 
 
 
      savecompanyCreation(model:any) {
      console.log('Create company:', this.CompanyCreationForm.value);
       
          if (this.CompanyCreationForm.invalid == true) {
            this.submit = true;
            return;
          } else {
            this.submit = false;
          }
       
          let creatObj = {
            "companyName": this.CompanyCreationForm.value.companyName.toUpperCase(),
            "companyAddress": this.CompanyCreationForm.value.companyAddress.toUpperCase(),
            "companyCity": this.CompanyCreationForm.value.companyCity.toUpperCase(),
            "companyState": this.CompanyCreationForm.value.companyState.toUpperCase(),
            "companyPincode": this.CompanyCreationForm.value.companyPincode,
            "companyGstNo": this.CompanyCreationForm.value.companyGstNo.toUpperCase(),
            "companyPanNo": this.CompanyCreationForm.value.companyPanNo.toUpperCase(),
            "companyEmail":this.CompanyCreationForm.value.companyEmail,
            "companyFinanceContact":this.CompanyCreationForm.value.companyFinanceContact,
            "companyAlernativecontact":this.CompanyCreationForm.value.companyAlernativecontact,
            "companyBankName":this.CompanyCreationForm.value.companyBankName.toUpperCase(),
            "companyBankAccount_No":this.CompanyCreationForm.value.companyBankAccount_No.toUpperCase(),
            "companyIFSCcode":this.CompanyCreationForm.value.companyIFSCcode.toUpperCase(),
            "companyBranchName":this.CompanyCreationForm.value.companyBranchName.toUpperCase()
 
 
         
          };
       
          console.log("creatObj", creatObj);
       
          this.service.SaveCompanyCreation(creatObj).subscribe((res: any) => {
            console.log("submitcompanyForm", res);
            console.log('apiErr', res, res.responseData);
     
            if(res.status == 400){
              // this.toastr.success(res.message);
            }else{
               // Display success toast
               this.CompanyCreationForm.reset()
            this.modalService.dismissAll(model);
            Swal.fire({
              title: '',
              text: res.message,
              icon: 'success',
              cancelButtonText: 'Ok'
            }).then((result) => {
              if (result) {
       
              } else {
       
              }
            });
            }
       
         
       
            this. getAllcompanyList();
            // this.modalService.dismissAll(modal);
            this.submitted = true;
          }, error => {
              this.toastr.error(error)
            // this.modalService.dismissAll(modal);
            console.log("error", error);
          });
        }
   c(message: string) {
     // Handle the close logic here
     console.log(message);
     // You might want to close the modal or clear form fields, etc.
   }
   updateExitcompany(modal: any): void {
    console.log('Edit company:', this.companyEditForm.value);
    this.submitted = true;
  
    // if (this.companyEditForm.errors) {
    //   console.log('Form is errors');
    //   return;
    // }
  
    let updateObj = {
      companyUniqueId: this.companyUniqueId,
     companyName: this.companyEditForm.value.companyName.toUpperCase(),
     companyAddress: this.companyEditForm.value.companyAddress.toUpperCase(),
     companyCity: this.companyEditForm.value.companyCity.toUpperCase(),
     companyState: this.companyEditForm.value.companyState.toUpperCase(),
     companyPincode: this.companyEditForm.value.companyPincode,
     companyGstNo: this.companyEditForm.value.companyGstNo.toUpperCase(),
     companyPanNo: this.companyEditForm.value.companyPanNo.toUpperCase(),
     companyEmail:this.companyEditForm.value.companyEmail,
     companyFinanceContact:this.companyEditForm.value.companyFinanceContact,
     companyAlernativecontact:this.companyEditForm.value.companyAlernativecontact,
     companyBankName:this.companyEditForm.value.companyBankName.toUpperCase(),
     companyBankAccount_No:this.companyEditForm.value.companyBankAccount_No.toUpperCase(),
     companyIFSCcode:this.companyEditForm.value.companyIFSCcode.toUpperCase(),
     companyBranchName:this.companyEditForm.value.companyBranchName.toUpperCase()
          
    };
  
    console.log("Updating company with data:", updateObj);
    this.spinner.show();
  
    this.service.updateExitCompany(updateObj).subscribe(
      (res: any) => {
        console.log("updatecompanyCreation response:", res);
        this.spinner.hide()
  
        if (res.status === 400) {
          this.toastr.error(res.message);
        } else {
          // this.toastr.success("company updated successfully");
          this.modalService.dismissAll(modal);
          Swal.fire({
            title: '',
            text: res.message,
            icon: 'success',
            confirmButtonText: 'OK'
          }).then(() => {
            this.getAllcompanyList();
          });
        }
  
        this.companyEditForm.reset();
        this.submitted = false;
      },
      (error) => {
        this.spinner.hide()
        console.error("Error updating company:", error);
        this.toastr.error("Failed to update company");
      }
    );
  }
  // delete(data): void {
  //   console.log('Deleting company with ID:',data, this.companyUniqueId);
  // this.companyUniqueId = data.companyUniqueId
  //   let deletePayload = {
  //     globalId: this.companyUniqueId,
  //     screenName: "company"
  //   };
  
  //   console.log("Delete payload:", deletePayload);
  // this.spinner.show()
  //   this.service.deteleGlobal(deletePayload).subscribe((res: any) => {
  //       console.log("deleteGlobal response:", res);
  //       this.spinner.hide()
  //       if (res.status === 400) {
  //         this.toastr.error(res.message);
  //       } else {
  //         Swal.fire({
  //           title: 'succes',
  //           text: res.message,
  //           icon: 'success',
  //           confirmButtonText: 'OK'
  //         }).then(() => {
  //           // this.getAllcompanyList();
  //         });
  //         this.modalService.dismissAll();
         
  //       }
  //     },
  //     (error) => {
  //       this.spinner.hide()
  //       console.error("Error deleting company:", error);
  //       this.toastr.error("Failed to delete company");
  //     }
  //   );
  // }
  delete(data): void {
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to delete this company?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        timer: 10000
    }).then((result) => {
        if (result.isConfirmed) {
            console.log('Deleting company with ID:', data, this.companyUniqueId);
            this.companyUniqueId = data.companyUniqueId;
            
            let deletePayload = {
                globalId: this.companyUniqueId,
                screenName: "company"
            };

            console.log("Delete payload:", deletePayload);
            this.spinner.show();

            this.service.deteleGlobal(deletePayload).subscribe(
                (res: any) => {
                    console.log("deleteGlobal response:", res);
                    this.spinner.hide();
                    
                    if (res.status === 200) {  // Changed to 200 for success
                      this.getAllcompanyList();
                        Swal.fire({
                            title: 'Success',  // Fixed typo in 'success'
                            text: res.message,
                            icon: 'success',
                            confirmButtonText: 'OK',
                            timer: 5000
                        }).then(() => {
                            this.modalService.dismissAll();
                            // Uncomment if you need to refresh the list
                             
                        });
                    } else {
                        this.toastr.error(res.message);
                    }
                },
                (error) => {
                    this.spinner.hide();
                    console.error("Error deleting company:", error);
                    this.toastr.error("Failed to delete company");
                }
            );
        }
    });
}
   getAllcompanyList(){
     this.companyList = [];
     this.spinner.show()
     this.service.getAllCompanyList().subscribe((res:any)=>{
       this.companyList = res.data
       console.log("this.companyList",this.companyList)
       this.spinner.hide()
     },error =>{
     console.log("error",error)
     this.spinner.hide();
     })
   }
   
}
 
