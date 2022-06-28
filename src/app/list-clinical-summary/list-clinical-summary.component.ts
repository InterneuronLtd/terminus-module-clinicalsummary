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
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { ClinicalSummary } from '../models/entities/core-clinicalsummary.model';
import { Person } from '../models/entities/core-person.model';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { GlobalService } from '../services/global.service';

@Component({
  selector: 'app-list-clinical-summary',
  templateUrl: './list-clinical-summary.component.html',
  styleUrls: ['./list-clinical-summary.component.css']
})
export class ListClinicalSummaryComponent implements OnInit {

  subscriptions: Subscription = new Subscription();

  personId: string;

  bsConfig: any;
  refreshingList: boolean;
  selectedClinicalSummaryView: string;
  saving: boolean = false;

  clinicalSummaryList: any;

  getAllergyListForPersonURI: string;

  contextData: any;

  selectedView: string;

  @Output() viewChange: EventEmitter<any> = new EventEmitter();

  @Input() set person(value: Person) {
    this.personId = value.person_id;
    this.selectedClinicalSummaryView = "list clinical summary";

    this.initialiseData();

  };

  // private _person: Person;
  // @Input() set clinicalSummary(value: ClinicalSummary) {
    // console.log('value',value);
    // this.clinicalSummaryList = value;
    // this.saving = false;

    // this.selectedClinicalSummaryView = "list clinical summary";
    // this.refreshingList = false;
    // this.bsConfig = {  dateInputFormat: 'DD/MM/YYYY', containerClass: 'theme-default', adaptivePosition: true };

    // this.dropdownSettings = {
    //   singleSelection: false,
    //   idField: 'allergyreportedbygroup_id',
    //   textField: 'groupname',
    //   selectAllText: 'Select All',
    //   unSelectAllText: 'UnSelect All',
    //   itemsShowLimit: 10,
    //   allowSearchFilter: true
    // };

    // this.personId = value.person_id;

    // this.getAllergyListForPersonURI = this.appService.baseURI +  "/GetBaseViewListByAttribute/bv_core_inpatientappointments?synapseattributename=person_id&attributevalue=" + this.personId;
    // this.initialiseData();
  // }

  constructor(private apiRequest: ApirequestService,
    public appService: AppService,
    public globalService: GlobalService) {
      

    }

  ngOnInit(): void {

  }

  // get person(): Person { return this._person; }

  async initialiseData() {

    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.carerecorduri + '/ClinicalSummary/GetClinicalSummaryList/'+this.personId ,null)
        .subscribe((response) => {
          if(response)
          {
            this.clinicalSummaryList = JSON.parse(response);
            console.log('this.clinicalSummaryList',this.clinicalSummaryList);
          }

        })
      );

  }

  async viewClinalSummary() {
    // console.log('viewClinalSummary called');
    // let data = {
    //   'selectedClinicalSummaryView':this.selectedClinicalSummaryView = "edit",
    //   // 'allergy_id':allergy
    // }
    
    // this.viewChange.emit(data);

  }

  showClinicalSummary()
  {
    this.selectedView = 'edit';
    this.viewChange.emit(this.selectedView);
  }

}
