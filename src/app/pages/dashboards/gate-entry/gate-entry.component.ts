import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { GeneralserviceService } from 'src/app/generalservice.service';

@Component({
  selector: 'app-gate-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],

  templateUrl: './gate-entry.component.html',
  styleUrls: ['./gate-entry.component.css']
})
export class GateEntryComponent implements OnInit {

  gateEntryForm!: FormGroup;
  previewImage: any = null;
  gateSearchValue: any = '';
  generateGatePassNo: any;
  generateGatePass: any;
  constructor(
    private fb: FormBuilder,
    private service: GeneralserviceService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.gateEntryForm = this.fb.group({
      EntryObjectType: ['', Validators.required],
      VehicleType: ['', Validators.required],
      VehicleEntrydatetime: ['', Validators.required],
      VehicleNumber: ['', Validators.required],
      DriverName: ['', Validators.required],
      DriverContactNO: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      DriverId: ['', Validators.required],
      PO: ['', Validators.required],
      ProductCode: ['', Validators.required],
      ProductName: ['', Validators.required],
      Quantity: ['', Validators.required],
      Uom: ['', Validators.required],
      GatePassNo: ['', Validators.required],
      visitorType: [''],
      visitorName: [''],
      PurposeofVisit: [''],
      EmployeResponsible: ['', Validators.required],
      IdType: ['', Validators.required],
      ImageCapturing: ['', Validators.required],
      ExitDateTime: [''],
      ItemCode: [''],
      SerialNumber: [''],
      ResponsiblePerson: [''],
      ApproverName: ['', Validators.required]
    });
  }

  onImageSelect(event: any) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result;
        this.gateEntryForm.patchValue({ ImageCapturing: reader.result });
      };
      reader.readAsDataURL(file);
    }
  }

  SaveGateEntry() {

    if (!this.gateEntryForm.value.GatePassNo) {
      this.generateGatePass();
    }

    if (this.gateEntryForm.invalid) {
      this.toastr.error("Please fill all required fields!", "Validation Error");
      return;
    }

    const payload = { ...this.gateEntryForm.value };

    this.spinner.show();

    this.service.SaveGateEntry(payload).subscribe({
      next: () => {
        this.spinner.hide();
        Swal.fire("Success!", "Gate Entry Saved Successfully", "success");
        this.gateEntryForm.reset();
        this.previewImage = null;
      },
      error: () => {
        this.spinner.hide();
        this.toastr.error("Failed to Save Entry", "Error");
      }
    });
  }


  GetGateEntry() {

    if (!this.gateSearchValue) {
      this.toastr.error("Please enter Gate Entry Number");
      return;
    }

    const requestPayload = { gatEntryUniqueId: Number(this.gateSearchValue) };

    this.spinner.show();

    this.service.fetchgateentry(requestPayload).subscribe({
      next: (response: any) => {
        this.spinner.hide();

        if (response.status === 200 && response.updatedList) {

          const data = response.updatedList;

          // Patch data to form
          this.gateEntryForm.patchValue({
            EntryObjectType: data.EntryObjectType,
            VehicleType: data.VehicleType,
            VehicleEntrydatetime: data.VehicleEntrydatetime?.slice(0, 16), // convert ISO for datetime-local
            VehicleNumber: data.VehicleNumber,
            DriverName: data.DriverName,
            DriverContactNO: data.DriverContactNO,
            DriverId: data.DriverId,
            PO: data.PO,
            ProductCode: data.ProductCode,
            ProductName: data.ProductName,
            Quantity: data.Quantity,
            Uom: data.Uom,
            GatePassNo: data.GatePassNo,
            visitorType: data.visitorType,
            visitorName: data.visitorName,
            PurposeofVisit: data.PurposeofVisit,
            EmployeResponsible: data.EmployeResponsible,
            IdType: data.IdType,
            ImageCapturing: data.ImageCapturing,
            ExitDateTime: data.ExitDateTime ? data.ExitDateTime : '',
            ItemCode: data.ItemCode,
            SerialNumber: data.SerialNumber,
            ResponsiblePerson: data.ResponsiblePerson,
            ApproverName: data.ApproverName
          });

          this.previewImage = data.ImageCapturing; // show saved image

          Swal.fire("Success", "Gate Entry Fetched Successfully", "success");

        } else {
          this.toastr.warning("No record found for this Gate No");
        }
      },
      error: () => {
        this.spinner.hide();
        this.toastr.error("Failed to fetch data", "Error");
      }
    });

  }




}
