//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2023  Interneuron Holdings Ltd

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
import { Component, Input, OnInit, ViewChild} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';
import { ApirequestService } from '../services/apirequest.service';
import { NgxSpinnerService } from "ngx-spinner";
import { GlobalService } from '../services/global.service';
import { Person } from '../models/entities/core-person.model';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { AddDiagnosisService } from '../add-diagnosis/add-diagnosis.service';
import { DiagnosisHistoryViewerService } from '../diagnosis-history-viewer/diagnosis-history-viewer.service';
import { DataTableDirective } from 'angular-datatables';
import { MessageService } from "primeng/api";

@Component({
  selector: 'app-list-diagnosis',
  templateUrl: './list-diagnosis.component.html',
  styleUrls: ['./list-diagnosis.component.css'],
  providers: [MessageService]
})
export class ListDiagnosisComponent implements OnInit {

  subscriptions: Subscription = new Subscription();
  tempDiagnosis: Subscription = new Subscription();
  listDiagnosisUpdate: Subscription = new Subscription();

  dtOptions: DataTables.Settings = {};
  // dtTrigger: Subject<any> = new Subject();  

  clinicalSummaryList: any;
  selectedClinicalSummaryView: string;
  saving: boolean = false;
  bsConfig: any;
  refreshingList: boolean;

  getDiagnosisListURI: string;
  deleteDiagnosisURI: string;

  diagnosisList: any = [];
  contextData: any;
  personId: string;
  clinicalStatusList: any;

  getClinicalStatusListURI: string = this.appService.carerecorduri + '/ClinicalSummary/GetClinicalSummaryStatuses/ClinicalStatus';

  @ViewChild(DataTableDirective)
  datatableElement: DataTableDirective;

  @Input() set personData(value: Person) {
    this.saving = false;
    this.personId = value.person_id;
    this.selectedClinicalSummaryView = "list clinical summary";
    this.refreshingList = false;
    this.bsConfig = {  dateInputFormat: 'DD/MM/YYYY', containerClass: 'theme-default', adaptivePosition: true };

    this.getDiagnosisListURI = this.appService.carerecorduri + '/ClinicalSummary/GetDiagnoses/';
    this.deleteDiagnosisURI = this.appService.carerecorduri + '/ClinicalSummary/DeleteDiagnosis/'
    this.initialiseFunctions();
  };

  constructor(private apiRequest: ApirequestService,
    public appService: AppService, 
    private subjects: SubjectsService,
    public spinner: NgxSpinnerService,
    private addDiagnosisService: AddDiagnosisService,
    public globalService: GlobalService,
    public confirmationDialogService: ConfirmationDialogService,
    public diagnosisHistoryViewerService: DiagnosisHistoryViewerService) {
      this.subjects.personIdChange.subscribe( () => {
        if(!this.appService.personId) {
        return;
        }
      })

      this.subjects.encounterChange.subscribe( () => {
        if(!this.appService.encounterId) {
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

    this.globalService.contextChange.subscribe(value => {
      if(value)
      {
        this.contextData = value;
      }
    });

    this.tempDiagnosis = this.globalService.listDiagnosisChange.subscribe(value => {
      this.initialiseFunctions();
      
    });

  }

  async initialiseFunctions()
  {
    await this.getClinicalStatusList();
    setTimeout(() => {
      this.getDiagnosisList();
    }, 1000);
    
  }

  async  getClinicalStatusList() {
    await this.subscriptions.add(
     this.apiRequest.getRequest(this.getClinicalStatusListURI)
     .subscribe((response) => {
       this.clinicalStatusList = JSON.parse(response);
     })
   )
  }

  async getDiagnosisList()
  {
    await this.subscriptions.add(
      this.apiRequest.getRequest(this.getDiagnosisListURI+this.personId)
      .subscribe((response) => {
        if(response.length > 0)
        {
          this.diagnosisList = JSON.parse(response);

          this.refreshingList = false;
        }
        
      })
    )
  }

  async addDiagnosis()
  {
    var response = false;
    await this.addDiagnosisService.confirm('','Add Diagnosis','','Import')
    .then((confirmed) => response = confirmed)
    .catch(() => response = false);
    if(!response) {
      return;
    }
    else {
     // await this.getSelectedFormWithContext();
    }
  }

  async editDiagnosis(diagnosisId)
  {
    if(diagnosisId)
    {
      var response = false;
      await this.addDiagnosisService.confirm(diagnosisId,'Edit Diagnosis','','Import')
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

  filter(event)
  {
    console.log(event.target.value);
  }

  // async deleteDiagnosis(diagnosisId)
  // {
  //   if(diagnosisId)
  //   {
  //     var displayConfirmation = this.appService.displayWarnings;
  //     if(displayConfirmation) {
  //       var response = false;
  //       await this.confirmationDialogService.confirm('Please confirm', 'Do you want to delete diagnosis?')
  //       .then((confirmed) => response = confirmed)
  //       .catch(() => response = false);
  //       if(!response) {
  //       }
  //       else{
  //         this.subscriptions.add(
  //           this.apiRequest.deleteRequest(this.deleteDiagnosisURI+diagnosisId)
  //           .subscribe((response) => {
              
  //             this.toasterService.showToaster('delete','Diagnosis deleted successfully.');
  //           })
  //         )
  //         this.globalService.listDiagnosisChange.next(null);
  //       }
  //     }
      
  //   }
  // }

  async viewHistory(diagnosisId) {
    console.log('diagnosisId',diagnosisId);
    var response = false;
    await this.diagnosisHistoryViewerService.confirm(diagnosisId, 'Diagnosis History','','Import')
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
    if(!!this.tempDiagnosis) {
      this.tempDiagnosis.unsubscribe();
    }
  }    

}
