//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2025  Interneuron Limited

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
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import * as ClassicEditor from 'src/assets/cs-ckeditor/ckeditor.js';
import { Guid } from 'guid-typescript';
import { SubjectsService } from '../services/subjects.service';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DischargePlanHistoryViewerService } from '../discharge-plan-history-viewer/discharge-plan-history-viewer.service';

@Component({
  selector: 'app-edit-discharge-plan-notes',
  templateUrl: './edit-discharge-plan-notes.component.html',
  styleUrls: ['./edit-discharge-plan-notes.component.css']
})
export class EditDischargePlanNotesComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();

  dischargePlanNotes: any = '';

  dischargePlan: any;
  public Editor = ClassicEditor;
  isNoteReadOnly: boolean = false;

  postDischargePlanNotesURI: string = this.appService.carerecorduri + "/ClinicalSummary/PostDischargePlan/";
  getDischargePlanNotesURI: string = this.appService.carerecorduri + '/ClinicalSummary/GetDischargePlan/';
  getObjectDischargePlanNotesURI: string = this.appService.baseURI + '/GetObject?synapsenamespace=core&synapseentityname=dischargeplan&id=';

  @Input() title: string;
  @Input() message: string;
  @Input() btnOkText: string;
  @Input() btnCancelText: string;
  @Input() dischargePlanNotesId: string;

  constructor(private apiRequest: ApirequestService, 
    public appService: AppService,
    private spinner: NgxSpinnerService,
    private activeModal: NgbActiveModal,
    public subject: SubjectsService,
    public dischargePlanHistoryViewerService: DischargePlanHistoryViewerService,) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.getDischargePlanNotes();
    },1000)
    
  }

  async getDischargePlanNotes()
  {
    this.dischargePlan = '';

    await this.subscriptions.add(
      this.apiRequest.getRequest(this.getDischargePlanNotesURI+this.appService.personId)
      .subscribe((response) => {
        if(response == '[]')
        {
          this.dischargePlanNotes = '';
        }
        else{
          this.dischargePlan = JSON.parse(response)[0];
          this.dischargePlanNotes = JSON.parse(response)[0].dischargeplannotes;
        }
      })
    )
  }

  async saveDischargePlan()
  {
    let latestClinicalSummaryNotes = this.dischargePlanNotes;

    this.getLatestDischargePlanNotes();

   let dischargePlanNotesData = {
      dischargeplan_id:  this.dischargePlan.dischargeplan_id?this.dischargePlan.dischargeplan_id:String(Guid.create()),
      person_id: this.appService.personId,
      clinicalsummary_id: null,
      encounter_id: null,
      dischargeplannotes: latestClinicalSummaryNotes
    }

    // if(this.dischargePlanNotes)
    // {
      await this.subscriptions.add(
        this.apiRequest.postRequest(this.postDischargePlanNotesURI+this.appService.personId, dischargePlanNotesData)
          .subscribe((response) => {

            let updatedDischargePlanNotes = JSON.parse(response);

            this.subject.dischargePlanNotesChange.next(updatedDischargePlanNotes[0]);

            this.activeModal.dismiss();

            // this.globalService.resetObject();

            // this.subjects.frameworkEvent.next("UPDATE_EWS");

          })
        )
    // }
  }

  async getLatestDischargePlanNotes()
  {
    await this.subscriptions.add(
    this.apiRequest.getRequest(this.getObjectDischargePlanNotesURI+this.dischargePlanNotesId+'&returnsystemattributes=1')
      .subscribe((response) => {
        if(JSON.parse(response).dischargeplannotes)
        {
          this.dischargePlanNotes = JSON.parse(response).dischargeplannotes;
          this.dischargePlan = JSON.parse(response)
        }
        
      }));
  }

  async viewHistory() {
    var response = false;
    await this.dischargePlanHistoryViewerService.confirm(this.dischargePlan.dischargeplan_id, 'Clinical Summary Notes History','','Import')
    .then((confirmed) => response = confirmed)
    .catch(() => response = false);
    if(!response) {
      return;
    }
  }

  public dismiss() {
    this.getLatestDischargePlanNotes();
    setTimeout(() => {
      this.subject.dischargePlanNotesChange.next(this.dischargePlan);
    }, 1000);
    this.activeModal.dismiss();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
