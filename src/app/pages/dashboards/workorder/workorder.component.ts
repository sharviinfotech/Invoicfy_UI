import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-workorder',
  templateUrl: './workorder.component.html',
  styleUrls: ['./workorder.component.css']
})
export class WorkorderComponent implements OnInit {

  form!: FormGroup;
  selectedFile: File | null = null;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      operations: this.fb.array([]),
      materials: this.fb.array([])     // <-- ADDED
    });

    this.addOperationRow();
    this.addMaterialRow();            // <-- ADD FIRST MATERIAL ROW
  }

  // ---------------------- OPERATIONS ------------------------

  get operations(): FormArray {
    return this.form.get('operations') as FormArray;
  }

  createOperationRow(): FormGroup {
    return this.fb.group({
      operationDescription: ['', Validators.required],
      workCenter: ['', Validators.required],
      controlKey: ['', Validators.required],
      duration: ['', Validators.required]
    });
  }

  addOperationRow() {
    this.operations.push(this.createOperationRow());
  }

  removeOperationRow(index: number) {
    this.operations.removeAt(index);
  }

  // ---------------------- MATERIALS ------------------------

  get materials(): FormArray {
    return this.form.get('materials') as FormArray;
  }

  createMaterialRow(): FormGroup {
    return this.fb.group({
      materialNumber: ['', Validators.required],
      description: ['', Validators.required],
      quantity: ['', Validators.required],
      uom: ['', Validators.required],
      storageLocation: ['', Validators.required]
    });
  }

  addMaterialRow() {
    this.materials.push(this.createMaterialRow());
  }

  removeMaterialRow(index: number) {
    this.materials.removeAt(index);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      console.log("Selected file:", file);
    }
  }

  // ---------------------- SAVE ------------------------

  save() {
    console.log("Operation Data:", this.form.value.operations);
    console.log("Material Required Data:", this.form.value.materials);
  }
}
