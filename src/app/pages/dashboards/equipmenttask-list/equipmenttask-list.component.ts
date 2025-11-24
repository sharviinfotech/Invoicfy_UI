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

  // -----------------------------------------
  // A. Operation Details
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
  // B. Material List
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
  // C. Tools Required
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
  // D. Measurement Points
  // -----------------------------------------
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

  get measurementPoints(): FormArray {
    return this.form.get('measurementPoints') as FormArray;
  }
  addMeasurementPointRow() { this.measurementPoints.push(this.newMeasurementPointRow()); }
  removeMeasurementPointRow(index: number) { this.measurementPoints.removeAt(index); }
  editMeasurementPointRow(index: number) { alert("Edit Measurement Point Row: " + index); }

  // -----------------------------------------
  // E. Document Attachments
  // -----------------------------------------
  newDocumentAttachmentRow(): FormGroup {
    return this.fb.group({
      attachmentType: [''],
      file: [null],
      fileName: [''],
      documentDescription: ['']
    });
  }

  get documentAttachments(): FormArray {
    return this.form.get('documentAttachments') as FormArray;
  }
  addDocumentAttachmentRow() { this.documentAttachments.push(this.newDocumentAttachmentRow()); }
  removeDocumentAttachmentRow(index: number) { this.documentAttachments.removeAt(index); }
  editDocumentAttachmentRow(index: number) { alert("Edit Document Attachment Row: " + index); }

  onFileSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.documentAttachments.at(index).patchValue({
        file: file,
        fileName: file.name
      });
    }
  }

  // -----------------------------------------
  // SAVE FORM
  // -----------------------------------------
  saveForm() {
    const formData = new FormData();
    formData.append('operationData', JSON.stringify(this.operationData.value));
    formData.append('materialData', JSON.stringify(this.materialData.value));
    formData.append('toolData', JSON.stringify(this.toolData.value));
    formData.append('measurementPoints', JSON.stringify(this.measurementPoints.value));

    this.documentAttachments.controls.forEach(row => {
      if (row.value.file) {
        formData.append('files', row.value.file);
      }
    });

    console.log('Final submitted data:', formData);
  }
}
