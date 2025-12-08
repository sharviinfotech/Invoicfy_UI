import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { GeneralserviceService } from 'src/app/generalservice.service';
import { NgxPrintModule } from 'ngx-print';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { BsDatepickerConfig, BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ImageService } from 'src/app/image.service';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ChargeItem {
  HSN_SAC: any;
  rate: string;
  quantity: string;
  UOM: any;
  description: string;
  amount: string;
  _id: string;
}

interface TaxItem {
  description: string;
  percentage: string;
  rate: string;
  quantity: string;
  amount: string;
  _id: string;
}

interface InvoiceHeader {
  customerplaceOfSupply: any;
  state_Code: any;
  ProformaPoNumber: string;
  ProformaCompanyName: any;
  companyImageUpload: any;
  ProformacompanyName: any;
  detailsCardAddress: any;
  ProformaBranch: any;
  ProformaIFSCcode: any;
  ProformaBankAccountNumber: any;
  ProformaBankName: any;
  invoiceHeader: string;
  invoiceImage: string;
  ProformaCustomerName: string;
  ProformaAddress: string;
  ProformaCity: string;
  ProformaState: string;
  ProformaPincode: string;
  ProformaGstNo: string;
  ProformaPanNO: string;
  ProformaInvoiceNumber: string;
  ProformaInvoiceDate: string;
  ProformaPan: string;
  ProformaGstNumber: string;
  ProformaTypeOfServices: string;
  ProformaSeatingCapasity: number;
  notes: string;
  BookingDateOfJourny: string;
  BookingSector: string;
  BookingBillingFlyingTime: string;
  companyState: string;
  companyBankAccountType: string;

}

interface InvoiceItem {
  ProformaCompanyName: any;
  notes: any;
  tax: any;
  items: any;
  customerName: any;
  customerAddress: any;
  customerPhone: any;
  customerEmail: any;
  invoiceDate: any;
  invoiceNumber: any;
  header: InvoiceHeader;
  _id: string;
  invoiceReferenceNo: number;
  serviceList: ChargeItem[];
  taxList: TaxItem[];
  subtotal: number;
  grandTotal: number;
  amountInWords: string;
  dateRangeValidator: any;
  status: string;
  invoiceUniqueNumber: string;
  proformaCardHeaderName: string;
  DSC_UploadFile: string
}
@Component({
  selector: 'app-invoice-reports',
  templateUrl: './invoice-reports.component.html',
  styleUrl: './invoice-reports.component.css',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxPrintModule, BsDatepickerModule],
  standalone: true,
  // encapsulation: ViewEncapsulation.None

})
export class InvoiceReportsComponent {
  // @ViewChild('invoiceContent', { static: false }) invoiceContent!: ElementRef;

  allInvoiceList: any[] = [];
  bsConfig: Partial<BsDatepickerConfig>;
  invoiceItem: any;

  // allInvoiceList: any;
  invoice = {
    invoiceNumber: 'INV-5678',
    invoiceDate: '2025-01-25',
    header: {
      toName: 'John Doe'
    },
    amount: '$500'
  };
  logoUrl: string;
  itemsPerPage: number = 20;
  pageSize = 20;
  currentPage = 1;
  totalItems = 0;
  totalPages = 0;
  pages: number[] = [];
  pagedInvoiceList: any[] = [];
  InvoiceLogo: string;
  reportsForm: FormGroup;
  filteredInvoices: any;
  uniqueInvoices: any;

  submit: boolean = false;
  // minToDate: Date | undefined;
  signature: string;
  Stamp: string;
  Lighter: string;
  Flammable: string;
  Toxics: string;
  Corrosives: string;
  Pepper: string;
  Flammablegas: String;
  eCigarettes: string;
  Infection: string;
  Radio: string;
  Explosives: string;
  Lithium: string;
  Power: string;
  loginData: any;
  grandTotalInvoices: any;
  paginatedInvoices: any[];
  cdr: any;
  leftlogo: string;
  bodyImage: string;
  AllowImage: any;
  bodyImage1: any;
  centerLogo: any;
  background1: any;
  Flight1Logo: string;
  Flight2Logo: string;
  Flight3Logo: string;
  Flight4Logo: string;
  Flight5Logo: string;
  Flight6Logo: string;
  searchTerm: string = ''
  filteredData: any[];
  backgroundlight: any;
  rightLogo: any;
  background2: string;
  // bsConfigToDate: { minDate: Date; };
  constructor(public service: GeneralserviceService, private spinner: NgxSpinnerService, private imageService: ImageService, private fb: FormBuilder) {
    this.service = service;

    this.bsConfig = {
      dateInputFormat: 'DD-MM-YYYY',
      containerClass: 'theme-blue', // Optional: Customize theme
    };
    /*   this.bsConfigToDate = {
        dateInputFormat: 'DD-MM-YYYY',
        minDate: new Date() // Ensures no past dates are selected
      };
   */

  }

  ngOnInit(): void {
    this.loginData = this.service.getLoginResponse();
    console.log("this.loginData ", this.loginData);
    this.filteredData = [...this.allInvoiceList];
    this.updatePagination();
    this.loadInvoices();
    this.getAllInvoice();

    this.reportsForm = this.fb.group({
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      status: ['', Validators.required],
      invoiceType: ['', Validators.required],
    });
    // this.calculateTotalPages();


  }
  getTaxAmount(taxList: any[], type: string): string {
    const tax = taxList?.find(t => t.description?.toUpperCase().includes(type));
    const amount = tax ? Number(tax.amount) : 0;
    return amount.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  }


  // calculateTotalPages() {
  //   this.totalPages = Math.ceil(this.allInvoiceList.length / this.pageSize);
  //   this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  // }


  // onPageSizeChange() {
  //   this.currentPage = 1;
  //   // this.calculateTotalPages();
  //   this.pageChanged(1);
  // }

  loadInvoices() {
    this.allInvoiceList = []
    // this.updatePagination();
    this.getAllInvoice()
  }

  // pageChanged(newPage: number) {
  //   if (newPage >= 1 && newPage <= this.totalPages) {
  //     this.currentPage = newPage;
  //     this.updatePagination();
  //   }
  // }
  onPageSizeChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }
  pageChanged(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  resetPagination(): void {
    this.currentPage = 1;
    this.updatePagination();
  }
  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedInvoices = this.allInvoiceList.slice(startIndex, endIndex);
    console.log("Paginated Invoices: ", this.paginatedInvoices);
  }

  // resetPagination() {
  //   this.service.page = 1; // Reset the page number to 1
  // }






  get f() {
    return this.reportsForm.controls;
  }

  onChangeForm() {
    console.log("this.reportsForm", this.reportsForm);

    if (this.reportsForm.value.fromDate && this.reportsForm.value.toDate) {
      this.filteredInvoices = [];
      const fromD = new Date(this.reportsForm.value.fromDate);
      const toD = new Date(this.reportsForm.value.toDate);
      const selectedStatus = this.reportsForm.value.status || '';
      const selectedInvoiceType = this.reportsForm.value.invoiceType || '';

      if (fromD > toD) {
        console.log("Error: From Date cannot be greater than To Date");
        return;
      }

      console.log('From Date:', fromD);
      console.log('To Date:', toD);

      // Filter invoices
      this.filteredInvoices = this.uniqueInvoices.filter(invoice => {
        const invoiceDate = new Date(invoice.header.ProformaInvoiceDate);
        const isWithinDateRange = invoiceDate >= fromD && invoiceDate <= toD;
        const isStatusMatch = selectedStatus === '' || invoice.status.toLowerCase() === selectedStatus.toLowerCase();
        const isInvoiceTypeMatch = selectedInvoiceType === '' || invoice.proformaCardHeaderId === selectedInvoiceType;

        return isWithinDateRange && isStatusMatch && isInvoiceTypeMatch;
      });

      console.log('Filtered Invoices:', this.filteredInvoices);
      this.allInvoiceList = this.filteredInvoices;

      // 🔥 Reset pagination after filtering 🔥
      this.currentPage = 1;
      // this.calculateTotalPages();
      this.updatePagination();

      this.submit = false;
    } else {
      console.log('Error: Please select From Date and To Date');
      this.submit = true;
    }
  }




  // Utility function to format date as YYYY-MM-DD
  formatDate(dateStr) {
    if (!dateStr) return null;

    const dateObj = new Date(dateStr);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Ensure two digits
    const day = String(dateObj.getDate()).padStart(2, '0'); // Ensure two digits

    return `${year}-${month}-${day}`;
  }

  // Helper method to convert date string to Date object
  convertToDate(dateString: any): Date {
    if (typeof dateString === 'string' && dateString.includes('-')) {
      const [day, month, year] = dateString.split('-').map(val => parseInt(val, 10));
      return new Date(year, month, day); // JS Date months are 0-indexed
    } else if (dateString instanceof Date) {
      return dateString;  // If the input is already a Date object, return it directly
    } else {
      console.error('Invalid date format:', dateString);
      // return new Date(); // Return current date as fallback or handle accordingly

      return dateString ? new Date(dateString) : null;


    }
  }
  isDateInRange(invoiceDate: Date, fromDate: Date, toDate: Date): boolean {
    // Convert dates to comparable format (e.g., DD-MM-YYYY)
    const invoiceDateParts = invoiceDate;
    const fromDateParts = fromDate;
    const toDateParts = toDate;

    const invoiceDateObj = new Date(Number(invoiceDateParts[2]), Number(invoiceDateParts[1]) - 1, Number(invoiceDateParts[0]));
    const fromDateObj = new Date(Number(fromDateParts[2]), Number(fromDateParts[1]) - 1, Number(fromDateParts[0]));
    const toDateObj = new Date(Number(toDateParts[2]), Number(toDateParts[1]) - 1, Number(toDateParts[0]));
    console.log("isDateInRange:", invoiceDate, fromDate, toDate)
    return invoiceDate >= fromDate && invoiceDate <= toDate;
  }
  reset() {
    this.reportsForm.reset()
    this.reportsForm.patchValue({
      "status": ''
    })
    this.getAllInvoice()
  }
  printData() {


    var fromDate = this.reportsForm.value.fromDate
    var toDate = this.reportsForm.value.toDate
    var invoiceType = this.reportsForm.value.invoiceType
    var status = this.reportsForm.value.status
    this.grandTotalInvoices = 0
    this.allInvoiceList.forEach(invoice => {
      this.grandTotalInvoices += invoice.grandTotal;
    });

    const invoiceHTML = `
    
<html>
<head>
 
  <style>
      
  
   .table-bordered {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 10px;
      // background-color:rgb(193, 205, 217); /* Added background color */
      font-size: 12px !important;
       border: 1px solid #ddd !important;
    }
     .table-bordered th {
      border: 1px solid #ddd;
    padding: 2px;
    background: rgb(143 152 192) !important;
    color: white;
    }
 
    .table-bordered td {
    padding: 2px;
    border: 1px solid #ddd;
    }
   
 
   
       
    .bold {
      font-weight: bold;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }

  

 

  @media print {
    
   body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 5px;
              background-color: white;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-size: 9px;
            }
              
       
            .table-bordered {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 10px;
      // background-color:rgb(193, 205, 217); /* Added background color */
      font-size: 13px !important;
       border: 1px solid #ddd !important;
    }
     .table-bordered th {
      border: 1px solid #ddd;
    padding: 2px;
    background: rgb(143 152 192) !important;
    color: white;
   
    }
 
    .table-bordered td {
    padding: 2px;
    border: 1px solid #ddd;
    }
   
 
   
       
    .bold {
      font-weight: bold;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
     tr {
    page-break-inside: avoid;
  }
  
  thead {
    display: table-header-group;
  }
  
  tfoot {
    display: table-footer-group;
  }


  </style>
</head>
<body>
  <div class="">
    <table class="table-bordered">
              <thead>
                  <tr>
            <th class="text-nowrap">Invoice Number</th>
            <th class="text-nowrap">Invoice Date</th>
            <th class="text-nowrap">Customer Name</th>
            <th class="text-nowrap">Type Of Service</th>
            <th class="text-nowrap">City</th>
            <th class="text-nowrap">Destination</th>
            <th class="text-nowrap">Date Of Journey</th>
            <th class="text-nowrap">Total Amount</th>
            <th class="text-nowrap">Status</th>
            
              </thead>
              <tbody>
            
                ${this.allInvoiceList.map((invoice, index) => `
                  <tr>
                   
                     <td >${invoice.invoiceUniqueNumber}</td>
                    <td>${invoice.header.ProformaInvoiceDate}</td>
                    <td >${invoice.header.ProformaCustomerName}</td>
                    <td >${invoice.header.ProformaTypeOfServices}</td>
                    <td >${invoice.header.ProformaCity}</td>
                     <td>${invoice.header.BookingSector}</td>
                    <td >${invoice.header.startBookingDateOfJourny}/${invoice.header.endBookingDateOfJourny}</td>
                    <td >${invoice.grandTotal ? invoice.grandTotal.toFixed(2) : '0.00'}</td>
                    <td >${invoice.status}</td>

                  </tr>
                `).join('')}
               
                <tr>
                    <td ></td>
                    <td></td>
                    <td ></td>
                    <td ></td>
                    <td ></td>
                     <td></td>
                    <td </td>
                    <td >TOTAL</td>
                    <td >${this.grandTotalInvoices ? this.grandTotalInvoices.toFixed(2) : '0.00'}</td> </tr>
              </tbody>
            </table>

        </div>
   
  </div>
</body>
</html>
 
 
    `;
    const newWindow = window.open('', '', 'height=600,width=800');
    if (newWindow) {
      newWindow.document.write(invoiceHTML);
      newWindow.document.close();

      newWindow.onafterprint = function () {
        newWindow.close();
      };

      newWindow.onbeforeunload = function () {
        newWindow.close();
      };

      setTimeout(() => {
        newWindow.print();
      }, 500);
    }

  }


  downloadExcel() {
    if (!this.paginatedInvoices || this.paginatedInvoices.length === 0) {
      Swal.fire("No Data", "No invoices available to download", "warning");
      return;
    }

    let exportData = this.paginatedInvoices.map((inv: any) => ({
      "Invoice Number": inv.invoiceUniqueNumber,
      "Invoice Date": inv.header?.ProformaInvoiceDate,
      "Customer Name": inv.header?.ProformaCustomerName,
      "City": inv.header?.ProformaCity,
      "Invoice Type": inv.proformaCardHeaderId,
      "IGST": this.getTaxAmount(inv.taxList, 'IGST'),
      "SGST": this.getTaxAmount(inv.taxList, 'SGST'),
      "CGST": this.getTaxAmount(inv.taxList, 'CGST'),
      "Actual Amount": inv.subtotal,
      "Total Amount": inv.grandTotal,
      "Status": inv.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");

    // ✅ AUTO COLUMN WIDTH — this is what your second excel is missing
    const colWidths = Object.keys(exportData[0]).map(key => ({
      wch: Math.max(key.length + 5, 22)
    }));
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, "Invoice_Report.xlsx");
  }



  getAllInvoice() {
    this.allInvoiceList = []

    // this.allInvoiceList = data;
    // this.calculateTotalPages();
    // this.updatePagination();
    this.spinner.show()
    //   let obj={
    //     "userActivity":""
    // }
    this.service.getAllInvoice().subscribe((res: any) => {
      console.log("getAllInvoice", res);
      this.spinner.hide()
      this.allInvoiceList = res.data;
      this.uniqueInvoices = [...this.allInvoiceList];

      console.log("this.uniqueInvoices", this.uniqueInvoices)
      this.updatePagination();
      // this.calculateTotalPages();
    }, error => {
      this.spinner.hide()
    })
  }



  // Method to select and show an invoice
  selectInvoice(invoice: any) {
    this.invoiceItem = null
    this.invoiceItem = invoice
    const invoiceItem = invoice;
    console.log("invoice", invoice)
    console.log("this.invoiceItem", this.invoiceItem.invoiceReferenceNo);
    console.log("this.invoiceItem.header.status", this.invoiceItem.header.status)


    if (this.invoiceItem.status == "Rejected") {
      console.log("If rejected")
      Swal.fire({
        // title: 'question',
        text: 'The selected invoice has been rejected, so printing is not possible.',
        icon: 'info',
        // showCancelButton: true,
        showConfirmButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          this.invoiceItem = invoice
          console.log("this.invoiceItem", this.invoiceItem)
        } else {
          this.invoiceItem = invoice
          console.log("this.invoiceItem", this.invoiceItem)
        }
      });
    } else if (this.invoiceItem.status == "Pending") {
      console.log("If pending")
      Swal.fire({
        // title: 'question',
        text: 'The invoice is pending, so please proceed with the process.',
        icon: 'info',
        showCancelButton: false,
        showConfirmButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
        } else {
          this.invoiceItem = invoice
          console.log("this.invoiceItem", this.invoiceItem)
        }
      });
    }
    else if (this.invoiceItem.status == "Rejected_Reversed") {
      console.log("If pending")
      Swal.fire({
        // title: 'question',
        text: 'The selected invoice is Rejected Reversed, so please proceed with the process.',
        icon: 'info',
        showCancelButton: false,
        showConfirmButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
        } else {
          this.invoiceItem = invoice
          console.log("this.invoiceItem", this.invoiceItem)
        }
      });
    }
    else {
      if (this.invoiceItem.status == "Amount Received") {
        Swal.fire({
          text: 'The selected invoice Amount  has been Received. Do you want to print the invoice?',
          icon: 'question',
          showCancelButton: true,
          showConfirmButton: true,
          confirmButtonText: 'Print',
        }).then((result) => {
          if (result.isConfirmed) {
            if (result.isConfirmed) {
              console.log('invoiceItem.proformaCardHeaderId', invoiceItem.proformaCardHeaderId)
              // Check conditions before calling print functions
              if (invoiceItem.proformaCardHeaderId === "PQ") {
                // this.generateInvoiceHTMLProfoma1(invoiceItem);
                this.Finalprofoma1_29_03_2025(invoiceItem)
                // this.UCL(invoiceItem);
                // Additional checks if needed
              } else if (invoiceItem.proformaCardHeaderId === "TAX") {
                this.FinalTax_21_29_03_2025(invoiceItem);
              } else {
                Swal.fire({
                  text: "No valid invoice type selected for printing.",
                  icon: "warning",
                });
              }
            }

          }
        });
      } else {
        Swal.fire({
          text: 'The selected invoice has been approved. Do you want to print the invoice?',
          icon: 'question',
          showCancelButton: true,
          showConfirmButton: true,
          confirmButtonText: 'Print',
        }).then((result) => {
          if (result.isConfirmed) {
            console.log('invoiceItem.proformaCardHeaderId', invoiceItem.proformaCardHeaderId)
            // Check conditions before calling print functions
            if (invoiceItem.proformaCardHeaderId === "PQ") {
              // this.generateInvoiceHTMLProfomalast(invoiceItem);
              this.Finalprofoma1_29_03_2025(invoiceItem)
              // this.UCL(invoiceItem);
              // Additional checks if needed
            } else if (invoiceItem.proformaCardHeaderId === "TAX" || invoiceItem.proformaCardHeaderId === "OnlyTAX") {
              this.FinalTax_21_29_03_2025(invoiceItem);
            } else {
              Swal.fire({
                text: "No valid invoice type selected for printing.",
                icon: "warning",
              });
            }
          }
        });

      }

    }
  }
  Finalprofoma1_29_03_2025(invoiceItem: InvoiceItem) {
    this.leftlogo = this.imageService.sharvileftlogo();
    // this.logoUrl = this.imageService.getBase64FlightWorldmapLogo();
    this.logoUrl = this.imageService.getBase64FlightNewLogo();
    // this.InvoiceLogo = this.imageService.getBase64FlightNewLogo();
    this.rightLogo = this.imageService.sharviQRCODE();
    this.signature = this.imageService.getBase64Signature();
    // this.bodyImage1 = this.imageService.getBase64FlightFullNameLight();
    this.background1 = this.imageService.SharviBackgroundLightBlue();
    this.background2 = this.imageService.SharviBackgroundLight();

    this.Lighter = this.imageService.getBase64LighterLogo();
    this.Flammable = this.imageService.getBase64FlammableLogo();
    this.Toxics = this.imageService.getBase64ToxicsLogo();
    this.Corrosives = this.imageService.getBase64CorrosivesLogo();
    this.Pepper = this.imageService.getBase64PepperLogo();
    this.Flammablegas = this.imageService.getBase64FlammableGasLogo();
    this.eCigarettes = this.imageService.getBase64EcigarettesLogo();
    this.Infection = this.imageService.getBase64InfectionLogo();
    this.Radio = this.imageService.getBase64RadioactiveLodo();
    this.Explosives = this.imageService.getBase64ExplosivesLogo();
    this.bodyImage = this.imageService.getBase64FlightAviationwithLogo();
    this.bodyImage1 = this.imageService.getBase64FlightFullNameLight();
    this.Lithium = this.imageService.getBase64LithiumLogo();
    this.Power = this.imageService.getBase64PowerLogo();
    this.centerLogo = this.imageService.getBase64CenterLogo();
    // this.FlightImagewhite = this.imageService.getBase64Flight1Logo();
    // this.FlightImage2=this.imageService.getBase64Flight2Logo();

    // this.backgroundlight=this.imageService.BackgroundLogoLight();
    // this.FlightImage01=this.imageService.FlightImage11();
    // this.FlightImage02 = this.imageService.FlightImage12();
    // this.FlightImage03 = this.imageService.FlightImage13();




    const invoiceHTML = `
 
<html>
<head>
 
<style>
    .invoice-container {
padding: 10px;
border: 1px solid #ccc;

font-family: Arial, sans-serif;
}
 body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 5px;
            background-color: white;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-size: 12px;
          }
     
        .invoice-container {
          width: 100%;
          margin: auto;
          border: 1px solid #ddd;
          padding: 10px;
         
          box-sizing: border-box;
      }
 
      .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
      }
.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Distributes space evenly */
}
 
.header-section .logo {
  display: flex;
  flex-direction: column;
  align-items: center; /* Center content vertically */
}
 
.header-section .left-logo {
  text-align: left; /* Align text to the left */
}
 
.header-section .right-logo {
  text-align: right; /* Align text to the right */
}
 
.header-section .company-name {
  text-align: center; /* Center the company name */
  flex-grow: 1; /* Allow the company name to take up available space */
}
 
.header-section img {
   max-width: 195px; /* Adjust as needed */
  height: 130px !important;
}
 .booking-details {
    border: 1px solid #ccc;
    width: 100%;
  }
 
  .booking-header {
    background-color: rgb(91, 85, 130);
    padding: 5px;
    color:white;
      text-align: center;
    border-bottom: 1px solid #ccc;
  }
 
  .booking-data {
        padding: 5px;
  width: 100%;
  display: flex;
  font-size: 14px;
  }
 
  .data-item {
    display: inline-block;
    padding-right: 10px;
    border-right: 1px solid #ccc;
  }
 
  .data-item:last-child {
    border-right: none;
    padding-right: 0;
  }
   .text-center{
     text-align: right;
    }
  .orange-background {
 
background-color: rgb(167, 166, 175);
    font-size: 15px;
    color:white;
    padding: 8px;
    text-align: center;
    font-weight: bold;
  }
 
  .table-bordered {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 10px;
    // background-color:rgb(193, 205, 217); /* Added background color */
  }
   .table-bordered th {
      border: 1px solid white;
  padding: 2px;
  background: rgb(143 152 192) !important;
  color: white;
  }
 
  .table-bordered td {
  padding: 2px;
  }
  .booking-header bold{
  font-size: 13px;
  background-color: rgb(91, 85, 130);
  color: white;
  }
 
 
 
     
  .bold {
    font-weight: bold;
    font-size:14px;
   
 
  }
    .backgrd{
        background-image: url('${this.background2}') !important;
        background-size: 65%!important;
        background-position: center !important;
        background-repeat: no-repeat !important;
       
        }
  .text-right {
    text-align: right;
  }
  .text-center {
    text-align: center;
  }
 .footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-top: 10px;
      }
 
      .footer .logo {
          width: 50%;
      }
 
      .footer .logo img {
          width: 100%;
          height: auto;
      }
   
 
 
 
 
@media print {
  .invoice-container {
margin: 0px;
padding: 3px;
border: 1px solid #ccc;
font-family: Arial, sans-serif;
}
 body {
            font-family: Arial, sans-serif;
            margin: 0px;
            padding: 0px;
            background-color: white;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
         
          }
            .InvoiceHeader {
                background-color: rgb(91, 85, 130);
                font-size: 14px;
                color:black;
                padding: 4px;
                text-align: center;
                font-weight: 700;
               
           }
     
        .invoice-container {
          width: 100%;
          margin: auto;
          border: 1px solid #ddd;
          padding: 4px;
          box-sizing: border-box;
      }
        .second-page{
        width: 100%;
          margin: auto;
           
          border: 1px solid #ddd;
          padding: 4px;
          background: #fff;
          box-sizing: border-box;
        }
     
    @page {
        size: A4;
        margin: 10mm;
    }
 
    .second-page {
        width: 100%;
        height: 100vh;
        position: relative;
        overflow: hidden;
        page-break-inside: avoid;
    }
 
    .backgrd {
        background-size: 65%;
        background-position: center;
        background-repeat: no-repeat;
        padding-top: 25px;
        width: 100%;
        page-break-inside: avoid;
    }
 
    .terms {
        font-size: 12px;
        line-height: 1.3;
       
        overflow: hidden;
        page-break-inside: avoid;
        margin: 0;
        padding: 0 5px;
    }
 
    .NotAllow, .Allowed {
        page-break-inside: avoid;
        font-size: 12px;
        line-height: 1.2;
        display: flex;
        flex-wrap: wrap;
    }
 
    .NotAllow img, .Allowed img {
        width: 60px;
        height: 40px;
    }
 
    .NotAllow div, .Allowed div {
        width: 20%;
        text-align: center;
    }
 
    /* Scale content to fit */
    body {
        transform: scale(1);
        transform-origin: top left;
    }
 
 
 
      .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
      }
.header-section {
  display: flex;
  
  justify-content: space-between; /* Distributes space evenly */
}
 
.header-section .logo {
  display: flex;
  flex-direction: column;
  align-items: center; /* Center content vertically */
}
 
.header-section .left-logo {
  text-align: left; /* Align text to the left */
}
 
.header-section .right-logo {
  text-align: right; /* Align text to the right */
}
 
.header-section .company-name {
  text-align: center; /* Center the company name */
  flex-grow: 1; /* Allow the company name to take up available space */
}
 
.header-section img {
    max-width: 200px; /* Adjust as needed */
  height: 110px !important;
}
 .booking-details {
    border: 1px solid #ccc;
    width: 100%;
  }
 
  .booking-header {
    background-color: rgb(88, 98, 145);
    padding: 5px;
    color:white;
      text-align: center;
    border-bottom: 1px solid #ccc;
  }
 
  .booking-data {
        padding: 4px;
  width: 100%;
  display: flex;
  font-size: 12px;
  }
 
 
  .data-item {
    display: inline-block;
    padding-right: 8px;
    border-right: 1px solid #ccc;
  }
 
 
  .data-item:last-child {
    border-right: none;
    padding-right: 0;
  }
   .text-center{
     text-align: right;
    }
  .orange-background {
 
   background-color: rgb(127, 127, 136);
    font-size: 12px;
    color:white;
    padding: 4px;
    text-align: center;
    font-weight: bold;
  }
 .table-bordered {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 10px;
    // background-color:rgb(193, 205, 217); /* Added background color */
  }
   .table-bordered th {
      border: 1px solid white;
  padding: 2px;
  background: rgb(143 152 192) !important;
  color: white;
  }
 
  .table-bordered td {
  padding: 5px;
  }
  .booking-header bold{
 
  background-color: rgb(88, 98, 145);
  color: white;
  margin-bottom:4px;
  }
   .backgrd{
        background-image: url('${this.background2}') !important;
        background-size: 80%!important;
        background-position: center !important;
        background-repeat: no-repeat !important;
        padding-top:10px ;
        }
  .terms{
         margin-bottom:0px;
        font-size: 12x;
       
        }
 
 
     
  .bold {
    font-weight: bold;
  }
  .text-right {
    text-align: right;
  }
  .text-center {
    text-align: center;
  }
 .note p {
    margin: 0;
    display: inline-block;
    font-size:14px;
}
 
 
 
   
 .footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin: 5px;
          padding:5px;
      }
         
   
      .footer .logo {
          width: 50%;
      }
 
      .footer .logo img {
          width: 60%;
          height: auto;
      }
       a {
      font-weight: normal !important;
      color: blue !important;
      text-decoration: none !important;
    }
}
 
</style>
</head>
<body>
 
<div class="invoice-container">
<div class="header-section" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
    <div class="logo left-logo">
        <img src="${this.leftlogo}" alt="Invoice Logo" style="height: 90px; width: 150px;">
    </div>
    <div class="right-text" style="font-family: 'Times New Roman', serif; font-size: 18px; font-weight: 700; text-transform: uppercase; text-align: center; flex-grow: 1;">
        <p style="margin: 0; color: #2a2a2a;">
        ${invoiceItem.header.ProformaCompanyName}<br>
       ${invoiceItem.header.detailsCardAddress},${invoiceItem.header.companyState}
          

        </p>
    </div>
    <div class="logo left-logo">
        <img src="${this.rightLogo}" alt="Invoice Logo" style="height: 90px; width: 150px;">
    </div>
</div>

  <br>
 <div class="backgrd">
  <div class="booking-header bold">${invoiceItem.proformaCardHeaderName}</div>
<br>

<div class="TO" style="display: flex; width: 100%; font-size: 13px; gap: 0px;">

  <!-- Left Section -->
  <div style="width: 50%;">
    <table style="border-collapse: collapse; width: 100%; font-size: 13px;">
      <thead>
        <tr>
          <td colspan="2" style="background-color: rgb(88, 98, 145); color: white; padding: 5px;">
            // <strong> ${invoiceItem.header.ProformaCustomerName}</strong>
          </td>
        </tr>
      </thead>
      <tbody>
        <tr><td colspan="2" style="padding: 3px;">${invoiceItem.header.ProformaCustomerName}</td></tr>
        <tr><td colspan="2" style="padding: 3px;">${invoiceItem.header.ProformaAddress},${invoiceItem.header.ProformaCity}, ${invoiceItem.header.ProformaPincode}</td></tr>
        <tr><td colspan="2" style="padding: 3px;">${invoiceItem.header.ProformaState}</td></tr>
        <tr><td colspan="2" style="padding: 3px;"><strong>GST NO:</strong> ${invoiceItem.header.ProformaGstNo}</td></tr>
        <tr><td colspan="2" style="padding: 3px;"><strong>PAN NO:</strong> ${invoiceItem.header.ProformaPanNO}</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Right Section -->
  <div style="width: 50%;border-left: 2px solid white;">
    <table style="border-collapse: collapse; width: 100%; font-size: 13px;">
      <thead>
        <tr>
          <td colspan="2" style="background-color: rgb(88, 98, 145); color: white; padding: 5px;">
           <td style="padding: 3px;">: ${invoiceItem.header.ProformaCompanyName}</td>
          </td>
        </tr>
      </thead>
      <tbody>

    <td style="padding: 5px; vertical-align: top; font-size:14px;">${invoiceItem.header.detailsCardAddress},${invoiceItem.header.companyState}</td>

        <tr>
          <td style="padding: 3px; width: 40%;"><strong>INVOICE NO</strong></td>
          <td style="padding: 3px;">: ${invoiceItem.invoiceUniqueNumber}</td>
        </tr>
        <tr>
          <td style="padding: 3px;"><strong>DATE</strong></td>
          <td style="padding: 3px;">: ${invoiceItem.header.ProformaInvoiceDate}</td>
        </tr>
        <tr>
          <td style="padding: 3px;"><strong>PAN NO</strong></td>
          <td style="padding: 3px;">: ${invoiceItem.header.ProformaPan}</td>
        </tr>
        <tr>
          <td style="padding: 3px;"><strong>GST NO</strong></td>
          <td style="padding: 3px;">: ${invoiceItem.header.ProformaGstNumber}</td>
        </tr>
       
      </tbody>
    </table>
  </div>

</div>

 

  
 
<table class="table-bordered" style="font-size: 16px; width:100%; ">
            <thead>
              <tr>
                <th class="booking-header bold">S.NO</th>
                <th class="booking-header bold">DESCRIPATION</th>
  <th class="booking-header bold">HSN/SAC</th>
                 <th class="booking-header bold">QUANTITY</th>
                  <th class="booking-header bold">UOM</th>
                <th class="booking-header bold">RATE</th>
                <th class="booking-header bold">AMOUNT(INR)</th>
              </tr>
            </thead>
            <tbody>
           <tr>
            <td>1</td>
            <td class="bold">SERVICE|PRODUCT</td>
            <td class="text-right"></td>
          </tr>
              ${invoiceItem.serviceList.map((charge, index) => `
                <tr>
                 
                   <td class="text-center" ></td>
                  <td >${charge.description}</td>
                   <td >${charge.HSN_SAC}</td>
                  <td class="text-right">${charge.quantity ? charge.quantity : ''}</td>
                    <td >${charge.UOM}</td>
                  <td class="text-right">${charge.rate}</td>
                  <td class="text-right"  >${charge.amount}</td>
                </tr>
              `).join('')}
             
              <tr>
             
              <td></td>
              <td></td>
                  <td></td>
                <td  class="text-right bold" >TOTAL</td>
                <td class="text-right bold"  style=" color:black; font-size:16px;">${invoiceItem.subtotal}</td>
              </tr>
              <tr>
            <td>2</td>
                  <td class="bold">TAXES:</td>
                  <td></td>
                  <td></td>
            </tr>
 
              ${invoiceItem.taxList.map(tax => `
                <tr>
                  <td ></td>
                  <td >${tax.description}</td>
                  <td></td>
                  <td></td>
                  <td class="text-right" style="font-size:14px;">${tax.amount}</td>
                </tr>
              `).join('')}
 
              <tr>
             <td></td>
                  <td></td>
              <td></td>
                <td class="text-right bold" 
                >GRAND TOTAL</td>
                <td class="text-right bold" >${invoiceItem.grandTotal ? invoiceItem.grandTotal.toFixed(0) : '0.00'}</td>
              </tr>
                <tr style="padding-top:5px;">
                  <td colspan="7" class="bold" >Amount IN Words : <b> ${invoiceItem.amountInWords}</b></td>
               </tr>
            </tbody>
          </table>
 
 <div class="booking-header bold" style="font-size:12px" >BANK DETAILS</div>
<div class="remittance-container" style="display: flex; justify-content: center; align-items: center; width: 80%;">
    <table class="remittance-table" style="border-collapse: collapse; width: 100%;">
        <tr>
            <td style="padding: 3px; vertical-align: top; font-size:13px;"><strong>Bank Name</strong></td>
            <td style="padding: 3px; vertical-align: top;font-size:13px;">: ${invoiceItem.header.ProformaBankName}</td>
        </tr>
        <tr>
            <td style="padding: 3px; vertical-align: top; font-size:13px;"><strong>Account Number</strong></td>
            <td style="padding: 3px; vertical-align: top;font-size:13px;">: ${invoiceItem.header.ProformaBankAccountNumber}</td>
        </tr>
        <tr>
            <td style="padding: 3px; vertical-align: top;font-size:13px;"><strong>IFSC Code</strong></td>
            <td style="padding: 3px; vertical-align: top;font-size:13px;">:  ${invoiceItem.header.ProformaIFSCcode}</td>
        </tr>
        <tr>
            <td style="padding: 3px; vertical-align: top;font-size:13px;"><strong>Branch</strong></td>
            <td style="padding: 3px; vertical-align: top;font-size:13px;">:${invoiceItem.header.ProformaBranch}</td>
        </tr>
       
    </table>
</div>
 
 
   <div class="logo">
   
 
 
  <div class="footer">
        <div class="note">
     
       
        </div>
          <div class="text-center">
                <div style="padding-right:10px;"><h4>SHARVI INFOTECH PRIVATE LIMITED</h4></div>
 
              <div  > <img src="${this.signature}" alt="Company Logo" class="logo"></div>
                 Authorised Signatory
             
          </div>
      </div>
      </div>
 </div>

    </div>
   <div style="text-align:center; padding:0px; font-size:18px;">
  // <p>
  //   Address: STPI, 2nd Floor, Divya Sree Solitaire Building HI-TECH City, Madhapur,<br>
  //   Hyderabad, Telangana 500081, IN 
  //   Website: <a href="https://www.sharviinfotech.com" target="_blank">www.sharviinfotech.com</a>
  // </p>
  <p>
  ${invoiceItem.header.ProformaAddress},
  ${invoiceItem.header.ProformaCity}, ${invoiceItem.header.companyState},
          ${invoiceItem.header.ProformaPincode}
          </p>

</div>

</body>
</html>
 
 
  `;

    const newWindow = window.open('', '', 'height=600,width=800');
    if (newWindow) {
      newWindow.document.write(invoiceHTML);
      newWindow.document.close();

      setTimeout(() => {
        newWindow.print();
      }, 500);
    }
  };
  UCL(invoiceItem: InvoiceItem) {
    this.leftlogo = this.imageService.sharvileftlogo();
    // this.logoUrl = this.imageService.getBase64FlightWorldmapLogo();
    this.logoUrl = this.imageService.getBase64FlightNewLogo();
    // this.InvoiceLogo = this.imageService.getBase64FlightNewLogo();
    this.rightLogo = this.imageService.sharviQRCODE();
    this.signature = this.imageService.getBase64Signature();
    // this.bodyImage1 = this.imageService.getBase64FlightFullNameLight();
    this.background1 = this.imageService.SharviBackgroundLightBlue();
    this.background2 = this.imageService.SharviBackgroundLight();

    this.Lighter = this.imageService.getBase64LighterLogo();
    this.Flammable = this.imageService.getBase64FlammableLogo();
    this.Toxics = this.imageService.getBase64ToxicsLogo();
    this.Corrosives = this.imageService.getBase64CorrosivesLogo();
    this.Pepper = this.imageService.getBase64PepperLogo();
    this.Flammablegas = this.imageService.getBase64FlammableGasLogo();
    this.eCigarettes = this.imageService.getBase64EcigarettesLogo();
    this.Infection = this.imageService.getBase64InfectionLogo();
    this.Radio = this.imageService.getBase64RadioactiveLodo();
    this.Explosives = this.imageService.getBase64ExplosivesLogo();
    this.bodyImage = this.imageService.getBase64FlightAviationwithLogo();
    this.bodyImage1 = this.imageService.getBase64FlightFullNameLight();
    this.Lithium = this.imageService.getBase64LithiumLogo();
    this.Power = this.imageService.getBase64PowerLogo();
    this.centerLogo = this.imageService.getBase64CenterLogo();
    // this.FlightImagewhite = this.imageService.getBase64Flight1Logo();
    // this.FlightImage2=this.imageService.getBase64Flight2Logo();

    // this.backgroundlight=this.imageService.BackgroundLogoLight();
    // this.FlightImage01=this.imageService.FlightImage11();
    // this.FlightImage02 = this.imageService.FlightImage12();
    // this.FlightImage03 = this.imageService.FlightImage13();




    const invoiceHTML = `
  
  <!DOCTYPE html>
  <html lang="en">
  
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tax Invoice</title>
      <style>
          body {
              font-family: sans-serif;
              margin: 0;
              padding: 0;
              line-height: 1.4;
              font-size: 12px; /* Reduced default font size */
          }
          .UCL {
    border: 2px solid #000; /* Solid black border */
    padding: 3px;
    margin: 5px auto;
    width: 100%; /* Optional: control the width */
    box-sizing: border-box; /* Ensures padding doesn't affect total width */
}

          
           table {
           margin-left:5px;
      width: 95%;
      border-collapse: collapse;
    }
    td {
      border: 1px solid #000;
      padding-left: 4px;
      vertical-align: top;
    }
    .no-border {
      border: none;
    }
    .section-title {
      font-weight: bold;
    }
    .highlight {
      font-weight: bold;
    }
    .address-table {
    width: 95%; /* Adjust width as needed */
    border-collapse: collapse;
    font-family: sans-serif;
    margin-top: 0px; /* Add some top margin if needed */
  }

  .address-table th, .address-table td {
    border: 1px solid #000;
    padding: 3px;
    text-align: left;
  }

  .address-table th {
    background-color: #f0f0f0;
    font-weight: bold;
  }

  .address-column {
    width: 50%;
  } 
  
          .service-details table {
              width: 95%;
              border-collapse: collapse;
              margin-bottom: 10px; /* Reduced margin */
          }
  
          .service-details th,
          .service-details td {
              border: 1px solid #000;
              padding: 5px; /* Reduced padding */
              text-align: left;
          }
  
          .service-details th {
              background-color: #f0f0f0;
          }
               .main-table {
      width: 95%;
      border-collapse: collapse;
      border: 1px solid black;
    }

    .main-table td {
      border: 1px solid black;
      vertical-align: top;
    }

    .left-cell {
      width: 50%;
      height: 100px;
      text-align: center;
    }

    .left-cell img {
      max-width: 100%;
      height: 100px;
    }

    .right-cell {
      width: 48%;
      padding: 0;
    }

    .nested-table {
      width: 95%;
      border-collapse: collapse;
    }

    .nested-table td {
      padding: 5px;
    }

    .right-align {
      text-align: center;
    }
  
          .amount-details table {
              width: 50%;
              margin-left: auto;
              border-collapse: collapse;
          }
  
          .amount-details th,
          .amount-details td {
              border: 1px solid #ddd;
              padding: 5px; /* Reduced padding */
              text-align: left;
          }
  
          .amount-words{
  padding:0px;
  margin;0px;
  }
  
  .container {
            border: 1px solid #000; /* Basic border to represent the box */
            padding: 15px;
            width: 95%; /* Adjust width as needed */
            font-family: sans-serif;
            font-size: 14px;
        }

        .bank-details, .tax-details, .to-address, .signature-block {
            margin-bottom: 10px;
        }

        .details-heading {
            font-weight: bold;
            margin-bottom: 5px;
        }

        .detail-item {
            margin-bottom: 3px;
        }

        .signature-name {
            font-size: 1.2em;
            font-weight: bold;
           /* Example color from the image */
        }

        .digitally-signed {
            font-size: 0.8em;
            color: #555;
        }

        .signature-date {
            font-size: 0.9em;
            color: #555;
        }
        .Bank-Address{
        display:flex;
        justify-content:space-between;
        }
        .header-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 40px;
  font-family: Arial, sans-serif;
  font-size: 13px;
  color: #b38c00; /* Gold-brown color */
}

.company-info,
.contact-info {
  width: 30%;
}

.company-name {
  text-align: center;
  width: 40%;
}
 
  
          /* Print Styles */
    @media print {
  body {
    font-family: sans-serif;
    margin: 0;
    padding: 0;
    line-height: 1.4;
    font-size: 12px;
  }

  .UCL {
    border: 2px solid #000;
    padding: 3px;
    margin: 5px auto;
    width: 100%;
    box-sizing: border-box;
    page-break-inside: avoid;
  }

  

  table {
    margin-left: 5px;
    width: 99%;
    border-collapse: collapse;
  }

  td {
      border: 1px solid #000;
      padding-left: 4px;
      vertical-align: top;
    }

  .no-border {
    border: none;
  }

  .section-title,
  .highlight,
  .address-table th {
    font-weight: bold;
  }

  .address-table {
    width: 99%;
    border-collapse: collapse;
    font-family: sans-serif;
    margin-top: 0px;
  }

  .address-table th,
  .address-table td {
    border: 1px solid #000;
    padding: 3px;
    text-align: left;
 
  }

  .address-column {
    width: 50%;
  }

  .service-details table {
    width: 99%;
    border-collapse: collapse;
    margin-bottom: 10px;
  }

  .service-details th,
  .service-details td {
    border: 1px solid #000;
    padding: 5px;
    text-align: left;
   
  }

  .main-table {
    width: 99%;
    border-collapse: collapse;
    border: 1px solid black;
  }

  .main-table td {
    border: 1px solid black;
    vertical-align: top;
  }

  .left-cell {
    width: 50%;
    height: 100px;
    text-align: center;
  }

  .left-cell img {
    max-width: 100%;
    height: 150px;
  }

  .right-cell {
    width: 48%;
    padding: 0;
  }

  .nested-table {
    width: 99%;
    border-collapse: collapse;
  }

  .nested-table td {
    padding: 5px;
  }

  .right-align {
    text-align: center;
  }

  .amount-details table {
    width: 50%;
    margin-left: auto;
    border-collapse: collapse;
  }

  .amount-details th,
  .amount-details td {
    border: 1px solid #ddd;
    padding: 5px;
    text-align: left;
  }

  .amount-words{
  padding:0px;
  margin;0px;
  }

  .container {
    border: 1px solid #000;
    padding: 0px;
    padding-left:3px;

    width: 99%;

    font-family: sans-serif;
    font-size: 14px;
    page-break-inside: avoid;
  }

  .bank-details,
  .tax-details,
  .to-address,
  .signature-block {
    margin-bottom: 10px;
  }

  .details-heading {
    font-weight: bold;
    margin-bottom: 5px;
  }

  .detail-item {
    margin-bottom: 3px;
  }

  .signature-name {
    font-size: 1.2em;
    font-weight: bold;
  
  }

  .digitally-signed {
    font-size: 0.8em;
    color: #555;
  }

  .signature-date {
    font-size: 0.9em;
    color: #555;
  }

  .Bank-Address {
    display: flex;
    justify-content: space-between;
  }

  /* Optional: Prevent breaking inside containers */
  .invoice-container,
  .service-details,
  .container,
  .main-table {
    page-break-inside: avoid;
  }

  /* Optional: Force everything on one page (use with caution) */
  html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
     * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    font-smoothing: antialiased;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  @page {
    margin: 10mm;
    size: A4 portrait;
  }

  body {
    margin: 0;
    padding: 0;
    font-size: 12px;
    font-family: sans-serif;
  }

  .invoice-container,
  .container,
  .main-table,
  .service-details,
  .amount-words,
  .signature-block {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .main-table {
    width: 100%;
    table-layout: fixed;
  }

  .main-table td {
    word-wrap: break-word;
    vertical-align: top;
  }

  .left-cell img {
    max-width: 100%;
    height: 100px;
    object-fit: contain;
  }

  .amount-details td,
  .amount-details th {
    background: white !important;
    color: black !important;
  }
    .header-wrapper {
    position: fixed;
    bottom: 0;
    width: 100%;
    color: #b38c00;
    background-color: white;
    padding: 10px 20px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
     /* optional separator line */
  }
}


      </style>
  </head>
  
  <body>
  <div class="header-section" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
    <div class="logo left-logo">
        <img src="${this.leftlogo}" alt="Invoice Logo" style="height: 80px; width: 150px;">
    </div>
    <div class="right-text" style="font-weight: 600; text-transform: uppercase; text-align: center; flex-grow: 1;">
<div style="margin: 0; color: #2a2a2a;">
  <p style="font-size:14px;"><b>Tax Invoice</b></p>
</div>
    </div>
     <div class="logo left-logo">
     
    </div>
</div>
  <div class ="UCL">
<div class="invoice-container">
         <table>
         <tbody>
  <tr>
    <td rowspan="6" style="width: 50%;">
      <div class="section-title">Service Provider</div>
      Intellect Bizware Services Pvt. Ltd.<br>
      Technocity, 6th Floor<br>
      Plot No X-5/3, Opp. M.B.P. Mahape, M.I.D.C., Navi Mumbai<br>
      Navi Mumbai - 400710 INDIA<br>
      State Code: 27 State: Maharashtra<br>
      <span class="highlight">Kind Attention : Mr. Narayan Navik</span>
    </td>
    <td><span class="highlight">Invoice No</span><br>2300001316</td>
    <td><span class="highlight">Invoice Date</span><br>30.01.2024</td>
  </tr>
  <tr>
    <td><span class="highlight">Order No.</span><br>MSA</td>
    <td><span class="highlight">Order Date</span><br>25.04.2023</td>
  </tr>
  <tr>
    <td><span class="highlight">Sale order</span>:10002425</td>
    <td><span class="highlight">Delivery</span>:20039036</td>
  </tr>      
  <tr>
    <td><span class="highlight">Payment terms</span></td>
    <td>Immediate Payment</td>
  </tr>
  <tr>
    <td><span class="highlight">Due Date</span></td>
    <td>30.01.2024</td>
  </tr>
  </tbody>
</table>
 <table>
 <tr>
    <td>
      <strong>IRN:</strong> ab67bc98fd513032e3dc308542ce7dc51cbfaca7d7433a88e72d85e9e1841
    </td>
  </tr>
 </table> 
          <table class="address-table">
  <tr>
    <th class="address-column">Bill to Address</th>
    <th class="address-column">Ship to Address</th>
  </tr>
  <tr>
    <td>
      Universal Cables Limited<br>
      Birla Colony Campus,<br>
      Post Office Birla Vikash<br>
      GSTIN NO 23AAACU3547P1Z1 Satna - 485005
    </td>
    <td>
      Universal Cables Limited<br>
      Birla Colony Campus,<br>
      Post Office Birla Vikash<br>
      GSTIN NO 23AAACU3547P1Z1 Satna - 485005
    </td>
  </tr>
</table>

          <div class="service-details">
              <table>
                  <thead>
                      <tr>
                          <th>Sr No.</th>
                          <th>Description of Service</th>
                          <th>HSN/SAC</th>
                          <th>From Date</th>
                          <th>To Date</th>
                          <th>Nos.</th>
                          <th>% Amount</th>
                          <th>Rate</th>
                          <th>Total</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr>
                          <td>1</td>
                          <td>SAP Support - All Modules</td>
                          <td>01.01.2024</td>
                          <td>31.01.2024</td>
                          <td>1.000</td>
                          <td>100%</td>
                          <td>39,375.00</td>
                          <td>39,375.00</td>
                      </tr>
                  </tbody>
              </table>
          </div>
<div>
    <table class="main-table">
      <tr>
        <td class="left-cell">
          <img src="${this.rightLogo}" alt="QR or Signature">
        </td>
        <td class="right-cell">
          <table class="nested-table">
            <tr>
              <td><strong>Total Base Amount</strong></td>
              <td></td>
              <td class="right-align">39,375.00</td>
            </tr>
            <tr>
              <td><strong>IGST</strong></td>
              <td class="right-align">18%</td>
              <td class="right-align">7,087.50</td>
            </tr>
            <tr>
              <td><strong>Rounding</strong></td>
              <td></td>
              <td class="right-align">0.50</td>
            </tr>
            <tr>
              <td><strong>Grand Total</strong></td>
              <td class="right-align">INR</td>
              <td class="right-align">46,463.00</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  </div>
          <div class="amount-words">
              <strong><p>Amount Payable(in words)</p></strong>
              <p>Total INR FORTY-SIX THOUSAND FOUR HUNDRED SIXTY-THREE ONLY</p>
          </div>
 <div class="container">
 <div class ="Bank-Address">
        <div class="bank-details">
            <div class="details-heading">Our Bank Details</div>
            <div class="detail-item">ICICI Bank</div>
            <div class="detail-item">Branch: CBD Belapur</div>
            <div class="detail-item">A/c No. - 087305000338</div>
            <div class="detail-item">IFSC/RTGS/NEFT Code - ICIC0000873</div>
            <div class="detail-item">SWIFT CODE - ICICINBBCCTS</div>
            <div class="detail-item">BSR Code - 6390979</div>
        </div>
        <div class="tax-details">
            <div class="details-heading">Our Tax Details</div>
            <div class="detail-item">Registration No. U72300MH2009PTC192567</div>
            <div class="detail-item">PAN No. AACCI1519B</div>
            <div class="detail-item">GST No. 27AACCI1519B1Z4</div>
            <div class="detail-item">HSN Code : 85234990 - Sale of Software Licenses</div>
            <div class="detail-item">SAC Code : 998313 - Software Implementation <br>Services/ AMC Services</div>
        </div>
        </div>
        <div class ="Bank-Address">
        <div class="to-address">
            <div class="details-heading">To</div>
            <div class="detail-item">Mr. Narayan Navik</div>
            <div class="detail-item">Universal Cables Limited</div>
            <div class="detail-item">Birla Colony Campus,</div>
            <div class="detail-item">Post Office Birla Vikash</div>
            <div class="detail-item">Post Office Birla Vikash Satna-</div>
        </div>
      
        <div class="signature-block">
            <div class="signature-name">Sabahat</div>
            <div class="signature-name">Kazi</div>
            <div class="digitally-signed">Digitally signed by Sabahat Kazi</div>
            <div class="signature-date">Date: 2024.02.04</div>
            <div class="signature-date">17:06:09 +05'30'</div>
            <div class="signature-date">Signature and Date</div>
        </div>
        </div>
    </div>
      </div>
      <div class="header-wrapper">
  <div class="company-info">
    <p><strong>Head Office</strong><br>
    6th Floor, Technocity, X-5/3, Mahape,<br>
    Navi Mumbai 400 710, India</p>
  </div>

  <div class="company-name">
    <p><strong>Intellect Bizware Services Private Limited</strong></p>
    <p>U72300MH2009PTC192567</p>
  </div>

  <div class="contact-info">
    <p><strong>P</strong> +91 22 62684800<br>
    <strong>E</strong> corporate@intellectbizware.com<br>
    <strong>W</strong> www.intellectbizware.com</p>
  </div>
</div>

  </body>
  
  </html>
  
   `;

    const newWindow = window.open('', '', 'height=600,width=800');
    if (newWindow) {
      newWindow.document.write(invoiceHTML);
      newWindow.document.close();

      setTimeout(() => {
        newWindow.print();
      }, 500);
    }
  };

  FinalTax_21_29_03_2025(invoiceItem: InvoiceItem) {

    // this.leftlogo = this.imageService.sharvileftlogo();
    // this.logoUrl = this.imageService.getBase64FlightWorldmapLogo();
    // this.logoUrl = this.imageService.getBase64FlightNewLogo();
    // this.InvoiceLogo = this.imageService.getBase64FlightNewLogo();
    this.rightLogo = this.imageService.sharviQRCODE();
    // this.signature = this.imageService.getBase64Signature();

    if (invoiceItem.header.companyImageUpload) {
      let base64 = invoiceItem.header.companyImageUpload.trim();

      // Remove "data:image/...;base64," part if present
      const commaIndex = base64.indexOf(",");
      if (commaIndex !== -1) {
        base64 = base64.substring(commaIndex + 1);
      }

      // Now detect file type correctly
      if (base64.startsWith('/9j/')) {
        this.leftlogo = `data:image/jpeg;base64,${base64}`;
      } else if (base64.startsWith('iVBOR')) {
        this.leftlogo = `data:image/png;base64,${base64}`;
      } else if (base64.startsWith('JVBER')) {
        this.leftlogo = `data:application/pdf;base64,${base64}`;
      } else {
        this.leftlogo = this.imageService.sharvileftlogo();
      }
    } else {
      this.leftlogo = this.imageService.sharvileftlogo();
    }

    if (invoiceItem.DSC_UploadFile) {
      const base64 = invoiceItem.DSC_UploadFile.trim();

      // Detect file type dynamically
      if (base64.startsWith('/9j/')) {
        this.signature = `data:image/jpeg;base64,${base64}`;
      } else if (base64.startsWith('iVBOR')) {
        this.signature = `data:image/png;base64,${base64}`;
      } else if (base64.startsWith('JVBER')) {
        this.signature = `data:application/pdf;base64,${base64}`;
      } else {
        this.signature = ''; // fallback if unknown type
      }
    } else {
      this.signature = '';
    }
    // this.background1 = this.imageService.SharviBackgroundLightBlue();
    // this.background2 = this.imageService.SharviBackgroundLight();
    const placeOfSupply = invoiceItem.header.customerplaceOfSupply;
    // Example: "KARNATAKA - 29"

    let stateCode = '';
    if (placeOfSupply && placeOfSupply.includes('-')) {
      // Split by '-' and trim
      stateCode = placeOfSupply.split('-')[1].trim(); // "29"
    }
    const invoiceHTML = `
 
<html>
<head>
   
    <style>
     .invoice-container {
margin: 0px;
padding: 3px;
border: 1px solid #ccc;
font-family: Arial, sans-serif;
}
 body {
            font-family: Arial, sans-serif;
            margin: 0px;
            padding: 0px;
            background-color: white;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
         
          }
     
        .invoice-container {
          width: 100%;
          margin: auto;
          border: 1px solid #ddd;
          padding: 10px;
         
          box-sizing: border-box;
      }
 
      .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
      }
.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Distributes space evenly */
}
 
.header-section .logo {
  display: flex;
  flex-direction: column;
  align-items: center; /* Center content vertically */
}
 
.header-section .left-logo {
  text-align: left; /* Align text to the left */
}
 
.header-section .right-logo {
  text-align: right; /* Align text to the right */
}
 
.header-section .company-name {
  text-align: center; /* Center the company name */
  flex-grow: 1; /* Allow the company name to take up available space */
}
 
.header-section img {
   max-width: 195px; /* Adjust as needed */
  height: 130px !important;
}
 .booking-details {
    border: 1px solid #ccc;
    width: 100%;
  }
 
  .booking-header {
    background-color: rgb(91, 85, 130);
    padding: 5px;
    color:white;
      text-align: center;
    border-bottom: 1px solid #ccc;
  }
 
  .booking-data {
        padding: 5px;
  width: 100%;
  display: flex;
  font-size: 14px;
  }
 
  .data-item {
    display: inline-block;
    padding-right: 10px;
    border-right: 1px solid #ccc;
  }
 
  .data-item:last-child {
    border-right: none;
    padding-right: 0;
  }
   .text-center{
     text-align: right;
    }
  .orange-background {
 

    font-size: 15px;
    color:white;
    padding: 8px;
    text-align: center;
    font-weight: bold;
  }
 
  .table-bordered {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 10px;
    // background-color:rgb(193, 205, 217); /* Added background color */
  }
   .table-bordered th {
      border: 1px solid white;
  padding: 2px;
  background: rgb(143 152 192) !important;
  color: white;
  }
 
  .table-bordered td {
  padding: 2px;
  }
  .booking-header bold{
  font-size: 13px;
  background-color: rgb(91, 85, 130);
  color: white;
  }
 
 
 
     
  .bold {
    font-weight: bold;
   
   
 
  }
    .backgrd{
        background-image: url('${this.background2}') !important;
        background-size: 65%!important;
        background-position: center !important;
        background-repeat: no-repeat !important;
       
        }
  .text-right {
    text-align: right;
  }
  .text-center {
    text-align: center;
  }
 .footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-top: 10px;
      }
 
      .footer .logo {
          width: 50%;
      }
 
      .footer .logo img {
          width: 100%;
          height: auto;
      }
   
 
 
 
 
@media print {
  .invoice-container {
margin: 0px;
padding: 6px;
border: 1px solid #ccc;
font-family: Arial, sans-serif;
}
 body {
            font-family: Arial, sans-serif;
            margin: 2px;
            padding: 2px;
            background-color: white;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            
         
          }
            .InvoiceHeader {
                background-color: rgb(91, 85, 130);
                font-size: 14px;
                color:black;
                padding: 5px;
                text-align: center;
                font-weight: 700;
               
           }
                body {
    transform: scale(0.92); /* or 0.9 if needed */
    transform-origin: top left;
  }
     
        .invoice-container {
          width: 100%;
          margin: auto;
          border: 1px solid #ddd;
          padding: 8px;
          box-sizing: border-box;
             
      }
           .invoice-container {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    overflow: hidden !important;
    max-height: 100vh !important;
  }
        .second-page{
        width: 100%;
          margin: auto;
           
          border: 1px solid #ddd;
          padding: 6px;
          background: #fff;
          box-sizing: border-box;
        }
     
    @page {
        size: A4;
        margin: 13mm;
    }
 
    .second-page {
        width: 100%;
        height: 100vh;
        position: relative;
        overflow: hidden;
        page-break-inside: avoid;
    }
 
    .backgrd {
        background-size: 65%;
        background-position: center;
        background-repeat: no-repeat;
        padding-top: 30px;
        width: 100%;
        page-break-inside: avoid;
    }
 
    .terms {
        font-size: 14px;
        line-height: 1.5;
       
        overflow: hidden;
        page-break-inside: avoid;
        margin-top: 10px;
        padding: 0 5px;
    }
 
    .NotAllow, .Allowed {
        page-break-inside: avoid;
        font-size: 12px;
        line-height: 1.2;
        padding:6px;
        display: flex;
        flex-wrap: wrap;
    }
 
    .NotAllow img, .Allowed img {
        width: 60px;
        height: 40px;
    }
 
    .NotAllow div, .Allowed div {
        width: 20%;
        text-align: center;
    }
 
    /* Scale content to fit */
    body {
        transform: scale(1);
        transform-origin: top left;
    }
 
 
 
      .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
      }
.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Distributes space evenly */
}
 
.header-section .logo {
  display: flex;
  flex-direction: column;
  align-items: center; /* Center content vertically */
}
 
.header-section .left-logo {
  text-align: left; /* Align text to the left */
}
 
.header-section .right-logo {
  text-align: right; /* Align text to the right */
}
 
.header-section .company-name {
  text-align: center; /* Center the company name */
  flex-grow: 1; /* Allow the company name to take up available space */
}
 
.header-section img {
    max-width: 200px; /* Adjust as needed */
  height: 130px !important;
}
 .booking-details {
    border: 1px solid #ccc;
    width: 100%;
  }
 
  .booking-header {
    background-color: rgb(88, 98, 145);
    padding: 8px;
    color:white;
      text-align: center;
    border-bottom: 1px solid #ccc;
  }
 
  .booking-data {
        padding: 7px;
  width: 100%;
  display: flex;
  font-size: 12px;
  }
 
 
  .data-item {
    display: inline-block;
    padding-right: 8px;
    border-right: 1px solid #ccc;
  }
 
 
  .data-item:last-child {
    border-right: none;
    padding-right: 0;
  }
   .text-center{
     text-align: right;
    }
  .orange-background {
 
    font-size: 20px;
    color:black;
    padding: 7px;
    text-align: center;
    font-weight: bold;
  }
 .table-bordered {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 14px;
    // background-color:rgb(193, 205, 217); /* Added background color */
  }
   .table-bordered th {
      border: 1px solid white;
  padding: 4px;
  background: rgb(143 152 192) !important;
  color: white;
  }
 
  .table-bordered td {
  padding: 4px;
   
  }
  .booking-header bold{
 
 background-color: rgb(88, 98, 145);
  color: white;
  margin-bottom:10px;
  }
   .backgrd{
        background-image: url('${this.background2}') !important;
        background-size: 80%!important;
        background-position: center !important;
        background-repeat: no-repeat !important;
        padding-top:10px ;
        }
  .terms{
         margin-bottom:10px;
        font-size: 14x;
       
        }
 
 
     
  .bold {
    font-weight: 500;
  }
  .text-right {
    text-align: right;
  }
  .text-center {
    text-align: center;
  }
 .note p {
    margin: 0;
    display: inline-block;
    font-size:14px;
}
 
 
 
   
 .footer {
          display: flex;
          text-align:right;
          width: 100%;
          
      }
         
   
      .footer .logo {
          width: 50%;
      }
 
      .footer .logo img {
          width: 60%;
          height: auto;
      }
           a {
      font-weight: normal !important;
      color: blue !important;
      text-decoration: none !important;
    }
      .print-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    font-size: 13px;
    text-align: center;
    padding: 0;
    background: white; /* Optional: Helps if there's a colored background */
  }
   
      
}
 
</style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header Section -->
       
<div class="header-section" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
    <div class="logo left-logo">
        <img src="${this.leftlogo}" alt="Invoice Logo" style="height: 170px; width: 150px;">
    </div>
    <div class="right-text" style="font-weight: 600; text-transform: uppercase; text-align: center; flex-grow: 1;">
<div style="margin: 0; color: #2a2a2a;">
  <strong style="font-size: 25px; font-family: 'Calibri';">
      ${invoiceItem.header.ProformaCompanyName}
  </strong><br>
  <span style="font-size: 13px;">
   ${invoiceItem.header.detailsCardAddress},${invoiceItem.header.companyState}
  </span>
</div>
    </div>
     <div class="logo left-logo">
        <img src="${this.rightLogo}" alt="Invoice Logo" style="height: 130px; width: 150px; padding-top:10px;">
    </div>
</div>

 
     
      <div class ="backgrd">
          <div class="orange-background">${invoiceItem.proformaCardHeaderName}</div>

    <div class="TO" style="display: flex; width: 100%;border-bottom: 1px solid #d6d6d685;">
  
 
  <!-- Second Section (Right) -->
  <div class="remittance-container" style="width: 50%; margin-top:10px; font-size:12px; border-right:2px solid white">
    <table class="remittance-table" style="border-collapse: collapse; width: 100%;">
              <tr><td colspan="2" style="background-color: rgb(88, 98, 145); color: white; padding: 5px;border-right: 1px solid white;">
            FROM
          </td>
          <tr>
  <td colspan="4" style="padding: 5px; vertical-align: top; font-size:14px;">
 ${invoiceItem.header.ProformaCompanyName}

  </td>
</tr>

     <td style="padding: 5px; vertical-align: top; font-size:14px;">${invoiceItem.header.detailsCardAddress},${invoiceItem.header.companyState}</td>

      <tr>
        <td style="padding: 6px; vertical-align: top; font-size:14px; margin-top:5px;"><strong>INVOICE NO</strong></td>
        <td style="padding: 5px; vertical-align: top; font-size:14px;">: ${invoiceItem.invoiceUniqueNumber}</td>
      </tr>
      <tr>
        <td style="padding: 5px; vertical-align: top;font-size:14px;"><strong>INVOICE DATE</strong></td>
        <td style="padding: 5px; vertical-align: top;font-size:14px;">: ${invoiceItem.header.ProformaInvoiceDate}</td>
      </tr>
      <tr>
        <td style="padding: 5px; vertical-align: top;font-size:14px;"><strong>GST NO</strong></td>
        <td style="padding: 5px; vertical-align: top;font-size:14px;">: ${invoiceItem.header.ProformaGstNumber}</td>
      </tr>
      <tr>
        <td style="padding:5px; vertical-align: top; font-size:14px;"><strong>PAN NO</strong></td>
        <td style="padding: 5px; vertical-align: top;font-size:14px;">: ${invoiceItem.header.ProformaPan}</td>
      </tr>
   
      
    </table>
  </div>
  <!-- First Section (Left) -->
  <div class="remittance-container" style="width: 50%; margin-top:10px; font-size:12px;">
    <table class="remittance-table" style="border-collapse: collapse; width: 100%;">
      <tr> <td colspan="2" style="background-color: rgb(88, 98, 145); color: white; padding: 5px;">
             TO
          </td></tr>
       <tr>
        <td style="padding: 5px; vertical-align: top; font-size:14px;">${invoiceItem.header.ProformaCustomerName}</td>
      </tr>
      <tr>
        <td style="padding: 5px; vertical-align: top; font-size:14px;">${invoiceItem.header.ProformaAddress},${invoiceItem.header.ProformaCity},
          ${invoiceItem.header.ProformaPincode} </td>
      </tr>
    
      <tr>
  <td style="padding: 3px; width: 40%;"><strong>State</strong></td>
  <td style="padding: 3px;">: ${invoiceItem.header.ProformaState}</td>
</tr>
       <tr>
  <td style="padding: 3px;"><strong>State Code</strong></td>
  <td style="padding: 3px;">: ${stateCode}</td>
</tr>
       <tr>
  <td style="padding: 3px;"><strong>Place of Supply</strong></td>
  <td style="padding: 3px;">: ${invoiceItem.header.customerplaceOfSupply}</td>
</tr>
      
        <tr>
  <td style="padding: 3px;"><strong>GST NO</strong></td>
  <td style="padding: 3px;">: ${invoiceItem.header.ProformaGstNo}</td>
</tr>
        <tr>
  <td style="padding: 3px;"><strong>PAN NO</strong></td>
  <td style="padding: 3px;">: ${invoiceItem.header.ProformaPanNO}</td>
</tr>
    </table>
  </div>
</div>
<div class="TO" style="display: flex; width: 100%;">
  <!-- PO NUMBER CARD (LEFT SIDE) -->
  <div class="remittance-container" style="width: 50%; margin-top:10px; font-size:12px;">
    <table class="remittance-table" style="border-collapse: collapse; width: 100%;">
      <tr>
        <td style="padding: 6px; vertical-align: top; font-size:14px;">
          <strong>PO NUMBER</strong>
        </td>
       <td style="padding: 6px; vertical-align: top; font-size:14px;">
  : ${invoiceItem.header.ProformaPoNumber}
</td>
      </tr>
    </table>
  </div>

  <!-- EMPTY RIGHT SIDE -->
  <div class="remittance-container" style="width: 50%; margin-top:10px; font-size:12px; border-left:2px solid white">
  </div>
</div>

      <table class="table-bordered" style="font-size: 16px; padding-top: 15px;">
            <thead>
              <tr>
                <th class="booking-header bold">S.NO</th>
                <th class="booking-header bold">DESCRIPATION</th>
                  <th class="booking-header bold">HSN/SAC</th>
                <th class="booking-header bold">QUANTITY</th>
                    <th class="booking-header bold">UOM</th>
                <th class="booking-header bold">RATE</th>
                <th class="booking-header bold">AMOUNT(INR)</th>
              </tr>
            </thead>
            <tbody>
           <tr>
            <td style="padding-top: 15px;">1</td>
            <td  style="font-weight:bold;  padding-top: 15px;">SERVICE|PRODUCT</td>
            <td class="text-right"></td>
          </tr>
              ${invoiceItem.serviceList.map((charge, index) => `
               <tr>
  <td class="text-center">${index + 1}</td>
  <td>${charge.description}</td>
  <td>${charge.HSN_SAC}</td>
  <td class="text-right">${charge.quantity ?? ''}</td>
   <td>${charge.UOM}</td>
  <td class="text-right">${charge.rate}</td>
  <td class="text-right">${charge.amount}</td>
</tr>
              `).join('')}
             
              <tr>
             <td></td>
                  <td></td>
              <td></td>
              <td></td>
              <td></td>
                <td  class="text-right bold" style="font-weight:bold;background: rgb(143 152 192) !important;color: white;border-right: 1px solid white;white-space: nowrap" >TAXABLE VALUE</td>
                <td class="text-right bold"  style="font-weight:bold;background: rgb(143 152 192) !important;color: white;">${invoiceItem.subtotal}</td>
              </tr>
              <tr>
            <td>2</td>
                  <td style="font-weight:bold; padding-top: 22px;">TAXES:</td>
                  <td></td>
                  <td></td>
            </tr>
 
              ${invoiceItem.taxList.map(tax => `
                <tr>
                
                  
                  <td></td>
                  <td >${tax.description}</td>
                  <td></td>
                  <td></td>
                  <td class="text-right" style="font-size:14px;">${tax.amount}</td>
                </tr>
              `).join('')}
 
              <tr>
             
              <td></td>
              <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                <td class="text-right bold"  style="font-weight:bold;background: rgb(143 152 192) !important;color: white;border-right: 1px solid white; white-space: nowrap"
                >INVOICE TOTAL</td>
                <td class="text-right bold" style="font-weight:bold;background: rgb(143 152 192) !important;color: white;">${invoiceItem.grandTotal ? invoiceItem.grandTotal.toFixed(0) : '0.00'}</td>
              </tr>
                <tr>
                  <td colspan="7" class="bold" style="padding-top:29px;"><b style="font-size:18px;">Amount In Words : </b> ${invoiceItem.amountInWords}</td>
               </tr>
            </tbody>
          </table>

      </div>
     <div class="TO" style="display: flex; width: 100%; border: 2px solid #ccc; box-sizing: border-box;">
  <!-- First Section (Left) -->
  <div class="remittance-container" style="width: 50%; font-size: 14px;">
    <table class="remittance-table" style="border-collapse: collapse; width: 100%;">
      <thead style="border-bottom: 2px solid #ccc;">
        <tr>
          <th style="height:29px;padding:6px">
            PAY TO 
          </th>
        </tr>
      </thead>
      <tbody >
         <tr>
        <td style="padding:5px"><strong>BANK NAME</strong></td>
        <td style="padding:5px">:${invoiceItem.header.ProformaBankName}</td>
      </tr>
         <tr>
        <td style="padding:5px"><strong>ACCOUNT NAME</strong></td>
      <td style="padding:5px">:Sharvi Infotech Pvt Ltd</td>
      </tr>
         <tr>
        <td style="padding:3px"><strong>ACCOUNT NUMBER</strong></td>
        <td style="padding:5px">:${invoiceItem.header.ProformaBankAccountNumber}</td>
      </tr>
      <tr>
        <td style="padding:5px"><strong>ACCOUNT TYPE</strong></td>
        <td style="padding:5px">:${invoiceItem.header.companyBankAccountType}</td>
      </tr>
       
        <tr>
        <td style="padding:5px"><strong>IFSC</strong></td>
        <td style="padding:5px">:${invoiceItem.header.ProformaIFSCcode}</td>
      </tr>
      </tbody>
    </table>
  </div>

  <!-- Second Section (Right) -->
  <div class="remittance-container" style="width: 50%; font-size: 14px;border-left: 2px solid #ccc;">
      <table class="remittance-table" style="border-collapse: collapse; width: 100%;">
        <thead style="border-bottom: 2px solid #ccc;">
          <tr>
            <th style="padding:5px">
              For Sharvi Infotech Private Limited
            </th>
          </tr>
        </thead>
        <tbody style="padding:5px; text-align:center;">
          <tr>
            <td>
              <img src="${this.signature}" alt="DSC Signature" width="200" height='150' style="margin-top:10px;">
            </td>
          </tr>
        </tbody>
      </table>
    </div>
</div>




        </div>
        
    </div>
    <div class="print-footer">
 
  <p>
    ${invoiceItem.header.ProformaAddress},
    ${invoiceItem.header.ProformaCity}, ${invoiceItem.header.companyState},
          ${invoiceItem.header.ProformaPincode}
          </p>
</div>
</body>
</html>
 
     `;

    const newWindow = window.open('', '', 'height=600,width=800');
    if (newWindow) {
      newWindow.document.write(invoiceHTML);
      newWindow.document.close();

      setTimeout(() => {
        newWindow.print();
      }, 500);
    }
  };





}


