import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { GeneralserviceService } from 'src/app/generalservice.service';
import { NumberToWordsService } from 'src/app/number-to-words.service';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ImageService } from 'src/app/image.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { NgSelectModule } from '@ng-select/ng-select';
import { object } from '@amcharts/amcharts5';
interface TaxItem {
  description: string;
  percentage: number;
  amount: number;
}
interface ChargeItem {
  id?: number;
  selectedObjId?: any,
  selectedObj?: any,
  description: string;
  HSN_SAC: string;
  quantity: number;
  UOM: string;
  rate: number;
  amount: number;
  availableStock: number;
  purchasePrice: number
}
interface Customer {
  placeOfSupply: any;
  _id: string;
  customerName: string;
  customerAddress: string;
  customerCity: string;
  customerState: string;
  customerPincode: string;
  customerGstNo: string;
  customerPanNo: string;
}
interface Company {
  _id: string;
  companyName: string;
  companyPanNo: string;
  companyGstNo: string;
  companyBankName: string;
  companyBankAccount_No: string;
  companyIFSCcode: string;
  companyBranchName: string;
  companyAddress: string;
  companyBankAccountType: string;
}



@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, BsDatepickerModule, NgxSpinnerModule, NgSelectModule],
  standalone: true
})
export class InvoiceComponent implements OnInit {
  statesList: any[] = [];
  allCharges: any[] = [];
  newInvoiceCreation!: FormGroup;
  showNewInvoice = false;
  panForm: FormGroup;
  isDropdownOpen = false;
  selectedInvoiceType: string | null = null;
  activeTab: string = 'AllInvoice';
  item = { amount: 0 };
  logoUrl: string | null = null;
  InvoiceLogo: string | null = null;
  isHoveringLogo: boolean = false;
  isHoveringRemove: boolean = false;
  StateName: string = '';
  showCGST_SGST = false;
  customerList: any[] = [];
  companyList: any[] = [];

  showIGST = false;
  proformaCardHeaderName: any;
  proformaCardHeaderId: null;
  reviewedFlag: boolean;
  PQList: any;
  pqSameforTAX: number;
  selectedPQUniqueId: any;
  submited: boolean = false;
  rePQStatus: any;
  chargesForm: any;
  toastr: any;
  chargesName: any;
  submit: boolean;
  filteredCharges: any[];
  filteredPoNumbers: any[];
  filteredChargesByPo: any;
  manualMode = true;
  patchedCount = 0;
  productList: any[] = [];
  serviceList: any[] = [];
  currentDropdownList: any[] = [];
  productLoaded = false;
  serviceLoaded = false;
  companyImageUpload: any;


  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;

  }
  trackByFn(index: number, item: any) {
    return item.id;
  }



  selectInvoiceType(type) {
    this.resetAll()
    this.submited = false
    this.proformaCardHeaderId = null
    this.proformaCardHeaderName = null
    this.proformaCardHeaderId = type
    this.selectedPQUniqueId = 0
    if (this.proformaCardHeaderId == "PQ") {
      this.proformaCardHeaderName = "PROFORMA INVOICE QUOTATION"
    }
    else if (this.proformaCardHeaderId == "OnlyTAX") {
      this.proformaCardHeaderName = "TAX INVOICE"

    }
    else {
      this.proformaCardHeaderName = "TAX INVOICE"



    }
    this.activeTab = "NewInvoice";
    this.isDropdownOpen = false
    console.log("this.proformaCardHeaderId", this.proformaCardHeaderId, this.proformaCardHeaderName)
    this.PQList = []
    if (this.proformaCardHeaderId == "TAX") {
      this.newInvoiceCreation.controls['PQInvoiceNumber'].setValidators(Validators.required);
      this.PQList = this.allInvoiceList.filter(invoice => invoice.pqStatus === "inComplete" && invoice.status === "Approved");
      console.log('this.PQList', this.PQList)

    } else {
      this.newInvoiceCreation.controls['PQInvoiceNumber'].clearValidators();
    }

    this.newInvoiceCreation.controls['PQInvoiceNumber'].updateValueAndValidity();

  }
  resetForm(): void {
    this.newInvoiceCreation.reset();

    this.chargeItems = [];
    this.taxItems = [];

    this.subtotal = 0;
    this.grandTotal = 0;

    this.amountInWords = '';


  }

  onCustomerSelectChange(selectedCustomer: Customer | string | null) {
    if (selectedCustomer) {
      if (typeof selectedCustomer === 'object' && '_id' in selectedCustomer) {
        console.log("Existing Customer Selected:", selectedCustomer);
        this.newInvoiceCreation.patchValue({
          ProformaCustomerName: selectedCustomer.customerName,
          ProformaAddress: selectedCustomer.customerAddress,
          ProformaCity: selectedCustomer.customerCity,
          ProformaState: selectedCustomer.customerState, // Patch state first
          ProformaPincode: selectedCustomer.customerPincode,
          ProformaGstNo: selectedCustomer.customerGstNo,
          ProformaPanNO: selectedCustomer.customerPanNo,
          customerplaceOfSupply: selectedCustomer.placeOfSupply,
        });
        setTimeout(() => {
          this.onChangeState(); // Call onChangeState after patching the state
        }, 0);
        console.log("this.newInvoiceCreation", this.newInvoiceCreation.value, this.newInvoiceCreation.value.ProformaState)
      } else if (typeof selectedCustomer === 'string') {
        console.log("Manual Entry:", selectedCustomer);
        this.newInvoiceCreation.patchValue({
          ProformaCustomerName: selectedCustomer,
        });
        this.clearOtherCustomerFields();
      } else {
        console.log("Unknown Selection:", selectedCustomer);
        this.clearOtherCustomerFields();
      }
    } else {
      console.log("Selection Cleared");
      this.clearOtherCustomerFields();
    }
    if (this.newInvoiceCreation.value.ProformaCompanyName && this.newInvoiceCreation.value.ProformaCustomerName) {
      this.filterBasedOnCustomerAndCompany()

    }
    const selectedState = this.newInvoiceCreation.value.ProformaState;
    const selectedObj = this.statesList.find(item => item.stateName === selectedState);
    console.log("selectedObj", selectedObj);

    if (selectedObj && selectedObj.stateName === this.newInvoiceCreation.value.companyState) {
      this.taxItems = [
        {
          description: 'CGST @ 9%',
          percentage: 9,
          amount: 0
        },
        {
          description: 'SGST @ 9%',
          percentage: 9,
          amount: 0
        },
      ];
    } else {
      this.taxItems = [
        {
          description: 'IGST @ 18%',
          percentage: 18,
          amount: 0
        }
      ];
    }
    this.calculateTotals();
  }
  onCompanySelectChange(selectedCompany: any | string | null) {
    console.log("selectedCompany", selectedCompany)
    this.companyImageUpload = selectedCompany.companyImageUpload

    if (selectedCompany) {
      if (typeof selectedCompany === 'object' && '_id' in selectedCompany) {
        console.log("Existing Company Selected:", selectedCompany);
        this.newInvoiceCreation.patchValue({
          ProformaCompanyName: selectedCompany.companyName, // Match your bindLabel
          ProformaPan: selectedCompany.companyPanNo, // Match image field
          ProformaGstNumber: selectedCompany.companyGstNo,    // Match image field
          ProformaTypeOfServices: selectedCompany.ProformaTypeOfServices,
          ProformaBankName: selectedCompany.companyBankName,  // Match image field
          ProformaBankAccountNumber: selectedCompany.companyBankAccount_No, // Match image
          ProformaIFSCcode: selectedCompany.companyIFSCcode,
          ProformaBranch: selectedCompany.companyBranchName,
          detailsCardAddress: selectedCompany.companyAddress, // Match image field
          companyState: selectedCompany.companyState,
          companyBankAccountType: selectedCompany.companyBankAccountType,
        });

        setTimeout(() => {
          this.onChangeState();
        }, 0);
      } else if (typeof selectedCompany === 'string') {
        console.log("Manual Entry:", selectedCompany);
        this.newInvoiceCreation.patchValue({
          ProformaCompanyName: selectedCompany,

        });
        this.clearOtherCompanyFields();
      }
    } else {
      this.clearOtherCompanyFields();
    }
    if (this.newInvoiceCreation.value.ProformaCompanyName && this.newInvoiceCreation.value.ProformaCustomerName) {
      this.filterBasedOnCustomerAndCompany()

    }
  }

  clearOtherCompanyFields() {
    this.newInvoiceCreation.patchValue({
      detailsCardAddress: '',
      ProformaBankName: '',
      ProformaBankAccountNumber: '',
      ProformaIFSCcode: '',
      ProformaBranch: '',
      ProformaGstNumber: '',  // Fixed typo from ProformaGstNo
      ProformaPanNumber: '',  // Fixed typo from ProformaPanNO
      ProformaTypeOfServices: '',
      companyBankAccountType: '',

    });
  }
  onSelectProformaNumber(event: any) {
    this.selectedPQUniqueId = 0
    this.pqSameforTAX = 0
    console.log("onSelectProformaNumber event", event);

    this.pqSameforTAX = event?.invoiceUniqueNumber,
      this.selectedPQUniqueId = event.originalUniqueId
    this.pathPQDataToTAX(event);
  }



  clearOtherCustomerFields() {
    this.newInvoiceCreation.patchValue({
      ProformaAddress: '',
      ProformaCity: '',
      ProformaState: '',
      ProformaPincode: '',
      ProformaGstNo: '',
      ProformaPanNO: '',
      customerplaceOfSupply: ''
    });
  }





  getProductList() {
    this.spinner.show();
    this.service.getproductList().subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.productList = res.data || [];
      },
      error: () => this.spinner.hide()
    });
  }
  getServiceList() {
    this.spinner.show();
    this.service.getAllCharges().subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.serviceList = res.data || [];
      },
      error: () => this.spinner.hide()
    });
  }

  mapProductsToChargeItems() {
    return this.productList.map(p => ({
      selectedObjId: null,
      description: p.productName,
      HSN_SAC: p.hsnCode || '',
      quantity: 1,
      UOM: p.uom,
      rate: p.salesPrice,
      amount: p.rate || 0,
      availableStock: 0,
      purchasePrice: p.purchasePrice
    }));
  }

  mapServicesToChargeItems() {
    return this.serviceList.map(s => ({
      selectedObjId: null,
      description: s.servicesName,   // ✅ REQUIRED
      HSN_SAC: s.HSN_SAC,
      quantity: 1,
      UOM: s.UOM || 'Job',
      rate: s.rate || 0,
      amount: s.rate || 0
    }));
  }

  onInvoiceTypeChange(type: string) {
    console.log(" Invoice Type Changed To:", type);

    // Wait for API data
    if ((type === 'only product' && this.productList.length === 0) ||
      (type === 'only service' && this.serviceList.length === 0) ||
      (type === 'service come product' && (this.productList.length === 0 || this.serviceList.length === 0))) {

      setTimeout(() => this.onInvoiceTypeChange(type), 200);
      console.log(" Waiting for API data... Retrying in 200ms");
      return;
    }


    // Build dropdown list only
    if (type === 'only product') {
      console.log(" Building dropdown from PRODUCT LIST", this.productList);
      this.currentDropdownList = this.productList.map(p => ({
        id: p.productMasterUniqueId,
        name: p.productName,
        HSN_SAC: p.hsnCode,
        UOM: p.uom,
        rate: p.salesPrice,
        purchasePrice: Number(p.purchasePrice),
      }));
      console.log(" Product Dropdown →", this.currentDropdownList);
    }

    else if (type === 'only service') {
      console.log(" Building dropdown from SERVICE LIST", this.serviceList);
      this.currentDropdownList = this.serviceList.map(s => ({
        id: s.chargesUniqueId,
        name: s.servicesName,
        HSN_SAC: s.HSN_SAC,
        UOM: s.UOM || 'Job',
        rate: s.rate || 0
      }));
    }


    else if (type === 'service come product') {
      console.log("Combining SERVICE + PRODUCT");
      this.currentDropdownList = [
        ...this.productList.map(p => ({
          id: p.productMasterUniqueId,
          name: p.productName,
          HSN_SAC: p.hsnCode,
          UOM: p.uom,
          rate: p.salesPrice,
          purchasePrice: Number(p.purchasePrice),
        })),
        ...this.serviceList.map(s => ({
          id: s.chargesUniqueId,
          name: s.servicesName,
          HSN_SAC: s.HSN_SAC,
          UOM: s.UOM || 'Job',
          rate: s.rate || 0

        }))
      ];
    }
    console.log("on invoice type change this.currentDropdownList", this.currentDropdownList)

    // Reset table to SINGLE EMPTY ROW  
    // this.chargeItems = [{
    //   id: Date.now() + Math.random(),
    //   selectedObj: null,
    //   description: '',
    //   HSN_SAC: '',
    //   quantity: 1,
    //   UOM: '',
    //   rate: 0,
    //   amount: 0
    // }];
    // Always reset table when invoice type changes
    this.chargeItems = [{
      id: 0,
      selectedObjId: null,
      description: '',
      HSN_SAC: '',
      quantity: 1,
      UOM: '',
      rate: 0,
      amount: 0,
      availableStock: 0,
      purchasePrice: 0
    }];
    this.patchedCount = 1;
    this.manualMode = false;
    this.calculateTotals();
  }



  onItemSelected(item: any, selected: any) {
    if (!selected) return;

    // `selected` can be either the selected object (when ng-select returns object)
    // or the selected id (when bindValue is used). Normalize to the object.
    let selectedObj: any = null;
    if (typeof selected === 'object') {
      selectedObj = selected;
    } else {
      selectedObj = this.currentDropdownList.find(x => x.id === selected) || null;
    }

    if (!selectedObj) return;
    console.log("selectedObj", selectedObj);
    item.productName = selectedObj.name;
    item.description = selectedObj.name || '';
    item.HSN_SAC = selectedObj.HSN_SAC || '';
    item.UOM = selectedObj.UOM || '';
    item.rate = selectedObj.rate || 0;
    item.quantity = item.quantity || 1;

    item.amount = (parseFloat(item.rate) || 0) * (parseFloat(item.quantity) || 1);
    item.purchasePrice = selectedObj.purchasePrice
    this.calculateTotals();
    console.log("chargeItems", this.chargeItems)
  }





  chargeItems: ChargeItem[] = [];

  taxItems: TaxItem[] = [
    {
      description: 'CGST @ 9%',
      percentage: 9,
      amount: 0
    },
    {
      description: 'SGST @ 9%',
      percentage: 9,
      amount: 0
    },
    {
      description: 'IGST @ 18%',
      percentage: 18,
      amount: 0
    }
  ];
  show: boolean = true

  subtotal: number = 0;
  grandTotal: number = 0;
  hoveredIndex: number = -1;
  amountInWords: string = '';

  @ViewChild('logoInput') logoInput!: ElementRef;
  allInvoiceList: any;
  originalUniqueId: number;


  bsConfig = {
    dateInputFormat: 'DD-MM-YYYY', // Set the date format
    containerClass: 'theme-blue', // Optional: Use a predefined theme
  };
  invoiceItem: any;
  loginData: any;
  reSubmitInvoice: boolean;
  reSubmitInvoiceStatus: any;
  reason: any;
  invoiceApprovedOrRejectedByUser: any;
  invoiceApprovedOrRejectedDateAndTime: any;
  constructor(private fb: FormBuilder, private numberToWordsService: NumberToWordsService, private service: GeneralserviceService, private datePipe: DatePipe, private spinner: NgxSpinnerService, private imageService: ImageService, private toaster: ToastrService) {
    this.newInvoiceCreation = this.fb.group({
      PQInvoiceNumber: [''],
      invoiceHeader: [''],
      ProformaCompanyName: ['', Validators.required],
      ProformaCustomerName: ['', Validators.required],
      ProformaAddress: ['', Validators.required],
      ProformaCity: ['', Validators.required],
      ProformaState: ['', Validators.required],
      customerplaceOfSupply: ['', Validators.required],
      ProformaPincode: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{6}$/)
        ]
      ],
      ProformaGstNo: ['', Validators.required],
      ProformaPanNO: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/)  // Correct PAN format
        ]
      ],

      ProformaInvoiceNumber: [''],
      ProformaInvoiceDate: ['', Validators.required],
      ProformaPan: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/)  // PAN format validation: 4 capital letters, 4 digits, 1 capital letter
        ]
      ],

      ProformaGstNumber: ['', Validators.required],
      ProformaPoNumber: [''],
      ProformaInvoiceType: [''],
      companyState: [''],
      ProformaTypeOfServices: [''],
      ProformaBankName: ['', Validators.required],
      ProformaBankAccountNumber: ['', Validators.required],
      ProformaIFSCcode: ['', Validators.required],
      ProformaBranch: ['', Validators.required],
      notes: ['', Validators.required],
      detailsCardAddress: ['', Validators.required],
      companyBankAccountType: ['', Validators.required],

    });

  }


  // onCustomerSelect(customerName: string) {
  //   const cleanName = (customerName || "").trim().toLowerCase();

  //   this.filteredPoNumbers = this.allCharges
  //     .filter(item => (item.customerName || "").trim().toLowerCase() === cleanName)
  //     .map(item => item.poNumber);

  //   console.log("Filtered PO Numbers:", this.filteredPoNumbers);
  // }

  onCustomerChange(selectedCustomer: any) {
    if (!selectedCustomer) return;

    const customerName = selectedCustomer.customerName;

    // ✅ Filter PO Numbers based on selected customer
    this.filteredPoNumbers = this.allCharges
      .filter(c => c.customerName?.trim().toLowerCase() === customerName.trim().toLowerCase())
      .map(c => c.poNumber);

    console.log("Filtered PO Numbers:", this.filteredPoNumbers);

    // ✅ Auto-fill other customer fields
    this.onCustomerSelectChange(selectedCustomer);
  }


  // onPoNumberChange(selectedPo: string) {
  //   if (!selectedPo) return;


  //   const matched = this.allCharges.filter(c => c.poNumber === selectedPo);

  //   if (matched.length === 0) {
  //     this.chargeItems = [];
  //     this.calculateTotals();
  //     return;
  //   }


  //   this.chargeItems = matched.map(c => ({
  //     description: c.servicesName,
  //     HSN_SAC: c.HSN_SAC,
  //     UOM: c.UOM,
  //     quantity: 1,
  //     rate: 0,
  //     amount: 0
  //   }));

  //   // Step 3: Recalculate totals
  //   this.calculateTotals();
  // }
  onPoNumberChange(selectedPo: string) {
    if (!selectedPo) {
      this.manualMode = true;
      this.patchedCount = 0;
      this.chargeItems = [];
      this.addChargeItem();
      this.calculateTotals();
      return;
    }

    this.manualMode = false;

    const matched = this.allCharges.filter(c => c.poNumber === selectedPo);

    if (matched.length === 0) {
      this.patchedCount = 0;
      this.chargeItems = [];
      this.addChargeItem();
      this.calculateTotals();
      return;
    }
    console.log('matched', matched)
    this.chargeItems = matched.map(c => ({
      selectedObjId: null,
      description: c.servicesName,
      HSN_SAC: c.HSN_SAC,
      UOM: c.UOM,
      quantity: 1,
      rate: 0,
      amount: 0,
      availableStock: 0,
      purchasePrice: 0
    }));

    this.patchedCount = this.chargeItems.length;

    this.calculateTotals();
  }












  ngOnInit(): void {
    this.loginData = null
    this.loginData = this.service.getLoginResponse()
    console.log("this.loginData", this.loginData);
    console.log("taxlist", this.taxItems)
    this.getAllCustomerList();
    this.getAllInvoice();
    this.calculateTotals();
    this.getAllcompanyList();
    this.getStates();
    this.loadCharges();
    this.getAllCharges();

    this.logoUrl = this.imageService.getBase64FlightLogo();
    this.InvoiceLogo = this.imageService.getBase64WorldLogo();

    this.getProductList();
    this.getServiceList();


  }
  loadCharges(): void {

  }
  // onChargeSelectionChange(item: any, selectedChargeName: string) {
  //   if (selectedChargeName) { // Check if a charge was actually selected
  //     const selectedCharge = this.allCharges.find(charge => charge.chargeName === selectedChargeName);
  //     if (selectedCharge) {
  //       item.rate = selectedCharge.rate;
  //       this.calculateTotals();
  //     } else {
  //       // Handle the case where the selected charge is not found.
  //       // This could happen if the data in allCharges is inconsistent.
  //       console.error(`Charge with name '${selectedChargeName}' not found.`);
  //       // Optionally, you might want to reset the rate or display an error message.
  //       item.rate = 0; // or item.rate = null;
  //       this.calculateTotals();
  //     }
  //   } else {
  //     // Handle the case where the selection was cleared (e.g., user selected the placeholder).
  //     item.rate = 0; // or item.rate = null;
  //     this.calculateTotals();
  //   }
  // }
  // onChargeSelectionChange(item: ChargeItem): void {
  //   const selectedCharge = this.allCharges.find(c => c.id === item.chargeId);
  //   if (selectedCharge) {
  //     item.description = selectedCharge.servicesName;
  //     // You can also set default amount if needed
  //     // item.amount = selectedCharge.defaultAmount;
  //   }
  //   this.calculateTotals();
  // }
  getAllCustomerList() {
    this.customerList = [];
    this.spinner.show()
    this.service.getAllCustomerList().subscribe(
      (res: any) => {
        this.spinner.hide()
        this.customerList = res.data;
        console.log('this.customerList', this.customerList);
      },
      (error) => {
        this.spinner.hide()
        console.log('error', error);
      }
    );
  }
  getAllcompanyList() {
    this.companyList = [];
    this.spinner.show()
    this.service.getAllCompanyList().subscribe((res: any) => {
      this.companyList = res.data
      console.log("this.companyList", this.companyList)
      this.spinner.hide()
    }, error => {
      console.log("error", error)
      this.spinner.hide();
    })
  }
  // formatTime(event: any) {
  //   let inputValue = event.target.value;
  //   // Remove non-numeric, : and .
  //   inputValue = inputValue.replace(/[^0-9:.]/g, '');

  //   // Split by : or .
  //   const parts = inputValue.split(/[:.]/);

  //   if (parts.length > 2) {
  //     // More than one : or .
  //     inputValue = parts.slice(0, 2).join(':'); // Or '.', depending on your preference
  //   }

  //   if (parts.length === 2) {
  //     // Limit minutes to 2 digits
  //     parts[1] = parts[1].slice(0, 2);
  //     inputValue = parts.join(inputValue.includes(':') ? ':' : '.');
  //   }

  //   // Limit hours to 2 digits
  //   if (parts[0]) {
  //     parts[0] = parts[0].slice(0, 2);
  //     inputValue = parts.join(inputValue.includes(':') ? ':' : '.');
  //   }

  //   this.newInvoiceCreation.get('bookingbillingflyingtime')?.setValue(inputValue);
  //   this.updateChargeItem(0, 'units', inputValue); // Update your charge item
  // }

  validateTimeInput(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if ((charCode < 48 || charCode > 57) && charCode !== 58 && charCode !== 46) {
      event.preventDefault(); // Prevent non-numeric, : and . input
    }
  }

  // onCustomerChange(customerId: string) {
  //   if (customerId) {
  //     const selectedCustomer = this.customerList.find((customer) => customer.customerId === parseInt(customerId));
  //     if (selectedCustomer) {
  //       this.newInvoiceCreation.patchValue({
  //         ProformaAddress: selectedCustomer.ProformaAddress,
  //         ProformaCity: selectedCustomer.ProformaCity,
  //         ProformaState: selectedCustomer.ProformaState,
  //         ProformaPincode: selectedCustomer.ProformaPincode,
  //         ProformaGstNo: selectedCustomer.ProformaGstNo,
  //         ProformaPanNO: selectedCustomer.ProformaPanNO,
  //         ProformaPan: selectedCustomer.ProformaPan,
  //         ProformaGstNumber: selectedCustomer.ProformaGstNumber,
  //         customerId: selectedCustomer.customerId,
  //       });
  //     }
  //   } else {
  //     // Clear fields if no customer is selected
  //     this.newInvoiceCreation.patchValue({
  //       ProformaAddress: '',
  //       ProformaCity: '',
  //       ProformaState: '',
  //       ProformaPincode: '',
  //       ProformaGstNo: '',
  //       ProformaPanNO: '',
  //       ProformaPan: '',
  //       ProformaGstNumber: '',
  //       customerId: '',
  //     });
  //   }
  // }
  getStates() {
    this.spinner.show();
    this.service.getstateList().subscribe(
      (response: any) => {
        this.spinner.hide()
        if (response && response.responseData) {
          this.statesList = response.responseData.data;
        }
      },
      (error) => {
        this.spinner.hide()
        console.error('Error fetching statesList:', error);
      }
    );
  }
  onChangeState() {
    this.taxItems = [];
    console.log("this.newInvoiceCreation.value.ProformaState", this.newInvoiceCreation.value.ProformaState)
    console.log("this.newInvoiceCreation.value.companyState", this.newInvoiceCreation.value.companyState)

    const selectedState = this.newInvoiceCreation.value.ProformaState;
    const selectedObj = this.statesList.find(item => item.stateName === selectedState);
    console.log("selectedObj", selectedObj);

    if (selectedObj && selectedObj.stateName === this.newInvoiceCreation.value.companyState) {
      this.taxItems = [
        {
          description: 'CGST @ 9%',
          percentage: 9,
          amount: 0
        },
        {
          description: 'SGST @ 9%',
          percentage: 9,
          amount: 0
        },
      ];
    } else {
      this.taxItems = [
        {
          description: 'IGST @ 18%',
          percentage: 18,
          amount: 0
        }
      ];
    }

    // Recalculate totals if needed
    if (this.activeTab === 'Edit' && this.subtotal) {
      this.calculateTotals();
    } else {
      this.calculateTotals();
    }
  }

  // onChangeState() {
  //   this.taxItems = [];
  //   const selectedState = this.newInvoiceCreation.value.ProformaState;
  //   const selectedObj = this.statesList.find(item => item.stateName === selectedState);
  //   console.log("selectedObj", selectedObj);

  //   if (selectedObj && selectedObj.stateName === 'TELANGANA') {
  //     this.taxItems = [
  //       {
  //         description: 'CGST @ 9%',
  //         percentage: 9,
  //         amount: 0
  //       },
  //       {
  //         description: 'SGST @ 9%',
  //         percentage: 9,
  //         amount: 0
  //       },
  //     ];
  //   } else {
  //     this.taxItems = [
  //       {
  //         description: 'IGST @ 18%',
  //         percentage: 18,
  //         amount: 0
  //       }
  //     ];
  //   }

  //   // Recalculate totals if needed
  //   if (this.activeTab === 'Edit' && this.subtotal) {
  //     this.calculateTotals();
  //   }
  // }


  getAllInvoice() {
    this.allInvoiceList = []
    this.getAllCustomerList();
    this.getAllcompanyList()
    this.spinner.show()
    //   let obj={
    //     "userActivity":this.loginData.data.userActivity
    // }
    this.service.getAllInvoice().subscribe((res: any) => {
      console.log("getAllInvoice", res);
      this.spinner.hide()
      this.allInvoiceList = res.data;
    }, error => {
      this.spinner.hide()
    })
  }
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



  selectedInvoice: any = null; // Stores the selected invoice
  isEditing = false; // Determines whether edit mode is active


  // Field configurations for form rendering
  invoiceFields = [
    { label: 'Company Name', controlName: 'companyName', placeholder: 'Enter company name' },
    { label: 'Date', controlName: 'date', placeholder: 'Enter date' },
    { label: 'City', controlName: 'city', placeholder: 'Enter city' },
    { label: 'invoiceReferenceNo', controlName: 'invoiceReferenceNo', placeholder: 'Enter invoiceReferenceNo' },
  ];
  spinnerHideMethod() {
    this.spinner.show()
    setTimeout(() => {
      this.spinner.hide()
    }, 1000); // Delay of 2 seconds
  }

  // Method to select and show an invoice
  selectInvoice(invoice: any) {
    console.log("invoice", invoice)
    if (invoice.proformaCardHeaderId == "PQ") {
      this.reSubmitInvoice = false
      this.invoiceItem = null
      this.invoiceItem = invoice
      console.log("invoice", invoice)
      console.log("this.invoiceItem", this.invoiceItem.invoiceReferenceNo);
      console.log("this.invoiceItem.header.status", this.invoiceItem.header.status)


      if (this.invoiceItem.status == "Approved" && this.invoiceItem.pqStatus == "inComplete") {
        console.log("If approved")
        Swal.fire({
          // title: 'question',
          text: 'The selected invoice has been approved,Still Do you want to Edit Invoice?',
          icon: 'question',
          showCancelButton: true,  // Cancel Button
          cancelButtonText: 'Cancel',
          // showDenyButton: true,  // Preview Button
          // denyButtonText: 'Preview',
          showConfirmButton: true,  // Edit Button
          confirmButtonText: 'Edit',
        }).then((result) => {
          if (result.isConfirmed) {
            // Edit action
            this.editRow(invoice);
            this.reSubmitInvoice = false
          } else if (result.isDenied) {
            // Preview action
            this.invoiceItem = invoice;
            console.log("this.invoiceItem", this.invoiceItem);
            // this.activeTab = 'Preview';
            this.spinnerHideMethod()
            this.reSubmitInvoice = false
          } else {
            // Cancel action (Optional: You can add any logic if needed)
            console.log("Action Cancelled");
            this.getAllInvoice()
            this.invoiceItem = null
            this.reSubmitInvoice = false
            // this.spinnerHideMethod()
          }
        });
      }
      else if (this.invoiceItem.status == "Approved") {
        console.log("If approved")
        Swal.fire({
          // title: 'question',
          text: 'The selected invoice has been approved,Do you want to Preview Invoice?',
          icon: 'question',
          showCancelButton: true,
          showConfirmButton: true,
        }).then((result) => {
          if (result.isConfirmed) {
            this.invoiceItem = invoice
            console.log("this.invoiceItem", this.invoiceItem)
            this.activeTab = 'Preview'
            this.spinnerHideMethod()

          } else {
            // this.spinnerHideMethod()
            this.getAllInvoice()
            this.invoiceItem = null
            this.reSubmitInvoice = false
          }
        });
      }
      else {

        if (this.invoiceItem.status == "Rejected") {
          console.log("If rejected")
          Swal.fire({
            text: 'The selected invoice has been rejected.Do you still want to edit it to make changes and resubmit, or just preview the invoice?',
            icon: 'info',
            showCancelButton: true,  // Cancel Button
            cancelButtonText: 'Cancel',
            // showDenyButton: true,  // Preview Button
            // denyButtonText: 'Preview',
            showConfirmButton: true,  // Edit Button
            confirmButtonText: 'Edit',
          }).then((result) => {
            if (result.isConfirmed) {
              // Edit action
              this.editRow(invoice);
              this.reSubmitInvoice = true
              this.reSubmitInvoiceStatus = "Rejected_Reversed"
            } else if (result.isDenied) {
              // Preview action
              this.invoiceItem = invoice;
              console.log("this.invoiceItem", this.invoiceItem);
              this.activeTab = 'Preview';
              this.spinnerHideMethod()
              this.reSubmitInvoice = false
            } else {
              // Cancel action (Optional: You can add any logic if needed)
              console.log("Action Cancelled");
              this.getAllInvoice()
              this.invoiceItem = null
              this.reSubmitInvoice = null
              // this.spinnerHideMethod()
            }
          });


          // Swal.fire({
          //   // title: 'question',
          //   text: 'The selected invoice has been rejected',
          //   icon: 'info',
          //   showCancelButton: true,
          //   showConfirmButton: true,
          // }).then((result) => {
          //   if (result.isConfirmed) {
          //     this.invoiceItem = invoice
          //     console.log("this.invoiceItem", this.invoiceItem)
          //     this.activeTab = 'Preview'
          //     this.spinnerHideMethod()
          //   } else {
          //     this.invoiceItem = invoice
          //     console.log("this.invoiceItem", this.invoiceItem)
          //     // this.spinnerHideMethod()
          //     this.getAllInvoice()
          //     this.invoiceItem = null
          //   }
          // });
        } else {
          console.log("If pending");
          Swal.fire({
            text: 'Do you want to Edit or Preview the Invoice?',
            icon: 'info',
            showCancelButton: true,  // Cancel Button
            cancelButtonText: 'Cancel',
            // showDenyButton: true,  // Preview Button
            // denyButtonText: 'Preview',
            showConfirmButton: true,  // Edit Button
            confirmButtonText: 'Edit',
          }).then((result) => {
            if (result.isConfirmed) {
              // Edit action
              this.editRow(invoice);
              this.reSubmitInvoice = false
            } else if (result.isDenied) {
              // Preview action
              this.invoiceItem = invoice;
              console.log("this.invoiceItem", this.invoiceItem);
              this.activeTab = 'Preview';
              this.spinnerHideMethod()
              this.reSubmitInvoice = false
            } else {
              // Cancel action (Optional: You can add any logic if needed)
              console.log("Action Cancelled");
              this.getAllInvoice()
              this.invoiceItem = null
              this.reSubmitInvoice = false
              // this.spinnerHideMethod()
            }
          });

        }

      }
    } else if (invoice.proformaCardHeaderId == "OnlyTAX") {
      console.log("invoice", invoice)
      Swal.fire({
        text: 'Do you want to Edit the Invoice?',
        icon: 'info',
        showCancelButton: true,  // Cancel Button
        cancelButtonText: 'Cancel',
        // showDenyButton: true,  // Preview Button
        // denyButtonText: 'Preview',
        showConfirmButton: true,  // Edit Button
        confirmButtonText: 'Edit',
      }).then((result) => {
        if (result.isConfirmed) {
          // Edit action
          this.editRow(invoice);
          this.reSubmitInvoice = false
          this.activeTab = 'Edit';
        } else if (result.isDenied) {
          // Preview action
          this.invoiceItem = invoice;
          console.log("this.invoiceItem", this.invoiceItem);
          this.activeTab = 'Preview';
          this.spinnerHideMethod()
          this.reSubmitInvoice = false
        } else {
          // Cancel action (Optional: You can add any logic if needed)
          console.log("Action Cancelled");
          this.getAllInvoice()
          this.invoiceItem = null
          this.reSubmitInvoice = false
          // this.spinnerHideMethod()
        }
      });
    }



  }
  pathPQDataToTAX(invoice) {

    this.spinnerHideMethod()
    this.selectedInvoice = null
    this.selectedInvoice = invoice;
    console.log("this.selectedInvoice", this.selectedInvoice)
    this.newInvoiceCreation.patchValue({
      // invoiceHeader: this.selectedInvoice.header.invoiceHeader,
      ProformaCustomerName: this.selectedInvoice.header.ProformaCustomerName,
      ProformaCompanyName: this.selectedInvoice.header.ProformaCompanyName,
      ProformaAddress: this.selectedInvoice.header.ProformaAddress,
      ProformaCity: this.selectedInvoice.header.ProformaCity,
      ProformaState: this.selectedInvoice.header.ProformaState,
      customerplaceOfSupply: this.selectedInvoice.header.customerplaceOfSupply,
      ProformaPincode: this.selectedInvoice.header.ProformaPincode,
      ProformaGstNo: this.selectedInvoice.header.ProformaGstNo,
      ProformaPanNO: this.selectedInvoice.header.ProformaPanNO,
      ProformaPoNumber: this.selectedInvoice.header.ProformaPoNumber,
      ProformaInvoiceType: this.selectedInvoice.header.ProformaPoNumber,
      // ProformaInvoiceNumber: this.selectedInvoice.invoiceUniqueNumber,
      ProformaInvoiceDate: this.selectedInvoice.header.ProformaInvoiceDate,
      ProformaPan: this.selectedInvoice.header.ProformaPan,
      ProformaGstNumber: this.selectedInvoice.header.ProformaGstNumber,
      ProformaTypeOfServices: this.selectedInvoice.header.ProformaTypeOfServices,
      ProformaBankName: this.selectedInvoice.header.ProformaBankName,
      notes: this.selectedInvoice.header.notes,
      ProformaBankAccountNumber: this.selectedInvoice.header.ProformaBankAccountNumber,
      ProformaIFSCcode: this.selectedInvoice.header.ProformaIFSCcode,
      ProformaBranch: this.selectedInvoice.header.ProformaBranch,
      detailsCardAddress: this.selectedInvoice.header.detailsCardAddress,
      companyBankAccountType: this.selectedInvoice.header.companyBankAccountType,



    })

    this.chargeItems = this.selectedInvoice.serviceList;
    this.taxItems = this.selectedInvoice.taxList;
    this.subtotal = this.selectedInvoice.subtotal;
    this.grandTotal = this.selectedInvoice.grandTotal
    this.amountInWords = this.selectedInvoice.amountInWords
    this.logoUrl = this.selectedInvoice.header.invoiceImage
    this.InvoiceLogo = this.selectedInvoice.header.invoiceHeader
    this.reSubmitInvoiceStatus = this.selectedInvoice.status
    this.reason = this.selectedInvoice.reason,
      this.invoiceApprovedOrRejectedByUser = this.selectedInvoice.invoiceApprovedOrRejectedByUser,
      this.invoiceApprovedOrRejectedDateAndTime = this.selectedInvoice.invoiceApprovedOrRejectedDateAndTime,
      // this.proformaCardHeaderId = this.selectedInvoice.proformaCardHeaderId,
      // this.proformaCardHeaderName  =this.selectedInvoice.proformaCardHeaderName 
      this.reviewedFlag = this.selectedInvoice.reviewed
    if (this.logoUrl == '' || this.logoUrl == null) {
      this.logoUrl = this.imageService.getBase64FlightLogo();
    }
    if (this.InvoiceLogo == '' || this.InvoiceLogo == null) {
      this.InvoiceLogo = this.imageService.getBase64WorldLogo();

    }
    console.log("this.selectedInvoice.header.invoiceUniqueNumber", this.selectedInvoice.invoiceUniqueNumber)
    console.log("this.newInvoiceCreation", this.newInvoiceCreation.value.ProformaInvoiceNumber)
    // this.pqSameforTAX = this.selectedInvoice.pqSameforTAX
  }
  rowdata() {
    console.log("this.chargeItems:", this.chargeItems)
  }
  editRow(invoice) {
    this.reSubmitInvoiceStatus = null
    this.rePQStatus = null
    this.reason = null,
      this.invoiceApprovedOrRejectedByUser = null,
      this.invoiceApprovedOrRejectedDateAndTime = null,
      this.proformaCardHeaderId = null,
      this.proformaCardHeaderName = null
    this.spinnerHideMethod()
    this.chargeItems = [];
    this.taxItems = [];
    this.subtotal = 0;
    this.grandTotal = 0
    this.selectedInvoice = null
    this.selectedInvoice = invoice;
    console.log("this.selectedInvoice", this.selectedInvoice)
    this.originalUniqueId = null
    this.originalUniqueId = this.selectedInvoice.originalUniqueId
    console.log("this.originalUniqueId", this.originalUniqueId, this.selectedInvoice.invoiceUniqueNumber)
    this.isEditing = false;
    this.activeTab = "Edit"
    this.show = false;
    this.reviewedFlag = false
    this.newInvoiceCreation.patchValue({
      // invoiceHeader: this.selectedInvoice.header.invoiceHeader,
      ProformaCustomerName: this.selectedInvoice.header.ProformaCustomerName,
      ProformaCompanyName: this.selectedInvoice.header.ProformaCompanyName,
      ProformaAddress: this.selectedInvoice.header.ProformaAddress,
      ProformaCity: this.selectedInvoice.header.ProformaCity,
      ProformaState: this.selectedInvoice.header.ProformaState,
      customerplaceOfSupply: this.selectedInvoice.header.customerplaceOfSupply,
      ProformaPincode: this.selectedInvoice.header.ProformaPincode,
      ProformaGstNo: this.selectedInvoice.header.ProformaGstNo,
      ProformaPanNO: this.selectedInvoice.header.ProformaPanNO,
      ProformaPoNumber: this.selectedInvoice.header.ProformaPoNumber,
      ProformaInvoiceType: this.selectedInvoice.header.ProformaInvoiceType,
      ProformaInvoiceNumber: this.selectedInvoice.invoiceUniqueNumber,
      ProformaInvoiceDate: this.selectedInvoice.header.ProformaInvoiceDate,
      ProformaPan: this.selectedInvoice.header.ProformaPan,
      ProformaGstNumber: this.selectedInvoice.header.ProformaGstNumber,
      ProformaTypeOfServices: this.selectedInvoice.header.ProformaTypeOfServices,
      ProformaBankName: this.selectedInvoice.header.ProformaBankName,
      notes: this.selectedInvoice.header.notes,
      ProformaBankAccountNumber: this.selectedInvoice.header.ProformaBankAccountNumber,
      ProformaIFSCcode: this.selectedInvoice.header.ProformaIFSCcode,
      ProformaBranch: this.selectedInvoice.header.ProformaBranch,
      detailsCardAddress: this.selectedInvoice.header.detailsCardAddress,
      companyBankAccountType: this.selectedInvoice.header.companyBankAccountType,



    })
    this.chargeItems = this.selectedInvoice.serviceList.map(item => {
      return {
        description: item.serviceName || this.selectedInvoice.header.ProformaTypeOfServices,
        quantity: item.quantity,
        rate: item.rate, // Ensure the rate is mapped correctly
        amount: item.amount
      };
    });
    this.taxItems = this.selectedInvoice.taxList;
    this.subtotal = this.selectedInvoice.subtotal;
    this.grandTotal = this.selectedInvoice.grandTotal
    this.amountInWords = this.selectedInvoice.amountInWords
    this.logoUrl = this.selectedInvoice.header.invoiceImage
    this.InvoiceLogo = this.selectedInvoice.header.invoiceHeader
    this.reSubmitInvoiceStatus = this.selectedInvoice.status
    this.reason = this.selectedInvoice.reason,
      this.invoiceApprovedOrRejectedByUser = this.selectedInvoice.invoiceApprovedOrRejectedByUser,
      this.invoiceApprovedOrRejectedDateAndTime = this.selectedInvoice.invoiceApprovedOrRejectedDateAndTime,
      this.proformaCardHeaderId = this.selectedInvoice.proformaCardHeaderId,
      this.proformaCardHeaderName = this.selectedInvoice.proformaCardHeaderName
    this.reviewedFlag = this.selectedInvoice.reviewed
    if (this.logoUrl == '' || this.logoUrl == null) {
      this.logoUrl = this.imageService.getBase64FlightLogo();
    }
    if (this.InvoiceLogo == '' || this.InvoiceLogo == null) {
      this.InvoiceLogo = this.imageService.getBase64WorldLogo();

    }
    console.log("this.selectedInvoice.header.invoiceUniqueNumber", this.selectedInvoice.invoiceUniqueNumber)
    console.log("this.newInvoiceCreation", this.newInvoiceCreation.value.ProformaInvoiceNumber)
    this.pqSameforTAX = this.selectedInvoice.pqSameforTAX,
      this.rePQStatus = this.selectedInvoice.pqStatus
  }
  resetAll() {
    this.amountInWords = ""
    this.chargeItems = [];
    this.taxItems = [];
    this.subtotal = 0;
    this.grandTotal = 0
    this.selectedInvoice = null
    this.newInvoiceCreation.patchValue({
      invoiceHeader: "",
      ProformaCustomerName: "",
      ProformaCompanyName: "",
      ProformaAddress: "",
      ProformaCity: "",
      ProformaState: "",
      customerplaceOfSupply: "",
      ProformaPincode: "",
      ProformaGstNo: "",
      ProformaPanNO: "",
      ProformaPoNumber: "",
      ProformaInvoiceType: "",
      ProformaInvoiceNumber: "",
      ProformaInvoiceDate: "",
      ProformaPan: "",
      ProformaGstNumber: "",
      ProformaTypeOfServices: "",
      ProformaBankName: "",

      notes: "",
      ProformaBankAccountNumber: "",
      ProformaIFSCcode: "",
      ProformaBranch: '',
      detailsCardAddress: '',
      companyBankAccountType: ''


    })
    this.submited = false
    setTimeout(() => {
      this.spinner.hide()
      console.log("enter into new or all spinner")
    }, 1000); // Delay of 2 seconds
  }

  backButton() {
    this.show = true
    this.activeTab = "AllInvoice"
  }

  // Method to preview an invoice
  previewInvoice(invoice: any) {
    this.selectedInvoice = invoice;
    this.isEditing = false;
  }

  // Method to edit an invoice
  editInvoice(invoice: any) {
    this.selectedInvoice = invoice;
    this.isEditing = true;
  }
  setTab(tabName: string) {
    this.spinner.show()
    this.activeTab = ''
    if (tabName == 'AllInvoice' || tabName == 'NewInvoice') {
      this.activeTab = tabName;
      this.invoiceItem = null
      console.log("this.activeTab", this.activeTab);
      this.resetAll()
      this.show = true

    } else {
      this.activeTab = tabName;
      setTimeout(() => {
        this.spinner.hide()
        console.log('setTab else this.invoiceItem', this.invoiceItem)
        console.log('newInvoiceCreation', this.newInvoiceCreation.value)
      }, 1000); // Delay of 2 seconds


    }


  }

  // formatAmount(value: any): string {
  //   if (!value) return '0';
  //   return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 0 });
  // }
  formatAmount(amount: any): string {
    if (!amount) return '0';
    return parseFloat(amount.toString().replace(/,/g, '')).toLocaleString('en-IN');
  }



  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const reader = new FileReader();

      reader.onload = () => {
        this.logoUrl = reader.result as string; // Store the image URL
        console.log("Image logoUrl:", this.logoUrl);
      };

      reader.readAsDataURL(input.files[0]); // Convert file to base64 URL
    }
  }

  removeLogo(event: Event): void {
    event.preventDefault();
    this.logoUrl = 'assets/images/AircraftFlight.png';
  }

  // addChargeItem() {
  //   if (this.newInvoiceCreation.value.ProformaState) {
  //     const newChargeItem = {
  //       description: this.chargeItems.length === 0 ? this.newInvoiceCreation.value.bookingsector : '', // Only add sector to the first row
  //       units: this.chargeItems.length === 0 ? this.newInvoiceCreation.value.bookingbillingflyingtime : '', // Only add billing flying time to the first row
  //       rate: 0,
  //       amount: 0
  //     };

  //     this.chargeItems.push(newChargeItem);
  //     console.log("this.chargeItems addChargeItem", this.chargeItems);
  //   } else {
  //     Swal.fire(`Please select State and Add Charges`);
  //   }
  // }
  addChargeItem(): void {
    this.chargeItems.push({
      id: 0,
      selectedObjId: null,
      description: '',
      HSN_SAC: '',
      quantity: 1,
      UOM: '',
      rate: 0,
      amount: 0,
      availableStock: 0,
      purchasePrice: 0
    });
  }


  updateChargeItem(index: number, field: string, value: any) {
    if (this.chargeItems.length > index) {
      this.chargeItems[index][field] = value.toUpperCase(); // Convert to uppercase
    }
    this.calculateTotals()
  }

  deleteChargeItem(index: number): void {
    if (index > 0) { // Don't delete the first row
      this.chargeItems.splice(index, 1);
      this.calculateTotals();
    }
  }


  addTaxItem(): void {
    this.taxItems.push({ description: '', percentage: 0, amount: 0 });
  }

  //   calculateTotals() {
  //     this.subtotal = 0;
  //     this.grandTotal = 0;

  //     this.chargeItems.forEach(item => {
  //         if (item.rate) {
  //             item.amount = item.rate;
  //         } else {
  //             item.amount = 0;
  //         }
  //     });

  //     this.subtotal = this.chargeItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  //     this.taxItems.forEach(tax => {
  //         tax.amount = Math.round(this.subtotal * (Number(tax.percentage) / 100));
  //     });

  //     this.grandTotal = Math.round(this.subtotal + this.taxItems.reduce((sum, tax) => sum + (Number(tax.amount) || 0), 0));

  //     this.amountInWords = this.numberToWordsService.convert(this.grandTotal).toUpperCase();

  //     console.log("chargeItems", this.chargeItems);
  //     console.log("taxItems", this.taxItems);
  //     console.log("subtotal", this.subtotal);
  //     console.log("grandTotal", this.grandTotal);
  //     console.log("amountInWords", this.amountInWords);
  // }
  calculateAmount(item: ChargeItem): void {
    const quantity = parseFloat(item.quantity.toString()) || 0;
    const rate = parseFloat(item.rate.toString().replace(/,/g, '')) || 0;
    item.amount = quantity * rate;
    this.calculateTotals();
  }

  blockNonNumeric(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];

    // Allow navigation keys
    if (allowedKeys.includes(event.key)) {
      return;
    }

    // Allow only digits
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }


  // calculateTotals(): void {
  //   // Calculate subtotal
  //   this.subtotal = this.chargeItems.reduce((sum, item) => {
  //     const amount = parseFloat(item.amount.toString().replace(/,/g, '')) || 0;
  //     return sum + amount;
  //   }, 0);

  //   // Calculate taxes
  //   this.taxItems.forEach(tax => {
  //     tax.amount = Math.round(this.subtotal * (Number(tax.percentage) / 100));
  //   });

  //   // Calculate grand total
  //   this.grandTotal = Math.round(this.subtotal + this.taxItems.reduce((sum, tax) => sum + (Number(tax.amount) || 0), 0));

  //   this.amountInWords = this.numberToWordsService.convert(this.grandTotal).toUpperCase();
  // }
  calculateTotals(): void {
    this.subtotal = this.chargeItems.reduce((sum, item) => {
      return sum + (item.amount || 0);
    }, 0);

    this.taxItems.forEach(tax => {
      tax.amount = Math.round(this.subtotal * (Number(tax.percentage) / 100));
    });

    this.grandTotal = Math.round(this.subtotal + this.taxItems.reduce((sum, tax) => sum + (Number(tax.amount) || 0), 0));
    this.amountInWords = this.numberToWordsService.convert(this.grandTotal).toUpperCase();
  }


  // convertUnitsToHours(units: string | null): number {
  //   if (!units || units.trim() === '') return 0;

  //   let cleanUnits = units.trim().toLowerCase();
  //   cleanUnits = cleanUnits.replace(/ hrs?$/, '');

  //   const dotParts = cleanUnits.split('.');
  //   const colonParts = cleanUnits.split(':');

  //   let hours = 0;
  //   let minutes = 0;

  //   if (dotParts.length === 2) {
  //       hours = Number(dotParts[0]);
  //       minutes = Number(dotParts[1]);
  //   } else if (colonParts.length === 2) {
  //       hours = Number(colonParts[0]);
  //       minutes = Number(colonParts[1]);
  //   } else {
  //       // Check if it's just whole hours (e.g., "6")
  //       const wholeHours = Number(cleanUnits);
  //       if (!isNaN(wholeHours)) {
  //           return wholeHours;
  //       }
  //       return 0; // Invalid format
  //   }

  //   if (isNaN(hours) || isNaN(minutes)) return 0;

  //   if (hours > 24) hours = 24;
  //   if (minutes >= 60) return 0; // Reject minutes >= 60

  //   return hours + minutes / 60;
  // }
  formatDate(proformaInvoiceDate: string): string {
    const date = new Date(proformaInvoiceDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  //   CreateInvoice(): void {


  //     console.log('this.newInvoiceCreation', this.newInvoiceCreation.invalid);
  //     if (this.newInvoiceCreation.invalid) {
  //       console.log('this.newInvoiceCreation', this.newInvoiceCreation);
  //       this.submited = true; // Ensure it's set before checking invalid fields
  //       this.newInvoiceCreation.markAllAsTouched();

  //       // Find the first invalid control and focus on it
  //       for (const key of Object.keys(this.newInvoiceCreation.controls)) {
  //         if (this.newInvoiceCreation.controls[key].invalid) {
  //           setTimeout(() => {
  //             let invalidControl = document.querySelector(`[formControlName="${key}"]`);

  //             if (invalidControl) {
  //               const ngSelectInput = invalidControl.querySelector('input'); // Get the input inside ng-select
  //               if (ngSelectInput) {
  //                 ngSelectInput.focus(); // Focus the input inside ng-select
  //               } else {
  //                 (invalidControl as HTMLElement).focus(); // Default focus for normal fields
  //               }
  //             }
  //           }, 0); // Small delay to ensure the DOM updates
  //           break; // Stop after focusing on the first invalid field
  //         }
  //       }
  //     }
  //    else if(this.chargeItems.length == 0){
  //      console.log("this.chargeItems.length",this.chargeItems.length)
  //     //  this.toaster.warning("Please Add Charges In Table")
  //      Swal.fire({
  //       text:"Please Add Charges In Table",
  //       icon: 'warning',
  //       showConfirmButton: true
  //     });
  //      return
  //     }
  //     else {
  //       console.log('Invoice Saved', this.newInvoiceCreation.value);
  //       let invoiceDate = this.newInvoiceCreation.value.ProformaInvoiceDate;
  //       // let startBookingDate = this.newInvoiceCreation.value.startBookingDateOfJourny;
  //       // let endBbookingDate = this.newInvoiceCreation.value.endBookingDateOfJourny;

  //       // ✅ Check if the date is already in 'DD-MM-YYYY' format
  //       const dateRegex = /^\d{2}-\d{2}-\d{4}$/;

  //       if (!dateRegex.test(invoiceDate)) {
  //         invoiceDate = this.formatDate(invoiceDate);
  //       }

  //       // if (!dateRegex.test(startBookingDate)) {
  //       //   startBookingDate = this.formatDate(startBookingDate);
  //       // }
  //       // if (!dateRegex.test(endBbookingDate)) {
  //       //   endBbookingDate = this.formatDate(endBbookingDate);
  //       // }
  //       // console.log("invoiceDateSplit", invoiceDate, "startBookingDate",startBookingDate,"endBbookingDate", endBbookingDate);
  // // console.log("this.newInvoiceCreation.value.ProformaCustomerName", this.newInvoiceCreation.value.ProformaCustomerName);

  // let customerNameObj;

  // // Check if ProformaCustomerName is an object and has the expected property
  // if (
  //   this.newInvoiceCreation.value.ProformaCustomerName &&
  //   typeof this.newInvoiceCreation.value.ProformaCustomerName === "object" &&
  //   "customerName" in this.newInvoiceCreation.value.ProformaCustomerName
  // ) {
  //   customerNameObj = this.newInvoiceCreation.value.ProformaCustomerName.customerName;
  // } else {
  //   customerNameObj = this.newInvoiceCreation.value.ProformaCustomerName;
  // }
  //     var statusUpdate 
  //     var pqStatus
  //     var pqUniqueId
  //    if(this.proformaCardHeaderId == "PQ"){
  //        statusUpdate = "Pending",
  //        pqStatus = "inComplete"
  //        pqUniqueId = 0

  //    }else{
  //        statusUpdate = "Amount Received"
  //        pqStatus = "Completed",
  //        pqUniqueId =this.selectedPQUniqueId
  //    }
  //       let createobj = {
  //         "header": {
  //         //  "invoiceHeader": this.InvoiceLogo,
  //         //   "invoiceImage": this.logoUrl,
  //         "invoiceHeader": null,
  //           "invoiceImage": null,
  //           "ProformaCustomerName": customerNameObj,
  //           "ProformaAddress": this.newInvoiceCreation.value.ProformaAddress,
  //           "ProformaCity": this.newInvoiceCreation.value.ProformaCity,
  //           "ProformaState": this.newInvoiceCreation.value.ProformaState,
  //           "ProformaPincode": this.newInvoiceCreation.value.ProformaPincode,
  //           "ProformaGstNo": this.newInvoiceCreation.value.ProformaGstNo,
  //           "ProformaPanNO": this.newInvoiceCreation.value.ProformaPanNO,
  //           "PQInvoiceNumber": this.newInvoiceCreation.value.PQInvoiceNumber,
  //           "ProformaInvoiceDate": invoiceDate,
  //           "ProformaPan": this.newInvoiceCreation.value.ProformaPan,
  //           "ProformaGstNumber": this.newInvoiceCreation.value.ProformaGstNumber,
  //           "ProformaTypeOfServices": this.newInvoiceCreation.value.ProformaTypeOfServices,
  //           "ProformaBankName":  this.newInvoiceCreation.value.ProformaBankName,
  //           "notes": this.newInvoiceCreation.value.notes,
  //          "ProformaBankAccountNumber": this.newInvoiceCreation.value.ProformaBankAccountNumber,
  //           "ProformaIFSCcode": this.newInvoiceCreation.value.ProformaIFSCcode,

  //         },
  //         "serviceList": this.chargeItems,
  //         "taxList": this.taxItems,
  //         "subtotal": this.subtotal,
  //         "grandTotal": this.grandTotal,
  //         "amountInWords": this.amountInWords,
  //         "reason":'',
  //         "invoiceApprovedOrRejectedByUser":"",
  //         "invoiceApprovedOrRejectedDateAndTime":"",
  //         "loggedInUser":this.loginData.data.userName,
  //         "createdByUser":this.loginData.data.userName,
  //         "status":statusUpdate,
  //         "proformaCardHeaderId":this.proformaCardHeaderId,
  //         "proformaCardHeaderName":this.proformaCardHeaderName,
  //         "reviewed":false,
  //         "reviewedReSubmited":false,
  //         "pqSameforTAX":this.pqSameforTAX?this.pqSameforTAX:0,
  //         "pqStatus":pqStatus,
  //         "pqUniqueId":pqUniqueId,

  //         // "bankDetails":{
  //         //     "accountName":this.newInvoiceCreation.value.accountName,
  //         //     "bank":this.newInvoiceCreation.value.bank,
  //         //     "accountNumber":this.newInvoiceCreation.value.accountNumber,
  //         //     "branch":this.newInvoiceCreation.value.branch,
  //         //     "ifscCode":this.newInvoiceCreation.value.ifscCode
  //         // }
  //       };

  //       console.log('Payload sent to backend:', createobj);
  //       this.spinner.show()
  //       this.service.CreateInvoice(createobj).subscribe((response: any) => {
  //         console.log("CreateInvoice", response);

  //         const resp = response.data;
  //         if (response.status === 200 && resp) {

  //           this.getAllInvoice()
  //           this.getAllCharges(); 

  //           this.activeTab = 'AllInvoice'
  //           // Reset form and related data
  //           this.newInvoiceCreation.reset();
  //           // this.logoUrl = '';
  //           this.chargeItems = [];
  //           this.taxItems = [];
  //           this.subtotal = 0;
  //           this.grandTotal = 0;
  //           this.amountInWords = '';
  //           this.resetAll()
  //           Swal.fire({
  //             text: response.message + ' with Invoice Number ' + resp.invoiceUniqueNumber,
  //             icon: 'success',
  //             showConfirmButton: true
  //           });
  //           this.spinner.hide()

  //         } else {
  //           this.spinner.hide()
  //           Swal.fire({
  //             text: 'failed to fetch data ',
  //             icon: 'error',
  //             showConfirmButton: true
  //           });
  //         }
  //       }, (error) => {
  //         // Handle error'
  //         this.spinner.hide()
  //         console.log('Error creating invoice:', error);
  //         Swal.fire({
  //           text: error,
  //           icon: 'error',
  //           showConfirmButton: true
  //         });
  //       });
  //     }
  //   }
  CreateInvoice(): void {
    console.log('Form validity:', this.newInvoiceCreation.valid, this.chargeItems);

    // Mark all fields as touched to show validation errors
    this.newInvoiceCreation.markAllAsTouched();
    this.submited = true;

    // Check if form is invalid
    if (this.newInvoiceCreation.invalid) {
      this.newInvoiceCreation.markAllAsTouched(); // Ensure validation errors are shown

      // Check and log all invalid controls
      for (const key of Object.keys(this.newInvoiceCreation.controls)) {
        const control = this.newInvoiceCreation.get(key);
        if (control?.invalid) {
          console.log(`❌ Invalid field: ${key}`, control.errors);

          // Try to focus the first invalid field
          setTimeout(() => {
            const fieldElement = document.querySelector(`[formControlName="${key}"]`);
            if (fieldElement) {
              const input = fieldElement.querySelector('input');
              if (input) {
                input.focus();
              } else {
                (fieldElement as HTMLElement).focus();
              }
            } else {
              console.warn(`⚠️ Element not found for: formControlName="${key}"`);
            }
          }, 0);
          break; // Focus only first invalid field
        }
      }
      return;
    }


    // Check if charge items are added
    if (this.chargeItems.length === 0) {
      Swal.fire({
        text: "Please Add Charges In Table",
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Recalculate totals before submission to ensure accuracy
    // this.calculateTotals();

    // Format dates
    let invoiceDate = this.newInvoiceCreation.value.ProformaInvoiceDate;
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dateRegex.test(invoiceDate)) {
      invoiceDate = this.formatDate(invoiceDate);
    }

    // Handle customer name (could be object or string)
    let customerNameObj;
    if (this.newInvoiceCreation.value.ProformaCustomerName &&
      typeof this.newInvoiceCreation.value.ProformaCustomerName === "object" &&
      "customerName" in this.newInvoiceCreation.value.ProformaCustomerName) {
      customerNameObj = this.newInvoiceCreation.value.ProformaCustomerName.customerName;
    } else {
      customerNameObj = this.newInvoiceCreation.value.ProformaCustomerName;
    }

    let companyNameObj;
    if (this.newInvoiceCreation.value.ProformaCompanyName &&
      typeof this.newInvoiceCreation.value.ProformaCompanyName === "object" &&
      "companyName" in this.newInvoiceCreation.value.ProformaCompanyName) {
      companyNameObj = this.newInvoiceCreation.value.ProformaCompanyName.companyName;
    } else {
      companyNameObj = this.newInvoiceCreation.value.ProformaCompanyName;
    }
    let servicesNameObj;
    if (this.newInvoiceCreation.value.ProformaTypeOfServices &&
      typeof this.newInvoiceCreation.value.ProformaTypeOfServices === "object" &&
      "servicesName" in this.newInvoiceCreation.value.ProformaTypeOfServices) {
      servicesNameObj = this.newInvoiceCreation.value.ProformaTypeOfServices.servicesName;
    } else {
      servicesNameObj = this.newInvoiceCreation.value.ProformaTypeOfServices;
    }
    // Set status based on invoice type
    let statusUpdate, pqStatus, pqUniqueId;
    if (this.proformaCardHeaderId === "PQ") {
      statusUpdate = "Pending";
      pqStatus = "inComplete";
      pqUniqueId = 0;
    } else if (this.proformaCardHeaderId === "OnlyTAX") {
      statusUpdate = "Pending";
      pqStatus = "inComplete";
      pqUniqueId = 0;
    }
    else {
      statusUpdate = "Amount Received";
      pqStatus = "Completed";
      pqUniqueId = this.selectedPQUniqueId || 0;
    }

    // Prepare payload
    const payload = {
      "header": {
        "invoiceHeader": null,
        "invoiceImage": null,
        "ProformaCustomerName": customerNameObj,
        "companyImageUpload": this.companyImageUpload,
        "ProformaCompanyName": companyNameObj,
        "ProformaAddress": this.newInvoiceCreation.value.ProformaAddress,
        "ProformaCity": this.newInvoiceCreation.value.ProformaCity,
        "ProformaState": this.newInvoiceCreation.value.ProformaState,
        "customerplaceOfSupply": this.newInvoiceCreation.value.customerplaceOfSupply,
        "ProformaPincode": this.newInvoiceCreation.value.ProformaPincode,
        "ProformaGstNo": this.newInvoiceCreation.value.ProformaGstNo,
        "ProformaPanNO": this.newInvoiceCreation.value.ProformaPanNO,
        "ProformaPoNumber": this.newInvoiceCreation.value.ProformaPoNumber,
        "ProformaInvoiceType": this.newInvoiceCreation.value.ProformaInvoiceType,
        // "ProformaInvoiceNumber": this.newInvoiceCreation.value.ProformaInvoiceNumber,
        "ProformaInvoiceDate": invoiceDate,
        "ProformaPan": this.newInvoiceCreation.value.ProformaPan,
        "ProformaGstNumber": this.newInvoiceCreation.value.ProformaGstNumber,
        "ProformaTypeOfServices": servicesNameObj,
        "ProformaBankName": this.newInvoiceCreation.value.ProformaBankName,
        "notes": this.newInvoiceCreation.value.notes,
        "ProformaBankAccountNumber": this.newInvoiceCreation.value.ProformaBankAccountNumber,
        "ProformaIFSCcode": this.newInvoiceCreation.value.ProformaIFSCcode,
        "ProformaBranch": this.newInvoiceCreation.value.ProformaBranch,
        "detailsCardAddress": this.newInvoiceCreation.value.detailsCardAddress,
        "companyState": this.newInvoiceCreation.value.companyState,
        "companyBankAccountType": this.newInvoiceCreation.value.companyBankAccountType
      },
      "serviceList": this.chargeItems,
      "taxList": this.taxItems,
      "subtotal": this.subtotal,
      "grandTotal": this.grandTotal,
      "amountInWords": this.amountInWords,
      "reason": '',
      "invoiceApprovedOrRejectedByUser": "",
      "invoiceApprovedOrRejectedDateAndTime": "",
      "loggedInUser": this.loginData.data.userName,
      "createdByUser": this.loginData.data.userName,
      "status": statusUpdate,
      "proformaCardHeaderId": this.proformaCardHeaderId,
      "proformaCardHeaderName": this.proformaCardHeaderName,
      "reviewed": false,
      "reviewedReSubmited": false,
      "pqSameforTAX": this.pqSameforTAX ? this.pqSameforTAX : 0,
      "pqStatus": pqStatus,
      "pqUniqueId": pqUniqueId,
      "fundsRecievedDate": "",
      "refUTR": "",
      "actualAmountReceived": "",
      "DSC_Status": "Dsc File Pending",
      "DSC_UploadFile": "",
      "uploadType": ""
    };

    console.log('Invoice payload:', payload);
    // Show loading spinner
    this.spinner.show();

    // Call API to create invoice
    this.service.CreateInvoice(payload).subscribe(
      (response: any) => {
        this.spinner.hide();
        console.log("API Response:", response);

        if (response.status === 200 && response.data) {
          // Reset form and data
          this.newInvoiceCreation.reset();
          this.chargeItems = [];
          this.taxItems = [];
          this.subtotal = 0;
          this.grandTotal = 0;
          this.amountInWords = '';
          this.resetAll();

          // Refresh data
          this.getAllInvoice();
          this.getAllCharges();

          // Show success message
          Swal.fire({
            title: 'Success!',
            text: `${response.message} with Invoice Number ${response.data.invoiceUniqueNumber}`,
            icon: 'success',
            confirmButtonText: 'OK'
          });

          // Navigate to All Invoices tab
          this.activeTab = 'AllInvoice';
        } else {
          Swal.fire({
            title: 'Error!',
            text: response.message || 'Failed to create invoice',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      },
      (error) => {
        this.spinner.hide();
        console.error('Error creating invoice:', error);

        // Safely extract backend message
        let backendMessage = error 
          

        Swal.fire({
          title: 'Error!',
          text: backendMessage,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    );
  }

  numbersOnly(event: any) {
    const charCode = event.charCode;
    if (!(charCode >= 48 && charCode <= 57) && ![8, 9, 37, 39, 46].includes(charCode)) {
      event.preventDefault();
    }
  }

  UpdateInvoice(): void {


    if (this.newInvoiceCreation.valid) {
      console.log('Invoice Updated', this.newInvoiceCreation.value);


      let invoiceDate = this.newInvoiceCreation.value.ProformaInvoiceDate;
      // let startBookingDate = this.newInvoiceCreation.value.startBookingDateOfJourny;
      // let endBbookingDate = this.newInvoiceCreation.value.endBookingDateOfJourny;

      // ✅ Check if the date is already in 'DD-MM-YYYY' format
      const dateRegex = /^\d{2}-\d{2}-\d{4}$/;

      if (!dateRegex.test(invoiceDate)) {
        invoiceDate = this.formatDate(invoiceDate);
      }

      // if (!dateRegex.test(startBookingDate)) {
      //   startBookingDate = this.formatDate(startBookingDate);
      // }
      // if (!dateRegex.test(endBbookingDate)) {
      //   endBbookingDate = this.formatDate(endBbookingDate);
      // }
      // console.log("invoiceDateSplit update", invoiceDate, "startBookingDate",startBookingDate,"endBbookingDate", endBbookingDate);
      var pqStatus
      var statusUpdate
      var rePQStatus
      console.log("this.reSubmitInvoiceStatus", this.reSubmitInvoiceStatus, "this.rePQStatus", this.rePQStatus)
      if (this.reSubmitInvoiceStatus == "Approved" && this.rePQStatus == 'inComplete') {
        statusUpdate = "Pending",
          rePQStatus = 'inComplete'

      } else {
        statusUpdate = this.reSubmitInvoiceStatus,
          rePQStatus = 'inComplete'
      }

      // Implement update logic here
      let updateobj = {

        "invoiceReferenceNo": this.originalUniqueId,
        "header": {
          // "invoiceHeader": this.InvoiceLogo,
          // "invoiceImage": this.logoUrl,
          "invoiceHeader": null,
          "invoiceImage": null,
          "ProformaCustomerName": this.newInvoiceCreation.value.ProformaCustomerName,
          "ProformaCompanyName": this.newInvoiceCreation.value.ProformaCompanyName,
          "ProformaAddress": this.newInvoiceCreation.value.ProformaAddress,
          "ProformaCity": this.newInvoiceCreation.value.ProformaCity,
          "ProformaState": this.newInvoiceCreation.value.ProformaState,
          "customerplaceOfSupply": this.newInvoiceCreation.value.customerplaceOfSupply,
          "ProformaPincode": this.newInvoiceCreation.value.ProformaPincode,
          "ProformaGstNo": this.newInvoiceCreation.value.ProformaGstNo,
          "ProformaPanNO": this.newInvoiceCreation.value.ProformaPanNO,
          "ProformaPoNumber": this.newInvoiceCreation.value.ProformaPoNumber,
          "ProformaInvoiceType": this.newInvoiceCreation.value.ProformaInvoiceType,
          "ProformaInvoiceNumber": this.newInvoiceCreation.value.ProformaInvoiceNumber,
          "ProformaInvoiceDate": invoiceDate,
          "ProformaPan": this.newInvoiceCreation.value.ProformaPan,
          "ProformaGstNumber": this.newInvoiceCreation.value.ProformaGstNumber,
          "ProformaTypeOfServices": this.newInvoiceCreation.value.ProformaTypeOfServices,
          "ProformaBankName": this.newInvoiceCreation.value.ProformaBankName,
          "notes": this.newInvoiceCreation.value.notes,
          "ProformaBankAccountNumber": this.newInvoiceCreation.value.ProformaBankAccountNumber,
          "ProformaIFSCcode": this.newInvoiceCreation.value.ProformaIFSCcode,
          "ProformaBranch": this.newInvoiceCreation.value.ProformaBranch,
          "detailsCardAddress": this.newInvoiceCreation.value.detailsCardAddress,
          "companyState": this.newInvoiceCreation.value.companyState,
          "companyBankAccountType": this.newInvoiceCreation.value.companyBankAccountType,

        },
        "serviceList": this.chargeItems,
        "taxList": this.taxItems,
        "subtotal": this.subtotal,
        "grandTotal": this.grandTotal,
        "amountInWords": this.amountInWords,
        "reason": this.reason,
        "invoiceApprovedOrRejectedByUser": this.invoiceApprovedOrRejectedByUser,
        "invoiceApprovedOrRejectedDateAndTime": this.invoiceApprovedOrRejectedDateAndTime,
        "loggedInUser": this.loginData.data.userName,
        "createdByUser": this.loginData.data.userName,
        "status": statusUpdate,
        "proformaCardHeaderId": this.proformaCardHeaderId,
        "proformaCardHeaderName": this.proformaCardHeaderName,
        "reviewed": this.reviewedFlag,
        "reviewedReSubmited": false,
        "pqSameforTAX": this.pqSameforTAX ? this.pqSameforTAX : 0,
        "pqStatus": rePQStatus,
        "fundsRecievedDate": "",
        "refUTR": "",
        "actualAmountReceived": "",
        "DSC_Status": "Dsc File Pending",
        "DSC_UploadFile": "",
        "uploadType": ""

        // "bankDetails":{
        //     "accountName":this.newInvoiceCreation.value.accountName,
        //     "bank":this.newInvoiceCreation.value.bank,
        //     "accountNumber":this.newInvoiceCreation.value.accountNumber,
        //     "branch":this.newInvoiceCreation.value.branch,
        //     "ifscCode":this.newInvoiceCreation.value.ifscCode
      };
      console.log('Payload sent to backend:', updateobj);
      this.spinner.show()
      this.service.UpdateInvoice(updateobj, this.originalUniqueId).subscribe((response: any) => {
        console.log("updateInvoice", response);
        this.spinner.hide()
        const resp = response.updatedInvoice;
        if (response.status === 200 && resp) {
          this.getAllInvoice()
          this.getAllCharges();
          // Reset form and related data
          this.newInvoiceCreation.reset();
          // this.logoUrl = '';
          this.chargeItems = [];
          this.taxItems = [];
          this.subtotal = 0;
          this.grandTotal = 0;
          this.amountInWords = '';
          this.activeTab = "AllInvoice"
          this.resetAll()
          this.show = true
          Swal.fire({
            text: response.message,
            icon: 'success',
            showConfirmButton: true
          });
          this.invoiceItem = null

        } else {
          this.spinner.hide()
          Swal.fire({
            text: 'Failed to Update data ',
            icon: 'error',
            showConfirmButton: true
          });
        }
      }, (error) => {
        // Handle error
        this.spinner.hide()
        console.log('Error updating invoice:', error);
        Swal.fire({
          text: 'An error occurred while updating the invoice',
          icon: 'error',
          showConfirmButton: true
        });
      });
    } else {
      this.spinner.hide()
      console.log('Form is invalid');
      Swal.fire({
        text: 'Please fill out the form correctly.',
        icon: 'warning',
        showConfirmButton: true
      });
    }
  }
  convertToUppercase(event: any) {
    event.target.value = event.target.value.toUpperCase();
  }

  restrictToNumbers(event: KeyboardEvent) {
    const pattern = /[0-9]/;
    const inputChar = event.key;

    if (!pattern.test(inputChar)) {
      event.preventDefault(); // Prevent non-numeric input
    }
  }
  getAllCharges() {
    this.service.getAllCharges().subscribe((res: any) => {
      this.allCharges = res.data; // Update the allCharges array with the fetched data
      console.log('allCharges:', this.allCharges);

    }, error => {
      console.error("Error fetching charges:", error);
    });
  }

  filterBasedOnCustomerAndCompany() {
    this.filteredCharges = []
    let companyNameObj;
    if (this.newInvoiceCreation.value.ProformaCompanyName &&
      typeof this.newInvoiceCreation.value.ProformaCompanyName === "object" &&
      "companyName" in this.newInvoiceCreation.value.ProformaCompanyName) {
      companyNameObj = this.newInvoiceCreation.value.ProformaCompanyName.companyName;
    } else {
      companyNameObj = this.newInvoiceCreation.value.ProformaCompanyName;
    }
    let servicesNameObj;
    if (this.newInvoiceCreation.value.ProformaCustomerName &&
      typeof this.newInvoiceCreation.value.ProformaCustomerName === "object" &&
      "servicesName" in this.newInvoiceCreation.value.ProformaCustomerName) {
      servicesNameObj = this.newInvoiceCreation.value.ProformaCustomerName.servicesName;
    } else {
      servicesNameObj = this.newInvoiceCreation.value.ProformaCustomerName;
    }
    console.log("companyNameObj", companyNameObj, "servicesNameObj", servicesNameObj, this.allCharges)
    this.filteredCharges = this.allCharges.filter(item => item.companyName == companyNameObj && item.customerName == servicesNameObj)
    console.log("filteredCharges", this.filteredCharges)
  }






}
