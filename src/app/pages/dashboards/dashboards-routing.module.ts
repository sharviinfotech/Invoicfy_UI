import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DefaultComponent } from './default/default.component';
import { SaasComponent } from './saas/saas.component';
import { CryptoComponent } from './crypto/crypto.component';
import { BlogComponent } from './blog/blog.component';
import { JobsComponent } from "./jobs/jobs.component";
import { SampleComponentComponent } from './default/sample-component/sample-component.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { InvoiceLayoutComponent } from './invoice-layout/invoice-layout.component';
import { InvoiceReportsComponent } from './invoice-reports/invoice-reports.component';
import { InvoiceUserCreationComponent } from './invoice-user-creation/invoice-user-creation.component';
import { InvoiceDecisionComponent } from './invoice-decision/invoice-decision.component';
import { CustomerCreationComponent } from './customer-creation/customer-creation.component';
import { ServiceChargesComponent } from './service-charges/service-charges.component';
import { GlobalReviewEditComponent } from './global-review-edit/global-review-edit.component';
import { ReviewNotificationComponent } from './review-notification/review-notification.component';
import { CompanyCreationComponent } from './company-creation/company-creation.component';
import { FundsRecievedAgainstComponent } from './funds-recieved-against/funds-recieved-against.component';
import { InvoicefyGlobalDashboardComponent } from './invoicefy-global-dashboard/invoicefy-global-dashboard.component';
import { GateEntryComponent } from './gate-entry/gate-entry.component';
import { StockEntryComponent } from './stock-entry/stock-entry.component';
import { InventoryManagementComponent } from './inventory-management/inventory-management.component';
import { ProductManagementComponent } from './product-management/product-management.component';
import { EquipmentMasterComponent } from './equipment-master/equipment-master.component';
import { EquipmenttaskListComponent } from './equipmenttask-list/equipmenttask-list.component';
import { WorkorderComponent } from './workorder/workorder.component';
import { SalesEnquireyComponent } from './sales-enquirey/sales-enquirey.component';
import { SalesQuotationComponent } from './sales-quotation/sales-quotation.component';
import { TotalstockinventorylistComponent } from './totalstockinventorylist/totalstockinventorylist.component';


const routes: Routes = [
    {
        path: 'default',
        component: InvoicefyGlobalDashboardComponent
    },
    {
        path: 'sampleComponent',
        component: SampleComponentComponent
    },
    {
        path: 'Invoice',
        component: InvoiceComponent
    },
    {
        path: 'InvoiceLayout',
        component: InvoiceLayoutComponent
    },
    {
        path: 'InvoiceReports',
        component: InvoiceReportsComponent
    },
    {
        path: 'InvoiceUserCreation',
        component: InvoiceUserCreationComponent
    },
    {
        path: 'InvoiceDecision',
        component: InvoiceDecisionComponent
    },
    {
        path: 'CustomerCreation',
        component: CustomerCreationComponent
    },
    {
        path: 'ServiceCharges',
        component: ServiceChargesComponent
    },
    {
        path: 'ProductMaster',
        component: ProductManagementComponent
    },
    {
        path: 'inventoryManagement',
        component: InventoryManagementComponent
    },
    {
        path: 'StockEntry',
        component: StockEntryComponent
    },
    {
        path: 'Gateentry',
        component: GateEntryComponent
    },
    {
        path: 'equipmentMaster',
        component: EquipmentMasterComponent
    },
    {
        path: 'equipmenttaskList',
        component: EquipmenttaskListComponent
    },
    {
        path: 'workorder',
        component: WorkorderComponent
    },
    {
        path: 'salesenquirey',
        component: SalesEnquireyComponent
    },
    {
        path: 'SalesQuotation',
        component: SalesQuotationComponent
    },
    {
        path: 'globalReviewEdit',
        component: GlobalReviewEditComponent
    },
    {
        path: 'ReviewNotification',
        component: ReviewNotificationComponent
    },
    {
        path: 'CompanyCreation',
        component: CompanyCreationComponent
    },
    {
        path: 'funds_recived_against',
        component: FundsRecievedAgainstComponent
    },
    {
        path: 'total_Stock_Inventory',
        component: TotalstockinventorylistComponent
    },
    // {
    //     path: 'saas',
    //     component: SaasComponent
    // },
    // {
    //     path: 'crypto',
    //     component: CryptoComponent
    // },
    // {
    //     path: 'blog',
    //     component: BlogComponent
    // },
    // {
    //     path:"jobs",
    //     component:JobsComponent
    // }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashboardsRoutingModule { }
