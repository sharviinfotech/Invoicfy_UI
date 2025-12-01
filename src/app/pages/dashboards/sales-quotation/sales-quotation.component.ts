import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-sales-quotation',
  templateUrl: './sales-quotation.component.html',
  styleUrl: './sales-quotation.component.css'
})
export class SalesQuotationComponent {

  quotationForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.createForm();
  }

  createForm() {
    this.quotationForm = this.fb.group({
      items: this.fb.array([])
    });

    this.addItem(); // default first row
  }

  get items() {
    return this.quotationForm.get('items') as FormArray;
  }

  addItem() {
    const row = this.fb.group({
      productCode: [''],
      productName: [''],
      description: [''],
      uom: [''],
      quantity: [0],
      unitPrice: [0],
      discountPercent: [0],
      discountAmount: [{ value: 0, disabled: true }],
      netUnitPrice: [{ value: 0, disabled: true }],

      taxType: ['CGST+SGST'],
      taxPercent: [0],
      taxAmount: [{ value: 0, disabled: true }],

      lineTotal: [{ value: 0, disabled: true }],

      priceSource: ['Manual'],
      overrideAllowed: ['Yes'],
      deliveryDate: [''],
      warranty: ['']
    });

    this.items.push(row);
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  calculateRow(i: number) {
    const row = this.items.at(i);

    const qty = Number(row.get('quantity')?.value);
    const price = Number(row.get('unitPrice')?.value);
    const discPct = Number(row.get('discountPercent')?.value);
    const taxPct = Number(row.get('taxPercent')?.value);

    const discountAmount = (qty * price) * (discPct / 100);
    const netUnitPrice = (price - (price * discPct / 100));
    const taxAmount = (qty * netUnitPrice) * (taxPct / 100);
    const lineTotal = (qty * netUnitPrice) + taxAmount;

    row.patchValue({
      discountAmount: discountAmount.toFixed(2),
      netUnitPrice: netUnitPrice.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      lineTotal: lineTotal.toFixed(2)
    }, { emitEvent: false });
  }

}
