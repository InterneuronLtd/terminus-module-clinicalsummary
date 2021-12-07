//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2021  Interneuron CIC

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
import { Component, Input, OnInit, Output, ViewChild, EventEmitter, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { SNOMED } from '../models/snomed.model';
import { TerminologyConcept } from '../models/terminology-concept.model';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Person } from '../models/entities/core-person.model';
import { AutoComplete } from 'primeng/autocomplete';
import { Diagnosis } from '../models/entities/diagnosis.model';
import { Guid } from 'guid-typescript';
import { GlobalService } from '../services/global.service';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { CoreDiagnosis } from '../models/entities/core-diagnosis.model';
import { ToasterService } from '../services/toaster-service.service';
import { SubjectsService } from '../services/subjects.service';

@Component({
  selector: 'app-add-diagnosis',
  templateUrl: './add-diagnosis.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./add-diagnosis.component.css']
})
export class AddDiagnosisComponent implements OnInit {

  @ViewChild('autocomplete') ac: AutoComplete;

  clinicalsummary_id: string;
  diagnosis: Diagnosis;
  clinicalSummaryDiagnosis: CoreDiagnosis[] = [];

  clinicalStatusList: any;
  verificationStatusList: any;

  showDiagnosisForm:boolean = false;
  // personId: string;
  test: SNOMED;

  //Date Picker Models
  model: any;
  bsConfig: any;
  maxDateValue: Date = new Date();

  // Terminology
  results: SNOMED[] = [];
  resultsReactions: SNOMED[] = [];

  opDiagnoses: SNOMED[] = [];
  diagnosisName: string;

  otherConcept: TerminologyConcept = {
      concept_id: 9177,
      conceptcode: "74964007",
      conceptname: "Non-coded"
  }

  showDateEffectivePeriod: boolean = false;
  showDatePicker: boolean = false;

  subscriptions: Subscription = new Subscription();

  @Input() title: string;
  @Input() message: string;
  @Input() btnOkText: string;
  @Input() btnCancelText: string;
  @Input() diagnosisId: string;

  getClinicalStatusListURI: string = this.appService.carerecorduri + '/ClinicalSummary/GetClinicalSummaryStatuses/ClinicalStatus';
  getVerificationStatusListURI: string = this.appService.carerecorduri + '/ClinicalSummary/GetClinicalSummaryStatuses/VerificationStatus';
  postDiagnosisURI: string = this.appService.carerecorduri + "/ClinicalSummary/PostDiagnosis/";
  getDiagnosisByIdURI: string = this.appService.carerecorduri + "/ClinicalSummary/GetDiagnosisHistory/";

  constructor(private activeModal: NgbActiveModal,
    private apiRequest: ApirequestService, 
    public appService: AppService, 
    public globalService: GlobalService,
    private confirmationDialogService: ConfirmationDialogService, 
    private toasterService: ToasterService,
    private subjects: SubjectsService ) { 

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

      this.globalService.clnicalSummaryChange.subscribe(value => {
        if(value)
        {
          this.appService.clinicalsummaryId = value;
        } 
      });

      this.diagnosis = {} as Diagnosis;

      this.diagnosis.diagnosis_id = String(Guid.create());
      this.diagnosis.person_id = this.appService.personId;
      this.diagnosis.encounter_id = this.appService.encounterId;

      this.diagnosis.clinicalstatus = "";

      this.diagnosis.onsetdate = this.globalService.getDate();

      this.diagnosis.verificationstatus = "";

      this.diagnosis.reportedby = this.appService.currentPersonName;

      this.diagnosis.resolveddate = this.globalService.getDate();
      this.diagnosis.diagnosiscode = null;
      this.diagnosis.diagnosistext = "";
      this.diagnosis.enddate = null;
      this.diagnosis.statuscode = null;
      this.diagnosis.statustext = null;
      this.diagnosis.isdateapproximate = 'No';
      this.diagnosis.dateeffectiveperiod = null;

      this.diagnosis._createdby = this.appService.loggedInUserName;
      this.diagnosis._createddate = new Date(this.globalService.getDateTime());

    }

  ngOnInit(): void {
    // console.log('diagnosisId',this.diagnosisId);
    this.bsConfig = {  dateInputFormat: 'DD/MM/YYYY', containerClass: 'theme-default', adaptivePosition: true };
  
    if(this.diagnosisId)
    {
      this.showDiagnosisForm = true;

      this.subscriptions.add(
        this.apiRequest.getRequest(this.getDiagnosisByIdURI+this.diagnosisId)
        .subscribe((response) => {
          let data = JSON.parse(response);

          this.diagnosis = data.reverse();

          this.diagnosisName = data[0].diagnosistext;
          
          this.diagnosis.diagnosistext = '{"_term":"'+data[0].diagnosistext+'","_code":"'+data[0].diagnosiscode+'","bindingValue":"'+data[0].diagnosiscode+' | '+data[0].diagnosistext+'","fsn":"'+data[0].diagnosistext+' (disorder)","level":0,"parentCode":null}';
          this.diagnosis.diagnosistext = <SNOMED>JSON.parse(this.diagnosis.diagnosistext);
          this.diagnosis.onsetdate = new Date(data[0].onsetdate);
          this.diagnosis.verificationstatus = data[0].verificationstatus;
          this.diagnosis.clinicalstatus = data[0].clinicalstatus;
          this.diagnosis.resolveddate = new Date(data[0].resolveddate);
          this.diagnosis._createdby = this.appService.loggedInUserName;
          this.diagnosis._createddate = new Date(this.globalService.getDateTime());
          this.diagnosis.isdateapproximate = data[0].isdateapproximate;
          if(data[0].isdateapproximate == 'Yes')
          {
            this.showDateEffectivePeriod = true;
            this.showDatePicker = true;
            
            this.diagnosis.dateeffectiveperiod = data[0].dateeffectiveperiod;
            if(data[0].dateeffectiveperiod == 'Month')
            {
              this.bsConfig = {dateInputFormat: 'MMMM YYYY',containerClass: 'theme-default', adaptivePosition: true}
              this.diagnosis.effectivedatestring  = new Date(data[0].effectivedatestring);
            }
            else{
              this.bsConfig = {dateInputFormat: 'YYYY',containerClass: 'theme-default', adaptivePosition: true}
              this.diagnosis.effectivedatestring  = new Date(data[0].effectivedatestring);
            }
            
          }

        })
      )
    }
    this.initialiseData();
  }

  async initialiseData() {;
    await this.getClinicalStatusList();
    await this.getVerificationStatusList();
  }

  async  getClinicalStatusList() {
    await this.subscriptions.add(
     this.apiRequest.getRequest(this.getClinicalStatusListURI)
     .subscribe((response) => {
       this.clinicalStatusList = JSON.parse(response);
     })
   )
  }

  async  getVerificationStatusList() {
    await this.subscriptions.add(
     this.apiRequest.getRequest(this.getVerificationStatusListURI)
     .subscribe((response) => {
       this.verificationStatusList = JSON.parse(response);
     })
   )
  }

  public dismiss() {
    this.activeModal.dismiss();
  }

  search(event) {
    const result = /^(?=.*\S).+$/.test(event.query);
    if(result)
    {
      this.subscriptions.add(
        this.apiRequest.getRequest(this.appService.terminologyURI.replace("VALUE", event.query + "/disorder?api-version=1.0"))
            .subscribe((response) => {
              let resultsFromDb:SNOMED[] = [];
              response.data.forEach((item)=>{
                  let snomedData: SNOMED = new SNOMED();
                  snomedData.code = item.code;
                  snomedData.fsn = item.fsn;
                  snomedData.level = item.level;
                  snomedData.parentCode = item.parentCode;
                  snomedData.term = item.term;
                  resultsFromDb.push(snomedData);
              })
              if (resultsFromDb.length == 0) {
                  let concept: SNOMED = new SNOMED();
                  concept.code = this.otherConcept.conceptcode;
                  concept.term = event.query + ' (Other)';
  
                  resultsFromDb.push(concept);
              }
              this.results = resultsFromDb;
            })
      );
    }
    
}

selectedValue(diag: SNOMED) {

    if(diag) {
      this.showDiagnosisForm = true;
    }
    let addedProcs = [];

        if (diag.code == this.otherConcept.conceptcode) {
            addedProcs = this.clinicalSummaryDiagnosis.filter(x =>
                (x.diagnosistext.toLowerCase().replace(/ /g, '') == diag.term.toLowerCase().replace(/ /g, '')));
        }
        else {
            addedProcs = this.clinicalSummaryDiagnosis.filter(x => x.diagnosiscode == diag.code);
        }

        if (addedProcs.length == 0) {
            let diagnosis: CoreDiagnosis = new CoreDiagnosis();
            diagnosis.diagnosis_id = diag.code + '|' + this.clinicalsummary_id,
                diagnosis.operation_id = this.clinicalsummary_id,
                diagnosis.statuscode = 'Active',
                diagnosis.statustext = 'Active',
                diagnosis.diagnosiscode = diag.code,
                diagnosis.diagnosistext = diag.term

            this.clinicalSummaryDiagnosis.push(diagnosis);
        }
  }

  unSelectedValue(event) {
    // this.confirmationService.confirm({
    //     message: 'Are you sure that you want to delete this diagnosis?',
    //     accept: () => {
    //         for (var i = 0; i < this.clinicalSummaryDiagnosis.length; i++) {
    //             if (this.clinicalSummaryDiagnosis[i].diagnosistext === event.term) {
    //                 this.clinicalSummaryDiagnosis.splice(i, 1);
    //                 i--;
    //             }
    //         }
    //     },
    //     reject: () => {
    //         this.ac.selectItem(event);
    //     }
    // });
  }

  selectApproximateDate()
  {
    // console.log('callled', this.diagnosis.isdateapproximate);
    if(this.diagnosis.isdateapproximate == 'Yes')
    {
      this.showDateEffectivePeriod = true;
    }
    else{
      this.showDateEffectivePeriod = false;
      this.showDatePicker = false;
    }
  }

  selectEffectivePeriod()
  {
    if(this.diagnosis.dateeffectiveperiod == 'Month')
    {
      this.showDatePicker = true;
      this.bsConfig = {dateInputFormat: 'MMMM YYYY',containerClass: 'theme-default', adaptivePosition: true}
    }
    else{
      this.showDatePicker = true;
      this.bsConfig = {dateInputFormat: 'YYYY',containerClass: 'theme-default', adaptivePosition: true}
    }
  }

  onOpenCalendar(container) {
    if(this.diagnosis.dateeffectiveperiod == 'Month')
    {
      container.monthSelectHandler = (event: any): void => {
        container._store.dispatch(container._actions.select(event.date));
      };     
      container.setViewMode('month');
    }
    else{
      container.monthSelectHandler = (event: any): void => {
        container._store.dispatch(container._actions.select(event.date));
      };     
      container.setViewMode('year');
    }
   }

  async addDiagnosis()
  {

    let diagnosis = {
      diagnosis_id: String(Guid.create()),
      person_id: this.appService.personId,
      encounter_id: null,
      diagnosiscode: this.clinicalSummaryDiagnosis[0].diagnosiscode,
      diagnosistext: this.clinicalSummaryDiagnosis[0].diagnosistext,
      statuscode: "ACTIVE",
      statustext: "ACTIVE",
      onsetdate: this.appService.getDateTimeinISOFormat(this.diagnosis.onsetdate),
      clinicalstatus: this.diagnosis.clinicalstatus,
      verificationstatus: this.diagnosis.verificationstatus,
      resolveddate: this.appService.getDateTimeinISOFormat(this.diagnosis.resolveddate),
      clinicalsummary_id: null,
      isdateapproximate: this.diagnosis.isdateapproximate,
      dateeffectiveperiod: this.diagnosis.isdateapproximate == 'No'?'Actual':this.diagnosis.dateeffectiveperiod,
      effectivedatestring: this.diagnosis.isdateapproximate == 'No'?this.appService.getDateTimeinISOFormat(this.diagnosis.onsetdate):this.diagnosis.effectivedatestring
    }

    this.activeModal.dismiss();

    await this.subscriptions.add(
      this.apiRequest.postRequest(this.postDiagnosisURI+diagnosis.person_id, diagnosis)
        .subscribe((response) => {
         
          this.toasterService.showToaster('success','Diagnosis added successfully.');

          this.globalService.resetObject();
        })
      )
      this.globalService.listDiagnosisChange.next(null);
  }

  editDiagnosis()
  {

    let editDiagnosis = {
      diagnosis_id: this.diagnosisId,
      person_id: this.appService.personId,
      encounter_id: null,
      operation_id: this.diagnosis.operation_id,
      diagnosiscode: this.diagnosis.diagnosistext._code,
      diagnosistext: this.diagnosis.diagnosistext._term,
      statuscode: "ACTIVE",
      statustext: "ACTIVE",
      onsetdate: this.appService.getDateTimeinISOFormat(this.diagnosis.onsetdate),
      clinicalstatus: this.diagnosis.clinicalstatus,
      verificationstatus: this.diagnosis.verificationstatus,
      resolveddate: this.appService.getDateTimeinISOFormat(this.diagnosis.resolveddate),
      clinicalsummary_id: null,
      isdateapproximate: this.diagnosis.isdateapproximate,
      dateeffectiveperiod: this.diagnosis.isdateapproximate == 'No'?'Actual':this.diagnosis.dateeffectiveperiod,
      effectivedatestring: this.diagnosis.isdateapproximate == 'No'?this.appService.getDateTimeinISOFormat(this.diagnosis.onsetdate):this.diagnosis.effectivedatestring
    }

    this.activeModal.dismiss();

    this.subscriptions.add(
      this.apiRequest.postRequest(this.postDiagnosisURI+editDiagnosis.person_id, editDiagnosis)
        .subscribe((response) => {

          this.toasterService.showToaster('success','Diagnosis updated successfully.');

          this.globalService.resetObject();
        })
      )
      this.globalService.listDiagnosisChange.next(null);
  }

  ngOnDestroy(): void {    
    this.subscriptions.unsubscribe();
    this.globalService.resetObject();
  } 

}
