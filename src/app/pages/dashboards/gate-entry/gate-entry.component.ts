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
  isUpdateMode: boolean = false;

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
      ExitDateTime: [''],      // UI lo display
      ItemCode: [''],
      SerialNumber: [''],
      ResponsiblePerson: [''],
      ApproverName: ['', Validators.required]
    });
  }

  generateGatePass() {
    const gatePass = "GP-" + Math.floor(Math.random() * 100000);
    this.gateEntryForm.patchValue({ GatePassNo: gatePass });
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

  // UNIVERSAL DATE CONVERTER - MODIFIED!
  formatDateTimeForInput(dateStr: string | null): string {
    if (!dateStr) return '';

    let d = new Date(dateStr);

    // If browser can't parse (e.g., 23-08-2022 or 13-07-2025 19:04)
    if (isNaN(d.getTime())) {

      // FORMAT: DD-MM-YYYY
      const ddmmyyyy = /^(\d{2})-(\d{2})-(\d{4})$/;

      // FORMAT: DD-MM-YYYY HH:mm
      const ddmmyyyyHHmm = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})$/;

      if (ddmmyyyy.test(dateStr)) {
        const [_, dd, mm, yyyy] = dateStr.match(ddmmyyyy)!;
        return `${yyyy}-${mm}-${dd}T00:00`;
      }

      if (ddmmyyyyHHmm.test(dateStr)) {
        const [_, dd, mm, yyyy, hh, min] = dateStr.match(ddmmyyyyHHmm)!;
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
      }

      return '';
    }

    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    const hours = ('0' + d.getHours()).slice(-2);
    const minutes = ('0' + d.getMinutes()).slice(-2);

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }



  SaveGateEntry() {
    if (this.isUpdateMode) {
      this.toastr.warning("Record already fetched. Click UPDATE.");
      return;
    }

    if (!this.gateEntryForm.value.GatePassNo) {
      this.generateGatePass();
    }

    if (this.gateEntryForm.invalid) {
      this.toastr.error("Please fill all required fields!");
      return;
    }

    this.spinner.show();
    this.service.SaveGateEntry(this.gateEntryForm.value).subscribe({
      next: () => {
        this.spinner.hide();
        Swal.fire("Success!", "Gate Entry Saved Successfully", "success");
        this.resetForm();
      },
      error: () => {
        this.spinner.hide();
        this.toastr.error("Failed to Save Entry");
      }
    });
  }
  GetGateEntry() {
    if (!this.gateSearchValue) {
      this.toastr.error("Please enter Gate Entry Number");
      return;
    }

    const body = { gatEntryUniqueId: Number(this.gateSearchValue) };
    this.spinner.show();

    this.service.fetchgateentry(body).subscribe({
      next: (response: any) => {
        this.spinner.hide();

        if (response.status === 200 && response.updatedList) {
          const data = response.updatedList;

          this.isUpdateMode = true;

          data.DriverContactNO = data.DriverContactNO?.toString() || "";
          this.previewImage = data.ImageCapturing || null;

          const entryDate =
            data.VehicleEntrydatetime ||
            data.vehicleEntrydatetime ||
            data.vehicleEntryDateTime ||
            data.VehicleEntryDateTime ||
            "";

          const exitDate =
            data.ExitDateTime ||
            data.exitDateTime ||
            data.VehicleExitdatetime ||
            data.vehicleExitDateTime ||
            data.exitdate ||
            "";

          // Patch values
          this.gateEntryForm.patchValue({
            ...data,
            VehicleEntrydatetime: this.formatDateTimeForInput(entryDate),
            ExitDateTime: this.formatDateTimeForInput(exitDate),
          });

          // ===== REMOVE ALL REQUIRED VALIDATORS IN UPDATE MODE =====
          Object.keys(this.gateEntryForm.controls).forEach(key => {
            const control = this.gateEntryForm.get(key);
            control?.clearValidators();
            control?.updateValueAndValidity({ emitEvent: false });
          });

          Swal.fire("Success!", "Gate Entry Loaded", "success");
        } else {
          this.toastr.warning("No record found!");
        }
      },
      error: () => {
        this.spinner.hide();
        this.toastr.error("Fetch Failed");
      }
    });
  }



  UpdateGateEntry() {
    if (!this.isUpdateMode) {
      this.toastr.warning("Search record first!");
      return;
    }

    if (this.gateEntryForm.invalid) {
      this.toastr.error("Check all fields before Update!");
      return;
    }

    const payload = {
      ...this.gateEntryForm.value,
      gatEntryUniqueId: Number(this.gateSearchValue)
    };

    this.spinner.show();

    this.service.updategateentry(payload).subscribe({
      next: () => {
        this.spinner.hide();
        Swal.fire("Updated!", "Gate Entry Updated Successfully", "success");
        this.resetForm();
        this.isUpdateMode = false;
      },
      error: () => {
        this.spinner.hide();
        this.toastr.error("Update Failed");
      }
    });
  }

  resetForm() {
    this.gateEntryForm.reset();
    this.previewImage = null;
    this.isUpdateMode = false;
  }
}
