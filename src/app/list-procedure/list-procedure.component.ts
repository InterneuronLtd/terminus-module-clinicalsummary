//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2022  Interneuron CIC

//This program is free software: you can redistribute it and/or modify
//it under the terms of the GNU General Public License as published by
//the Free Software Foundation, either version 3 of the License, or
//(at your option) any later version.

//This program is distributed in the hope that it will be useful,
//but WITHOUT ANY WARRANTY; without even the implied warranty of
//MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

//See the
//GNU General Public License for more details.

//You should have received a copy of the GNU General Public License
//along with this program.If not, see<http://www.gnu.org/licenses/>.
//END LICENSE BLOCK 
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';
import { ApirequestService } from '../services/apirequest.service';
import { NgxSpinnerService } from "ngx-spinner";
import {AddProcedureService } from '../add-procedure/add-procedure.service';
import { GlobalService } from '../services/global.service';
import { Person } from '../models/entities/core-person.model';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { HistoryViewerService } from '../history-viewer/history-viewer.service';
import { Procedure } from '../models/entities/procedure.model';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-list-procedure',
  templateUrl: './list-procedure.component.html',
  styleUrls: ['./list-procedure.component.css']
})
export class ListProcedureComponent implements OnInit {

  tempProcedure: Subscription = new Subscription();
  subscriptions: Subscription = new Subscription();

  dtOptions: DataTables.Settings = {};
  // dtTrigger: Subject<any> = new Subject();

  clinicalSummaryList: any;
  selectedClinicalSummaryView: string;
  saving: boolean = false;
  bsConfig: any;
  refreshingList: boolean;

  getProcedureListURI: string;
  deleteProcedureURI: string;

  procedureList: any = [];
  contextData: any;
  personId: any;
  procedureStatusList: any;
  procedure : Procedure;

  getProcedureStatusListURI: string = this.appService.carerecorduri + '/ClinicalSummary/GetClinicalSummaryStatuses/ProcedureStatus';

  @ViewChild(DataTableDirective)
  datatableElement: DataTableDirective;

  @Input() set personData(value: Person) {
    // console.log('++++++++',value);
    this.saving = false;
    this.personId = value.person_id;
    this.selectedClinicalSummaryView = "list clinical summary";
    this.refreshingList = false;
    this.bsConfig = {  dateInputFormat: 'DD/MM/YYYY', containerClass: 'theme-default', adaptivePosition: true };

    this.getProcedureListURI = this.appService.carerecorduri + '/ClinicalSummary/GetProcedures/';
    this.deleteProcedureURI = this.appService.carerecorduri + '/ClinicalSummary/DeleteProcedure/'
    this.initialiseFunctions();
  };

  constructor(private apiRequest: ApirequestService,
    public appService: AppService,
    private subjects: SubjectsService,
    public spinner: NgxSpinnerService,
    private addProcedureService: AddProcedureService,
    public globalService: GlobalService,
    public confirmationDialogService: ConfirmationDialogService,
    public historyViewerService: HistoryViewerService) {
      this.subjects.personIdChange.subscribe( () => {
        if(!this.appService.personId) {
        return;
        }
      })
     }

  ngOnInit(): void {

    this.dtOptions = {
      paging: false,
      searching: true,
      dom: "-s"
    };

    // this.dtTrigger.next();

    this.globalService.contextChange.subscribe(value => {
      if(value)
      {
        this.contextData = value;
      }
    });

    this.tempProcedure = this.globalService.listProcedureChange.subscribe(value => {
      this.initialiseFunctions();

    });
  }

  async initialiseFunctions()
  {
    setTimeout(() => {
      this.getProcedureList();
    }, 1000);

    await this.getProcedureStatusList();
  }

  async  getProcedureStatusList() {
    await this.subscriptions.add(
     this.apiRequest.getRequest(this.getProcedureStatusListURI)
     .subscribe((response) => {
       this.procedureStatusList = JSON.parse(response);
     })
   )
  }

  async getProcedureList()
  {
    await this.subscriptions.add(
      this.apiRequest.getRequest(this.getProcedureListURI+this.personId)
      .subscribe((response) => {
        this.procedureList = JSON.parse(response);
        
        this.refreshingList = false;
      })
    )
  }

  async addProcedure()
  {
    var response = false;
    await this.addProcedureService.confirm('','Add Procedure','','Import')
    .then((confirmed) => response = confirmed)
    .catch(() => response = false);
    if(!response) {
      return;
    }
    else {
     // await this.getSelectedFormWithContext();
    }
  }

  async editProcedure(procedureId)
  {
    // console.log('procedureId',procedureId);
    if(procedureId)
    {
      var response = false;
      await this.addProcedureService.confirm(procedureId,'Edit Procedure','','Import')
      .then((confirmed) => response = confirmed)
      .catch(() => response = false);
      if(!response) {
        return;
      }
      else {
      // await this.getSelectedFormWithContext();
      }
    }
  }

  // async deleteProcedure(procedureId)
  // {
  //   if(procedureId)
  //   {
  //     var displayConfirmation = this.appService.displayWarnings;
  //     if(displayConfirmation) {
  //       var response = false;
  //       await this.confirmationDialogService.confirm('Please confirm', 'Do you want to delete procedure?')
  //       .then((confirmed) => response = confirmed)
  //       .catch(() => response = false);
  //       if(!response) {
  //       }
  //       else{
  //         this.subscriptions.add(
  //           this.apiRequest.deleteRequest(this.deleteProcedureURI+procedureId)
  //           .subscribe((response) => {

  //             this.toasterService.showToaster('delete','Procedure deleted successfully.');
  //           })
  //         )
  //         this.globalService.listProcedureChange.next(null);
  //       }
  //     }

  //   }
  // }

  async viewHistory(procedureId) {
    var response = false;
    await this.historyViewerService.confirm(procedureId, 'Procedure History','','Import')
    .then((confirmed) => response = confirmed)
    .catch(() => response = false);
    if(!response) {
      return;
    }
    else {
     // await this.getSelectedFormWithContext();
    }
  }

  selectChange(e,coloumn)
  {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
         dtInstance.column(coloumn).search(e.target.value).draw();
    });
  }

  ngOnDestroy(): void {
    // this.dtTrigger.unsubscribe();
    this.subscriptions.unsubscribe();
    if(!!this.tempProcedure) {
      this.tempProcedure.unsubscribe();
    }
  }

}
