//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2024  Interneuron Holdings Ltd

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
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { SNOMED } from '../models/snomed.model';
import { TerminologyConcept } from '../models/terminology-concept.model';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Person } from '../models/entities/core-person.model';
import { Procedure } from '../models/entities/procedure.model';
import { CoreProcedure } from '../models/entities/core-procedure.model';
import { Guid } from 'guid-typescript';
import { GlobalService } from '../services/global.service';
import { ToasterService } from '../services/toaster-service.service';
import { DatePipe } from '@angular/common';
import { SubjectsService } from '../services/subjects.service';
import { CoreProvider } from '../models/entities/core-provider.model';
@Component({
  selector: 'app-add-procedure',
  templateUrl: './add-procedure.component.html',
  styleUrls: ['./add-procedure.component.css'],
})
export class AddProcedureComponent implements OnInit {

  clinicalsummary_id: string;

  showProcedureForm:boolean = false;

  procedureStatusList: any;
  procedure: Procedure;

  clinicalSummaryProcedures: CoreProcedure[] = [];
  assistants: CoreProvider[] = [];
  providers: CoreProvider[] = [];
  procedures: CoreProcedure;

  //Date Picker Models
  model: any;
  bsConfig: any;
  maxDateValue: Date = new Date();

  // Terminology
  results: SNOMED[] = [];
  resultsReactions: SNOMED[] = [];
  procedureName: string;
  showAlert: boolean = false;

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
  @Input() procedureId: string;

  getProcedureStatusListURI: string = this.appService.carerecorduri + '/ClinicalSummary/GetClinicalSummaryStatuses/ProcedureStatus';
  postProcedureURI: string = this.appService.carerecorduri + "/ClinicalSummary/PostProcedure/";
  getProcedureByIdURI: string = this.appService.carerecorduri + "/ClinicalSummary/GetProcedureHistory/";

  @Input() set person(value: Person) {
    // this.bsConfig = {  dateInputFormat: 'DD/MM/YYYY', containerClass: 'theme-default', adaptivePosition: true };
  };

  @Input() set operationProcedure(value: CoreProcedure) {
    this.procedures = value;

  }

  constructor(private activeModal: NgbActiveModal,
    private apiRequest: ApirequestService,
    public appService: AppService,
    public globalService: GlobalService,
    private toasterService: ToasterService,
    private subjects: SubjectsService, ) {

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

      this.procedure = {} as Procedure;

      this.procedure.procedure_id = String(Guid.create());
      this.procedure.person_id = this.appService.personId;
      this.procedure.encounter_id = this.appService.encounterId;

      this.procedure.proceduredate = this.globalService.getDate();

      this.procedure.performedby = '';

      this.procedure.resolveddate = this.globalService.getDate();
      this.procedure.code = null;
      this.procedure.name = "";
      this.procedure.status = "";
      this.procedure.proceduremodifiercode = null;
      this.procedure.proceduremodifiertext = null;
      this.procedure.isdateapproximate = 'No';
      this.procedure.dateeffectiveperiod = 'Month';
      this.procedure._createdby = this.appService.loggedInUserName;
      this.procedure._createddate = new Date(this.globalService.getDateTime());
    }

  ngOnInit(): void {
    // this.bsConfig = {  dateInputFormat: 'DD/MM/YYYY', containerClass: 'theme-default', adaptivePosition: true };

    this.subscriptions.add(
      this.apiRequest
        .getRequest(
          this.appService.carerecorduri  +"/ClinicalSummary/GetProviders")
        .subscribe((response) => {
          var data = JSON.parse(response);
          this.providers = data;
          this.providers.map((a) => {
            a.firstname = (a.firstname == null || a.firstname == '')?'':a.firstname+' ';
            a.middlename = (a.middlename == null || a.middlename == '')?'':a.middlename+' ';
            a.lastname = (a.lastname == null || a.lastname == '')?'':a.lastname;
            a.displayname = a.lastname+', '+a.firstname;
          });
        })
    );

    if(this.procedureId)
    {
      this.showProcedureForm = true;

      this.subscriptions.add(
        this.apiRequest.getRequest(this.getProcedureByIdURI+this.procedureId)
        .subscribe((response) => {
          let data = JSON.parse(response);
          // console.log('data',data);
          this.procedure = data.reverse();

          this.procedureName = data[0].name;

         this.procedure.name = '{"_term":"'+data[0].name.replace(/"/g,'\\"')+'","_code":"'+data[0].code+'","bindingValue":"'+data[0].code+' | '+data[0].name.replace(/"/g,'\\"')+'","fsn":"'+data[0].name.replace(/"/g,'\\"')+' (disorder)","level":0,"parentCode":null}';
          // console.log('procedure name' ,this.procedure.name);
         this.procedure.name = <SNOMED>JSON.parse(this.procedure.name);
         this.procedure.proceduredate = new Date(data[0].proceduredate);
         this.procedure.status = data[0].status;
         this.procedure.performedby = data[0].performedby;
         this.procedure.isdateapproximate = data[0].isdateapproximate;
          if(data[0].isdateapproximate == 'Yes')
          {
            this.showDateEffectivePeriod = true;
            this.showDatePicker = true;

            this.procedure.dateeffectiveperiod = data[0].dateeffectiveperiod;
            if(data[0].dateeffectiveperiod == 'Month')
            {
              this.bsConfig = {dateInputFormat: 'MMMM YYYY',containerClass: 'theme-default', adaptivePosition: true, showWeekNumbers:false}
              this.procedure.effectivedatestring  = new Date(data[0].effectivedatestring);
            }
            else{
              this.bsConfig = {dateInputFormat: 'YYYY',containerClass: 'theme-default', adaptivePosition: true, showWeekNumbers:false}
              this.procedure.effectivedatestring  = new Date(data[0].effectivedatestring);
            }
          }
          else{
            this.procedure.dateeffectiveperiod = 'Month';
          }
        })
      )

      // console.log('this.assistat',this.assistants);
    }
    this.initialiseData();
  }

  async initialiseData() {;
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

  public dismiss() {
    this.activeModal.dismiss();
  }

  search(event) {
    const result = /^(?=.*\S).+$/.test(event.query);
    if(result)
    {
      this.subscriptions.add(
        this.apiRequest.getRequest(this.appService.terminologyURI.replace("VALUE", event.query + "/procedure?api-version=1.0"))
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
                concept.term = event.query + ' (Not a codified value)';
                this.showAlert = true;
                resultsFromDb.push(concept);
            }
            else{
              this.showAlert = false;
            }

            this.results = resultsFromDb;
        })
    );
    }

}

selectedValue(event) {
      if(event) {
      this.showProcedureForm = true;
    }
    let addedProcs = [];

        if (event.code == this.otherConcept.conceptcode) {
            addedProcs = this.clinicalSummaryProcedures.filter(x =>
                (x.name.toLowerCase().replace(/ /g, '') == event.term.toLowerCase().replace(/ /g, '')));
        }
        else {
            addedProcs = this.clinicalSummaryProcedures.filter(x => x.code == event.code);
        }

        if (addedProcs.length == 0) {
            let procedure: CoreProcedure = new CoreProcedure();

            procedure.procedure_id = event.code + '|' + this.clinicalsummary_id;
            procedure.operation_id = this.clinicalsummary_id;
            procedure.code = event.code;
            procedure.name = event.term;

            this.clinicalSummaryProcedures[0] = procedure ;
        }
  }

  clearSelectedProcedure() {
    this.procedure.name = null;
    this.procedure.code = null;
  }

  unSelectedValue(event) {

  }

  searchAssistant(event) {
    const result = /^(?=.*\S).+$/.test(event.query.trim());
    if(result)
    {
      // console.log('event',event);
      let regex = new RegExp('^'+event.query.trim(), 'i');
      this.assistants = this.providers.filter(
          x => (x.displayname).match(regex)
      );

      this.assistants = this.assistants.sort((a,b) => a.displayname.localeCompare(b.displayname));
    }
  }

  selectedAssistant(event) {
    // console.log('event',event);
    this.procedure.performedby = event.displayname;
    // this.assistants = [];
    // this.assistants.push(event);
  }

  unSelectedAssistant(event)
  {

  }

  selectApproximateDate()
  {
    // console.log('callled', this.diagnosis.isdateapproximate);
    this.showDatePicker = true;
    this.bsConfig = {dateInputFormat: 'MMMM YYYY',containerClass: 'theme-default', adaptivePosition: true, showWeekNumbers:false}
    if(this.procedure.isdateapproximate == 'Yes')
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
    if(this.procedure.dateeffectiveperiod == 'Month')
    {
      this.showDatePicker = true;
      this.bsConfig = {dateInputFormat: 'MMMM YYYY',containerClass: 'theme-default', adaptivePosition: true, showWeekNumbers:false}
    }
    else{
      this.showDatePicker = true;
      this.bsConfig = {dateInputFormat: 'YYYY',containerClass: 'theme-default', adaptivePosition: true, showWeekNumbers:false}
    }
  }

  onOpenCalendar(container) {
    if(this.procedure.dateeffectiveperiod == 'Month')
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

  async addProcedure()
  {
    let procedure = {
      procedure_id: String(Guid.create()),
      proceduredate: this.appService.getDateTimeinISOFormat(this.procedure.proceduredate),
      duration: 0,
      person_id: this.appService.personId,
      encounter_id: null,
      isprimary: true,
      operation_id: null,
      name: this.clinicalSummaryProcedures[0].name,
      anaesthesiacode: null,
      proceduremodifiercode: null,
      proceduremodifiertext: null,
      setid: 0,
      anaesthesiaminutes: 0,
      status: this.procedure.status,
      code: this.clinicalSummaryProcedures[0].code,
      performedby: this.procedure.performedby,
      clinicalsummary_id: null,
      isdateapproximate: this.procedure.isdateapproximate,
      dateeffectiveperiod: this.procedure.isdateapproximate == 'No'?'Actual':this.procedure.dateeffectiveperiod,
      effectivedatestring: this.procedure.isdateapproximate == 'No'?this.appService.getDateTimeinISOFormat(this.procedure.proceduredate):this.procedure.effectivedatestring
    }

    this.activeModal.dismiss();

    await this.subscriptions.add(
      this.apiRequest.postRequest(this.postProcedureURI+procedure.person_id, procedure)
        .subscribe((response) => {

          this.toasterService.showToaster('success','Procedure added successfully.');
          this.subjects.frameworkEvent.next("UPDATE_EWS");
          //Update patient banner
          this.subjects.frameworkEvent.next("UPDATE_HEIGHT_WEIGHT");
          console.log('Procedure added and saved');
          this.globalService.resetObject();


        })
      )
      this.globalService.listProcedureChange.next(null);

  }

  editProcedure()
  {

    let editProcedure = {
      procedure_id: this.procedureId,
      person_id: this.appService.personId,
      encounter_id: null,
      operation_id: this.procedure.operation_id,
      name: this.procedure.name._term,
      code: this.procedure.name._code,
      anaesthesiacode: null,
      duration: 0,
      isprimary: true,
      proceduremodifiercode: null,
      proceduremodifiertext: null,
      setid: 0,
      anaesthesiaminutes: 0,
      proceduredate: this.appService.getDateTimeinISOFormat(this.procedure.proceduredate),
      status: this.procedure.status,
      performedby: this.procedure.performedby,
      clinicalsummary_id: null,
      isdateapproximate: this.procedure.isdateapproximate,
      dateeffectiveperiod: this.procedure.isdateapproximate == 'No'?'Actual':this.procedure.dateeffectiveperiod,
      effectivedatestring: this.procedure.isdateapproximate == 'No'?this.appService.getDateTimeinISOFormat(this.procedure.proceduredate):this.procedure.effectivedatestring
    }

    console.log('procedure',this.procedure);

    this.activeModal.dismiss();

    this.subscriptions.add(
      this.apiRequest.postRequest(this.postProcedureURI+editProcedure.person_id, editProcedure)
        .subscribe((response) => {

          this.toasterService.showToaster('success','Procedure updated successfully.');
          this.subjects.frameworkEvent.next("UPDATE_EWS");
          console.log('Procedure edited and saved');
          this.globalService.resetObject();
        })
      )
      setTimeout(() => {
        this.globalService.listProcedureChange.next(null);
      }, 1000);

  }


  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.globalService.resetObject();
  }

}
