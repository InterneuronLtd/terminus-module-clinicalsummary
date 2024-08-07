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
import { AfterViewInit, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { Person } from '../models/entities/core-person.model';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';
// import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Guid } from 'guid-typescript';
import { GlobalService } from '../services/global.service';
import { ToasterService } from '../services/toaster-service.service';
import { ClinicalSummaryNotesHistoryViewerService } from '../clinical-summary-notes-history-viewer/clinical-summary-notes-history-viewer.service';
import * as ClassicEditor from 'src/assets/cs-ckeditor/ckeditor.js';
import { EditClinicalSummaryNotesService } from '../edit-clinical-summary-notes/edit-clinical-summary-notes.service';

@Component({
  selector: 'app-clinical-summary-notes',
  templateUrl: './clinical-summary-notes.component.html',
  styleUrls: ['./clinical-summary-notes.component.css'],
})
export class ClinicalSummaryNotesComponent implements OnInit, AfterViewInit {

  subscriptions: Subscription = new Subscription();
  clinicalSummaryChange: Subscription = new Subscription();

  public Editor = ClassicEditor;

  getClinicalSummaryNotesURI: string;
  clinicalSummaryNotes: any = '';
  clinicalSummaryNotesId: any = '';
  createdBy: any = '';
  createdTimestamp: any = '';
  personId: string;
  selectedClinicalSummaryView: string;
  refreshingList: boolean;
  summaryNotes: any;
  showCancelSaveButtons: boolean = false;

  postClinicalSummaryNotesURI: string = this.appService.carerecorduri + "/ClinicalSummary/PostClinicalSummaryNotes/";

  isNoteReadOnly: boolean = true;
  canLoadNote: boolean = false;

  @Input() set personData(value: Person) {
    this.personId = value.person_id;
    this.selectedClinicalSummaryView = "list clinical summary";
    this.getClinicalSummaryNotesURI = this.appService.carerecorduri + '/ClinicalSummary/GetClinicalSummaryNote/';
    this.initialiseFunctions();

  };

  constructor(private apiRequest: ApirequestService,
    public appService: AppService,
    public globalService: GlobalService,
    private toasterService: ToasterService,
    private subjects: SubjectsService,
    public clinicalSummaryNotesHistoryViewerService: ClinicalSummaryNotesHistoryViewerService,
    public editClinicalSummaryNotesService: EditClinicalSummaryNotesService) {
      this.clinicalSummaryChange = this.globalService.clnicalSummaryChange.subscribe(value => {
        if(value)
        {
          this.appService.clinicalsummaryId = value;
        }
      });

      this.subjects.rbacRefChange.subscribe(()=>{
        this.isNoteReadOnly = !this.appService.AuthoriseAction('Edit Clinical Summary');
        this.canLoadNote = true;
      });
    }

  ngOnInit(): void {
    this.subjects.clinicalSummaryNotesChange.subscribe( (clinicalsummary) => {
      // console.log('notes',clinicalsummary['_createdtimestamp']);
      this.clinicalSummaryNotes = clinicalsummary['notes'];
      this.createdBy =  clinicalsummary['_createdby'];
      this.createdTimestamp =  clinicalsummary['_createdtimestamp'];
      this.clinicalSummaryNotesId = clinicalsummary['clinicalsummarynotes_id']
    })
    // this.clinicalSummaryChange = this.globalService.clnicalSummaryChange.subscribe(value => {
    //   if(!this.appService.clinicalsummaryId) {
    //     return;
    //   }
    //   this.appService.clinicalsummaryId = value;
    // })
    // console.log('this.appService.clinicalsummaryId',this.appService.clinicalsummaryId);
  }

  ngAfterViewInit(): void {
    //safe to check after view init
    if(this.appService && this.appService.rbacDataReceived) {
      this.isNoteReadOnly = !this.appService.AuthoriseAction('Edit Clinical Summary');
      this.canLoadNote = true;
    }
  }

  async initialiseFunctions()
  {
    setTimeout(() => {
      this.getClinicalSummaryNotesList();
    }, 1000);

  }

  async getClinicalSummaryNotesList()
  {
    this.summaryNotes = '';

    // console.log(this.personId+'/'+this.appService.encounterId+'/'+this.appService.clinicalsummaryId);

    await this.subscriptions.add(
      this.apiRequest.getRequest(this.getClinicalSummaryNotesURI+this.personId)
      .subscribe((response) => {
        if(response == '[]')
        {
          // this.summaryNotes.clinicalsummarynotes_id = '';
          this.clinicalSummaryNotes = this.appService.appConfig.defaultClinicalSummaryNotes;
        }
        else{
          this.summaryNotes = JSON.parse(response)[0];
          this.clinicalSummaryNotes = JSON.parse(response)[0].notes;
          this.createdBy = JSON.parse(response)[0]._createdby;
          this.createdTimestamp = JSON.parse(response)[0]._createdtimestamp;
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
    this.getClinicalSummaryNotesList();
    this.showCancelSaveButtons = false;
  }

  async saveClinicalSummary()
  {
    let clinicalSummaryNotesData = {
      clinicalsummarynotes_id:  this.summaryNotes.clinicalsummarynotes_id?this.summaryNotes.clinicalsummarynotes_id:String(Guid.create()),
      person_id: this.personId,
      clinicalsummary_id: null,
      encounter_id: null,
      notes: this.clinicalSummaryNotes
    }

    if(this.clinicalSummaryNotes)
    {
      await this.subscriptions.add(
        this.apiRequest.postRequest(this.postClinicalSummaryNotesURI+this.personId, clinicalSummaryNotesData)
          .subscribe((response) => {

            this.showCancelSaveButtons = false;

            this.getClinicalSummaryNotesList();

            this.toasterService.showToaster('success','Clinical Summary Notes added successfully.')

            this.globalService.clnicalSummaryChange.next(this.appService.clinicalsummaryId);

            this.globalService.resetObject();

            this.subjects.frameworkEvent.next("UPDATE_EWS");

          })
        )
    }
  }

  async viewHistory() {
    // if(this.summaryNotes.clinicalsummarynotes_id)
    // {
      let clinicalSummaryNotesID = (this.summaryNotes.clinicalsummarynotes_id != undefined) ? this.summaryNotes.clinicalsummarynotes_id : this.clinicalSummaryNotesId;
      var response = false;
      await this.clinicalSummaryNotesHistoryViewerService.confirm(((clinicalSummaryNotesID == '') ? undefined : clinicalSummaryNotesID), 'Clinical Summary Notes History','','Import')
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

  async openEditClinicalSummaryDialog()
  {
    var response = false;
    await this.editClinicalSummaryNotesService.confirm(this.summaryNotes.clinicalsummarynotes_id, 'Clinical Summary Notes History','','Import')
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
