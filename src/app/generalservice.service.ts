import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class GeneralserviceService {
  getProductList: any;

  deleteProduct(productId: any) {
    throw new Error('Method not implemented.');
  }

  searchTerm: string = '';
  allInvoices: any[] = []; // Store all invoices
  page: number = 1;
  pageSize: number = 10; // Adjust as needed
  data: any;

  resetPasswordData(): any {
    throw new Error('Method not implemented.');
  }

  setLoginDataList: any;
  userList: any;
  loginResponse: any;
  setTableData: any;



  constructor(private http: HttpClient) { }

  setLoginResponse(data) {
    this.loginResponse = data;
  }

  getLoginResponse() {
    return this.loginResponse;
  }
  // getAllInvoice(obj){
  //   return this.http.post(environment.baseUrl+'invoice/getAllInvoices',obj);
  // }
  getAllInvoice() {
    return this.http.get(environment.baseUrl + 'invoice/getAllInvoices');
  }
  CreateInvoice(obj) {
    return this.http.post(environment.baseUrl + 'invoice/createNewInvoice', obj);
  }

  UpdateInvoice(obj, invoiceRefNo) {
    return this.http.put(environment.baseUrl + 'updateInvoiceByReferenceNo/' + invoiceRefNo, obj);
  }
  getstateList() {
    return this.http.get(environment.baseUrl + 'invoice/stateList');
  }

  invoiceTemplate(obj) {
    return this.http.post(environment.baseUrl + 'invoice/invoiceTemplate', obj);

  }
  userNewCreation(obj) {
    return this.http.post(environment.baseUrl + 'invoice/userNewCreation', obj);

  }
  getAllUserList() {
    return this.http.get(environment.baseUrl + 'invoice/getAllUserList');
  }

  submitLogin(obj) {
    return this.http.post(environment.baseUrl + 'invoice/authenticationLogin', obj);
  }
  updateExitUser(obj, userUniqueId) {
    return this.http.put(environment.baseUrl + 'invoice/updateExitUser/' + userUniqueId, obj);
  }
  invoiceApprovedOrRejected(obj) {
    return this.http.post(environment.baseUrl + 'invoice/invoiceApprovedOrRejected', obj);
  }
  forgotPassword(obj) {
    return this.http.post(environment.baseUrl + 'invoice/forgotPassword', obj);
  }
  getAllCustomerList() {
    return this.http.get(environment.baseUrl + 'invoice/getAllCustomerList');
  }
  savecustomerCreation(obj) {
    return this.http.post(environment.baseUrl + 'invoice/SaveCustomerCreation', obj);

  }
  updateExitCustomer(obj, customerUniqueId) {
    return this.http.put(environment.baseUrl + 'invoice/updateExitCustomer/' + customerUniqueId, obj);

  }
  reviewedUpadte(obj) {
    return this.http.post(environment.baseUrl + 'invoice/reviewedUpadte', obj);

  }
  SaveCharges(data) {
    return this.http.post(environment.baseUrl + 'invoice/SaveCharges', data)

  }
  UpdateCharges(data) {
    return this.http.post(environment.baseUrl + 'invoice/UpdateCharges', data)

  }
  getAllCharges() {
    return this.http.get(environment.baseUrl + 'invoice/getAllCharges');


  }
  resetpassword(obj) {
    return this.http.post(environment.baseUrl + 'invoice/resetPassword', obj);

  }

  verifyedAndUpdated(obj) {
    return this.http.post(environment.baseUrl + 'invoice/verifyedAndUpdated', obj);

  }
  deteleGlobal(obj) {
    return this.http.post(environment.baseUrl + 'invoice/deteleGlobal', obj);

  }
  getAllCompanyList() {
    return this.http.get(environment.baseUrl + '/invoice/getAllCompanyList');
  }
  SaveCompanyCreation(obj) {
    return this.http.post(environment.baseUrl + 'invoice/SaveCompanyCreation', obj);

  }
  updateExitCompany(obj) {
    return this.http.post(environment.baseUrl + 'invoice/updateExitCompany', obj);

  }

  updateFromFundsScreen(obj) {
    return this.http.post(environment.baseUrl + 'invoice/updateFromFundsScreen', obj);

  }
  dscfileupload(obj) {
    return this.http.post(environment.baseUrl + 'invoice/DSC_FileUpload', obj);
  }
  SaveProductMaster(obj: any) {
    return this.http.post(environment.baseUrl + 'invoice/SaveProductMaster', obj);
  }

  updateExitProductMaster(obj: any) {
    return this.http.post(environment.baseUrl + 'invoice/updateExitProductMaster', obj);
  }


  getproductList() {
    return this.http.get(environment.baseUrl + '/invoice/Get_productMaterList');
  }

  SaveInventory(obj: any) {
    return this.http.post(environment.baseUrl + 'invoice/SaveInventory', obj);
  }

  updateExitInventory(obj: any) {
    return this.http.post(environment.baseUrl + 'invoice/updateExitInventory', obj);
  }
  getInventoryList() {
    return this.http.get(environment.baseUrl + '/invoice/Get_InventoryList');
  }
  SaveGateEntry(obj: any) {
    return this.http.post(environment.baseUrl + '/invoice/SaveGateEntry', obj);
  }
  updategateentry(obj: any) {
    return this.http.post(environment.baseUrl + '/invoice/updategateentry', obj);
  }
  fetchgateentry(obj: any) {
    return this.http.post(environment.baseUrl + '/invoice/FetchGetEntryData', obj);
  }

}
