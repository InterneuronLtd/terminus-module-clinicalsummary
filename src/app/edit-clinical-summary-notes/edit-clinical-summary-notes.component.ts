//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2024  Interneuron Limited

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
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import * as ClassicEditor from 'src/assets/cs-ckeditor/ckeditor.js';
import { Guid } from 'guid-typescript';
import { SubjectsService } from '../services/subjects.service';
import { ClinicalSummaryNotesHistoryViewerService } from '../clinical-summary-notes-history-viewer/clinical-summary-notes-history-viewer.service';

@Component({
  selector: 'app-edit-clinical-summary-notes',
  templateUrl: './edit-clinical-summary-notes.component.html',
  styleUrls: ['./edit-clinical-summary-notes.component.css']
})
export class EditClinicalSummaryNotesComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();

  clinicalSummaryNotes: any = '';

  summaryNotes: any;
  public Editor = ClassicEditor;
  isNoteReadOnly: boolean = false;

  postClinicalSummaryNotesURI: string = this.appService.carerecorduri + "/ClinicalSummary/PostClinicalSummaryNotes/";
  getClinicalSummaryNotesURI: string = this.appService.carerecorduri + '/ClinicalSummary/GetClinicalSummaryNote/';
  getObjectClinicalSummaryNotesURI: string = this.appService.baseURI + '/GetObject?synapsenamespace=core&synapseentityname=clinicalsummarynotes&id=';

  @Input() title: string;
  @Input() message: string;
  @Input() btnOkText: string;
  @Input() btnCancelText: string;
  @Input() clinicalSummaryNotesId: string;

  constructor(private apiRequest: ApirequestService, 
    public appService: AppService,
    private spinner: NgxSpinnerService,
    private activeModal: NgbActiveModal,
    public subject: SubjectsService,
    public clinicalSummaryNotesHistoryViewerService: ClinicalSummaryNotesHistoryViewerService,) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.getClinicalSummaryNotes();
    },1000)
    
  }

  async getClinicalSummaryNotes()
  {
    this.summaryNotes = '';

    await this.subscriptions.add(
      this.apiRequest.getRequest(this.getClinicalSummaryNotesURI+this.appService.personId)
      .subscribe((response) => {
        if(response == '[]')
        {
          this.clinicalSummaryNotes = this.appService.appConfig.defaultClinicalSummaryNotes;
        }
        else{
          this.summaryNotes = JSON.parse(response)[0];
          this.clinicalSummaryNotes = JSON.parse(response)[0].notes;
        }
      })
    )
  }

  async saveClinicalSummary()
  {
    let latestClinicalSummaryNotes = this.clinicalSummaryNotes
    this.getLatestClinicalSummaryNote();

    let clinicalSummaryNotesData = {
      clinicalsummarynotes_id:  this.summaryNotes.clinicalsummarynotes_id?this.summaryNotes.clinicalsummarynotes_id:String(Guid.create()),
      person_id: this.appService.personId,
      clinicalsummary_id: null,
      encounter_id: null,
      notes: latestClinicalSummaryNotes
    }

    // if(this.clinicalSummaryNotes)
    // {
      await this.subscriptions.add(
        this.apiRequest.postRequest(this.postClinicalSummaryNotesURI+this.appService.personId, clinicalSummaryNotesData)
          .subscribe((response) => {

            let updatedClinicalSummaryNotes = JSON.parse(response);

            this.subject.clinicalSummaryNotesChange.next(updatedClinicalSummaryNotes[0]);

            this.activeModal.dismiss();

            // this.globalService.clnicalSummaryChange.next(this.appService.clinicalsummaryId);

            // this.globalService.resetObject();

            // this.subjects.frameworkEvent.next("UPDATE_EWS");

          })
        )
    // }
  }

  async getLatestClinicalSummaryNote()
  {
    await this.subscriptions.add(
    this.apiRequest.getRequest(this.getObjectClinicalSummaryNotesURI+this.clinicalSummaryNotesId+'&returnsystemattributes=1')
      .subscribe((response) => {
        if(JSON.parse(response).notes)
        {
          this.clinicalSummaryNotes = JSON.parse(response).notes;
          this.summaryNotes = JSON.parse(response);
        }
      }));
  }

  async viewHistory() {
      var response = false;
      await this.clinicalSummaryNotesHistoryViewerService.confirm(this.summaryNotes.clinicalsummarynotes_id, 'Clinical Summary Notes History','','Import')
      .then((confirmed) => response = confirmed)
      .catch(() => response = false);
      if(!response) {
        return;
      }

  }

  public dismiss() {
    this.getLatestClinicalSummaryNote();
    setTimeout(() => {
      this.subject.clinicalSummaryNotesChange.next(this.summaryNotes);
    }, 1000);
    
    this.activeModal.dismiss();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
