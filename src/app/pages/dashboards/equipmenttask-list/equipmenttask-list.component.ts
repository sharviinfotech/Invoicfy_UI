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
      operationData: this.fb.array([this.newOperationRow()]),

      // B. Material List
      materialData: this.fb.array([this.newMaterialRow()]),

      // C. Tools Required
      toolData: this.fb.array([this.newToolRow()]),

      // D. Measurement Points
      measurementPoints: this.fb.array([this.newMeasurementPointRow()]),

      // E. Document Attachments
      documentAttachments: this.fb.array([this.newDocumentAttachmentRow()])
    });
  }

  // ---------------- A. OPERATION DETAILS ----------------
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
  get operationData(): FormArray { return this.form.get('operationData') as FormArray; }
  addOperationRow() { this.operationData.push(this.newOperationRow()); }
  removeOperationRow(i: number) { this.operationData.removeAt(i); }

  // ---------------- B. MATERIAL LIST ----------------
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
  get materialData(): FormArray { return this.form.get('materialData') as FormArray; }
  addMaterialRow() { this.materialData.push(this.newMaterialRow()); }
  removeMaterialRow(i: number) { this.materialData.removeAt(i); }

  // ---------------- C. TOOLS REQUIRED ----------------
  newToolRow(): FormGroup {
    return this.fb.group({
      toolCode: [''],
      toolDescription: [''],
      quantityRequired: [''],
      toolCategory: ['']
    });
  }
  get toolData(): FormArray { return this.form.get('toolData') as FormArray; }
  addToolRow() { this.toolData.push(this.newToolRow()); }
  removeToolRow(i: number) { this.toolData.removeAt(i); }

  // ---------------- D. MEASUREMENT POINTS ----------------
  newMeasurementPointRow(): FormGroup {
    return this.fb.group({
      measurementPoint: [''],
      measurementDescription: [''],
      targetValue: [''],
      minMaxRange: [''],
      unit: [''],
      recordRequired: ['']
    });
  }
  get measurementPoints(): FormArray { return this.form.get('measurementPoints') as FormArray; }
  addMeasurementPointRow() { this.measurementPoints.push(this.newMeasurementPointRow()); }
  removeMeasurementPointRow(i: number) { this.measurementPoints.removeAt(i); }

  // ---------------- E. DOCUMENT ATTACHMENTS ----------------
  newDocumentAttachmentRow(): FormGroup {
    return this.fb.group({
      attachmentType: [''],
      file: [null],
      fileName: [''],
      documentDescription: ['']
    });
  }
  get documentAttachments(): FormArray { return this.form.get('documentAttachments') as FormArray; }
  addDocumentAttachmentRow() { this.documentAttachments.push(this.newDocumentAttachmentRow()); }
  removeDocumentAttachmentRow(i: number) { this.documentAttachments.removeAt(i); }

  onFileSelected(event: any, i: number) {
    const file = event.target.files[0];
    if (file) {
      this.documentAttachments.at(i).patchValue({
        file: file,
        fileName: file.name
      });
    }
  }

  // ---------------- SAVE FORM ----------------
  saveForm() {
    console.log("Saved Data:", this.form.value);
  }

}
