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
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { InvestigationResultsNotesHistoryViewerService } from '../investigation-results-notes-history-viewer/investigation-results-notes-history-viewer.service';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';
import { Guid } from 'guid-typescript';
import * as ClassicEditor from 'src/assets/cs-ckeditor/ckeditor.js';

@Component({
  selector: 'app-edit-investigation-results-notes',
  templateUrl: './edit-investigation-results-notes.component.html',
  styleUrls: ['./edit-investigation-results-notes.component.css']
})
export class EditInvestigationResultsNotesComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();

  investigationResultsNotes: any = '';

  investigationNotes: any;
  public Editor = ClassicEditor;
  isNoteReadOnly: boolean = false;

  postInvestigationResultsNotesURI: string = this.appService.carerecorduri + "/ClinicalSummary/PostInvestigation/";
  getInvestigationURI: string = this.appService.carerecorduri + '/ClinicalSummary/GetInvestigation/';
  getObjectInvestigationResultsNotesURI: string = this.appService.baseURI + '/GetObject?synapsenamespace=core&synapseentityname=investigation&id=';

  @Input() title: string;
  @Input() message: string;
  @Input() btnOkText: string;
  @Input() btnCancelText: string;
  @Input() investigationResultsNotesId: string;

  constructor(private apiRequest: ApirequestService, 
    public appService: AppService,
    private spinner: NgxSpinnerService,
    private activeModal: NgbActiveModal,
    public subject: SubjectsService,
    public investigationResultsNotesHistoryViewerService: InvestigationResultsNotesHistoryViewerService,) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.getInvestigationResultsNotes();
    },1000)
    
  }

  async getInvestigationResultsNotes()
  {
    this.investigationNotes = '';

    await this.subscriptions.add(
      this.apiRequest.getRequest(this.getInvestigationURI+this.appService.personId)
      .subscribe((response) => {
        if(response == '[]')
        {
          this.investigationResultsNotes = '';
        }
        else{
          this.investigationNotes = JSON.parse(response)[0];
          this.investigationResultsNotes = JSON.parse(response)[0].clinicalinvestigationnotes;
        }
      })
    )
  }

  async saveInvestigationResults()
  {
    let latestInvestigationResultsNotes = this.investigationResultsNotes;

    this.getLatestInvestigationResultsNotes();
   
      let investigationResultsNotesData = {
        investigation_id:  this.investigationNotes.investigation_id?this.investigationNotes.investigation_id:String(Guid.create()),
        person_id: this.appService.personId,
        clinicalsummary_id: null,
        encounter_id: null,
        clinicalinvestigationnotes: latestInvestigationResultsNotes
      }
  
      // if(this.investigationResultsNotes)
      // {
        this.subscriptions.add(
          this.apiRequest.postRequest(this.postInvestigationResultsNotesURI+this.appService.personId, investigationResultsNotesData)
            .subscribe((response) => {
  
              let updatedInvestigationResultsNotes = JSON.parse(response);
              this.subject.investigationResultsNotesChange.next(updatedInvestigationResultsNotes[0]);
  
              this.activeModal.dismiss();
  
            })
          )
      // }
    
  }

  async getLatestInvestigationResultsNotes()
  {
    await this.subscriptions.add(
    this.apiRequest.getRequest(this.getObjectInvestigationResultsNotesURI+this.investigationResultsNotesId+'&returnsystemattributes=1')
      .subscribe((response) => {
        if(JSON.parse(response).clinicalinvestigationnotes)
        {
          this.investigationResultsNotes = JSON.parse(response).clinicalinvestigationnotes;
          this.investigationNotes = JSON.parse(response);
        }
      }));
  }

  async viewHistory() {
    var response = false;
    await this.investigationResultsNotesHistoryViewerService.confirm(this.investigationNotes.investigation_id, 'Investigation Results Notes History','','Import')
    .then((confirmed) => response = confirmed)
    .catch(() => response = false);
    if(!response) {
      return;
    }

  }

  public dismiss() {
    this.getLatestInvestigationResultsNotes();
    setTimeout(() => {
      this.subject.investigationResultsNotesChange.next(this.investigationNotes);
    }, 1000);
    this.activeModal.dismiss();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
