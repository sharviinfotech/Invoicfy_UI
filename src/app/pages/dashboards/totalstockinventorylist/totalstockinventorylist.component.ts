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
  selector: 'app-totalstockinventorylist',
  templateUrl: './totalstockinventorylist.component.html',
  styleUrl: './totalstockinventorylist.component.css',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxSpinnerModule],
})
export class TotalstockinventorylistComponent {
  inventoryList: any;
  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private service: GeneralserviceService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {

    this.getInventoryList();

  }

  getInventoryList() {
    this.spinner.show();
    this.inventoryList = []
    this.service.getInventoryList().subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.inventoryList = res.data.filter(item =>
          !item.partialDelete || item.partialDelete === ""
        );
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
        this.spinner.show();
        console.log('Deleting Customer with ID:', data);

        let deletePayload = {
          globalId: data.inventoryUniqueId,
          screenName: "totalstock&inventorylist"
        };

        console.log("Delete payload:", deletePayload);
        this.service.partialDeteleGlobal(deletePayload).subscribe((res: any) => {
          console.log("deleteGlobal response:", res);
          this.spinner.hide();
          if (res.status === 200) {
            Swal.fire({
              title: 'Success',
              text: res.message,
              icon: 'success',
              confirmButtonText: 'OK',
              timer: 5000
            }).then(() => {
              this.modalService.dismissAll();
              this.getInventoryList()
            });

          } else {
            this.toastr.error(res.message);
          }
        }, (error) => {
          this.spinner.hide();
          console.error("Error deleting customer:", error);
          this.toastr.error("Failed to delete customer");
        })

      }
    });
  }
}
