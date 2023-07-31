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
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { Person } from '../models/entities/core-person.model';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { Guid } from 'guid-typescript';
// import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { GlobalService } from '../services/global.service';
import { ToasterService } from '../services/toaster-service.service';
import { SubjectsService } from '../services/subjects.service';
import { DischargePlanHistoryViewerService } from '../discharge-plan-history-viewer/discharge-plan-history-viewer.service';
import * as ClassicEditor from 'src/assets/stylekit/ckeditor.js';

@Component({
  selector: 'app-discharge-plan',
  templateUrl: './discharge-plan.component.html',
  styleUrls: ['./discharge-plan.component.css'],
})
export class DischargePlanComponent implements OnInit {

  subscriptions: Subscription = new Subscription();
  clinicalSummaryChange: Subscription = new Subscription();

  public Editor = ClassicEditor;

  refreshingList: boolean;
  saving: boolean = false;

  selectedClinicalSummaryView: string;

  getDischargePlanURI: string;
  dischargePlan: any;
  dischargePlanNotes: any = '';
  personId: string;

  showCancelSaveButtons: boolean = false;

  postDischargePlanNotesURI: string = this.appService.carerecorduri + "/ClinicalSummary/PostDischargePlan/";

  @Input() set personData(value: Person) {

    this.saving = false;
    this.personId = value.person_id;
    this.selectedClinicalSummaryView = "list clinical summary";
    this.refreshingList = false;

    this.getDischargePlanURI = this.appService.carerecorduri + '/ClinicalSummary/GetDischargePlan/';
    this.initialiseFunctions();

  };

  constructor(private apiRequest: ApirequestService,
    public appService: AppService,
    public globalService: GlobalService,
    private toasterService: ToasterService,
    private subjects: SubjectsService,
    public dischargePlanHistoryViewerService: DischargePlanHistoryViewerService) {
      this.subjects.encounterChange.subscribe( () => {
        if(!this.appService.encounterId) {
        return;
        }
      })

      this.clinicalSummaryChange = this.globalService.clnicalSummaryChange.subscribe(value => {
        if(value)
        {
          this.appService.clinicalsummaryId = value;
        }
      });
    }

  ngOnInit(): void {
  }

  async initialiseFunctions()
  {
    setTimeout(() => {
      this.getDischargePlan();
    }, 1000);
  }

  async getDischargePlan()
  {
    this.dischargePlan = '';

    await this.subscriptions.add(
      this.apiRequest.getRequest(this.getDischargePlanURI+this.personId)
      .subscribe((response) => {

        if(response == '[]')
        {
          this.dischargePlanNotes = '';
        }
        else{
          this.dischargePlan = JSON.parse(response)[0];
          this.dischargePlanNotes = JSON.parse(response)[0].dischargeplannotes;

          this.refreshingList = false;
        }

      })
    )
  }

  showButtons()
  {
    this.showCancelSaveButtons = true;
  }

  dismiss()
  {
    this.getDischargePlan();
    this.showCancelSaveButtons = false;
  }

  async saveDischargePlan()
  {
    let dischargePlanNotesData = {
      dischargeplan_id:  this.dischargePlan.dischargeplan_id?this.dischargePlan.dischargeplan_id:String(Guid.create()),
      person_id: this.personId,
      clinicalsummary_id: null,
      encounter_id: null,
      dischargeplannotes: this.dischargePlanNotes
    }

    if(this.dischargePlanNotes)
    {
      await this.subscriptions.add(
        this.apiRequest.postRequest(this.postDischargePlanNotesURI+this.personId, dischargePlanNotesData)
          .subscribe((response) => {

            this.showCancelSaveButtons = false;

            this.getDischargePlan();

            this.toasterService.showToaster('success','Discharge Plan added successfully.')

            this.globalService.resetObject();

            this.subjects.frameworkEvent.next("UPDATE_EWS");

          })
        )
    }
  }

  async viewHistory() {
    // if(this.dischargePlan.dischargeplan_id)
    // {
      var response = false;
      await this.dischargePlanHistoryViewerService.confirm(this.dischargePlan.dischargeplan_id, 'Discharge Plan History','','Import')
      .then((confirmed) => response = confirmed)
      .catch(() => response = false);
      if(!response) {
        return;
      }
      else {
      // await this.getSelectedFormWithContext();
      }
    // }

  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
