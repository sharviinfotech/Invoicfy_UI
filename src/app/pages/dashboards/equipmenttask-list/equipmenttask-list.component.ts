import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-equipmenttask-list',
  templateUrl: './equipmenttask-list.component.html',
  styleUrls: ['./equipmenttask-list.component.css']
})
export class EquipmenttaskListComponent implements OnInit {

  form: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {

    this.form = this.fb.group({

      // A. Operation Details
      operationData: this.fb.array([
        this.newOperationRow()
      ]),

      // C. Spare Parts / Material List
      materialData: this.fb.array([
        this.newMaterialRow()
      ]),

      // D. Tools Required
      toolData: this.fb.array([
        this.newToolRow()
      ]),

      // F. Document Attachments
      measurementPoints: this.fb.array([
        this.newMeasurementPointRow()
      ])
    });
  }

  // -----------------------------------------
  // A. OPERATION DETAILS
  // -----------------------------------------
  newOperationRow(): FormGroup {
    return this.fb.group({
      operationNo: [''],
      activityDescription: [''],
      workCenter: [''],
      controlKey: [''],
      duration: [''],
      durationUnit: [''],
      standardTextKey: [''],
      operationCategory: [''],
      priority: [''],
      safetyInstructions: ['']
    });
  }

  get operationData(): FormArray {
    return this.form.get('operationData') as FormArray;
  }

  addOperationRow() { this.operationData.push(this.newOperationRow()); }
  removeOperationRow(index: number) { this.operationData.removeAt(index); }
  editOperationRow(index: number) { alert("Edit Operation Row: " + index); }


  // -----------------------------------------
  // C. MATERIAL LIST
  // -----------------------------------------
  newMaterialRow(): FormGroup {
    return this.fb.group({
      materialCode: [''],
      materialDescription: [''],
      quantity: [''],
      unitOfMeasure: [''],
      storageLocation: [''],
      bomIndicator: [''],
      remarks: ['']
    });
  }

  get materialData(): FormArray {
    return this.form.get('materialData') as FormArray;
  }

  addMaterialRow() { this.materialData.push(this.newMaterialRow()); }
  removeMaterialRow(index: number) { this.materialData.removeAt(index); }
  editMaterialRow(index: number) { alert("Edit Material Row: " + index); }


  // -----------------------------------------
  // D. TOOLS REQUIRED
  // -----------------------------------------
  newToolRow(): FormGroup {
    return this.fb.group({
      toolCode: [''],
      toolDescription: [''],
      quantityRequired: [''],
      toolCategory: ['']
    });
  }

  get toolData(): FormArray {
    return this.form.get('toolData') as FormArray;
  }

  addToolRow() { this.toolData.push(this.newToolRow()); }
  removeToolRow(index: number) { this.toolData.removeAt(index); }
  editToolRow(index: number) { alert("Edit Tool Row: " + index); }


  // -----------------------------------------
  // F. DOCUMENT ATTACHMENTS
  // -----------------------------------------
  newMeasurementPointRow(): FormGroup {
    return this.fb.group({
      attachmentType: [''],      // text
      file: [null],              // file object
      fileName: [''],            // file name
      documentDescription: ['']  // description
    });
  }

  get measurementPoints(): FormArray {
    return this.form.get('measurementPoints') as FormArray;
  }

  addMeasurementPointRow() {
    this.measurementPoints.push(this.newMeasurementPointRow());
  }

  removeMeasurementPointRow(index: number) {
    this.measurementPoints.removeAt(index);
  }

  editMeasurementPointRow(index: number) {
    alert("Edit Document Attachment Row: " + index);
  }


  // -----------------------------------------
  // FILE UPLOAD HANDLER
  // -----------------------------------------
  onFileSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.measurementPoints.at(index).patchValue({
        file: file,
        fileName: file.name
      });
    }
  }

  // -----------------------------------------
  // SAVE WITH FILES
  // -----------------------------------------

  saveForm() {
    const formData = new FormData();

    formData.append('operationData', JSON.stringify(this.operationData.value));
    formData.append('materialData', JSON.stringify(this.materialData.value));
    formData.append('toolData', JSON.stringify(this.toolData.value));

    this.measurementPoints.controls.forEach((row) => {
      if (row.value.file) {
        formData.append('files', row.value.file);
      }
    });

    console.log("Final submitted data:", formData);
  }


}
