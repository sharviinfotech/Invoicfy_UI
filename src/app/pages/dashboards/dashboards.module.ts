import { NgModule } from '@angular/core';
import { DashboardsRoutingModule } from './dashboards-routing.module';
import { BsDropdownConfig} from 'ngx-bootstrap/dropdown';
import { SampleComponentComponent } from './default/sample-component/sample-component.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { InvoiceLayoutComponent } from './invoice-layout/invoice-layout.component';
import { InvoiceReportsComponent } from './invoice-reports/invoice-reports.component';
import { InvoiceUserCreationComponent } from './invoice-user-creation/invoice-user-creation.component';
import { CommonModule } from '@angular/common'; 
import { ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ReviewNotificationComponent } from './review-notification/review-notification.component';
import { DashboardBackupComponent } from './dashboard-backup/dashboard-backup.component';
import { DefaultComponent } from './default/default.component';
import { InvoicefyGlobalDashboardComponent } from './invoicefy-global-dashboard/invoicefy-global-dashboard.component';
import { ProductManagementComponent } from './product-management/product-management.component';
import { InventoryManagementComponent } from './inventory-management/inventory-management.component';
import { StockEntryComponent } from './stock-entry/stock-entry.component';
import { GateEntryComponent } from './gate-entry/gate-entry.component';
import { EquipmentMasterComponent } from './equipment-master/equipment-master.component';
import { EquipmenttaskListComponent } from './equipmenttask-list/equipmenttask-list.component';
import { WorkorderComponent } from './workorder/workorder.component';
import { SalesEnquireyComponent } from './sales-enquirey/sales-enquirey.component';
import { SalesQuotationComponent } from './sales-quotation/sales-quotation.component';

// import { GlobalReviewEditComponent } from './global-review-edit/global-review-edit.component';

@NgModule({
  declarations: [
    SampleComponentComponent,
    EquipmentMasterComponent,
    EquipmenttaskListComponent,
    WorkorderComponent,
    SalesEnquireyComponent,
    SalesQuotationComponent,
    // ProductManagementComponent,
    // InventoryManagementComponent,
    // StockEntryComponent,
    // GateEntryComponent,
    // InvoicefyGlobalDashboardComponent,
    // DashboardBackupComponent,
    // ReviewNotificationComponent,
    // GlobalReviewEditComponent,
    // InvoiceUserCreationComponent,
    // InvoiceReportsComponent,
    // InvoiceComponent,
    // InvoiceLayoutComponent
  ],
  imports: [
    DashboardsRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),  // Ensure it's in the imports array
    NgxSpinnerModule,
    DefaultComponent

  ],
  providers: [BsDropdownConfig],
})
export class DashboardsModule { }
