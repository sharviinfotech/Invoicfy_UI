import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

@Component({
  selector: 'app-sales-enquirey',
  templateUrl: './sales-enquirey.component.html',
  styleUrls: ['./sales-enquirey.component.css']
})
export class SalesEnquireyComponent {
  enquiryForm: FormGroup;

  // Attachments object
  attachments: any = {
    customerRequirement: null,
    drawingsSpecs: null,
    emailCommunication: null,
    additionalFiles: null
  };

  constructor(private fb: FormBuilder) {
    this.enquiryForm = this.fb.group({
      items: this.fb.array([this.createItem()])
    });
  }

  // Create a new item row
  createItem(): FormGroup {
    return this.fb.group({
      category: ['', Validators.required],
      name: ['', Validators.required],
      quantity: ['', Validators.required],
      uom: ['', Validators.required],
      deliveryDate: ['', Validators.required],
      requirementDesc: [''],
      specifications: [null],
      budget: [''],
      application: [''],
      competitor: ['']
    });
  }

  // Get items FormArray
  get items(): FormArray {
    return this.enquiryForm.get('items') as FormArray;
  }

  // Add new row
  addItem() {
    this.items.push(this.createItem());
  }

  // Remove row
  removeItem(index: number) {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  // Submit form
  submitForm() {
    if (this.enquiryForm.valid) {
      console.log('Form Items:', this.enquiryForm.value);
      console.log('Attachments:', this.attachments);
      alert('Form submitted! Check console for data.');
    } else {
      alert('Please fill required fields.');
    }
  }

  // Table items file upload
  onTableFileChange(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.items.at(index).patchValue({ specifications: file });
      console.log(`Item ${index} file uploaded:`, file.name);
    }
  }

  // Attachments section file upload
  onAttachmentFileChange(event: any, field: string) {
    const file = event.target.files[0];
    if (file) {
      this.attachments[field] = file;
      console.log(`${field} uploaded:`, file.name);
    }
  }
}
