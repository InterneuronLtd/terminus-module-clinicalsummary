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
import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
// import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';
import { ClinicalSummary } from '../models/entities/core-clinicalsummary.model';
import { ApirequestService } from '../services/apirequest.service';
import { Person } from '../models/entities/core-person.model';
import { GlobalService } from '../services/global.service';
declare var ClinicalSummaryStyleKit: any;
import { Guid } from 'guid-typescript';
import { ToasterService } from '../services/toaster-service.service';
import { InvestigationResultsNotesHistoryViewerService } from '../investigation-results-notes-history-viewer/investigation-results-notes-history-viewer.service';
// import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
// declare var ClassicEditor: any;
import * as ClassicEditor from 'src/assets/stylekit/ckeditor.js';

@Component({
  selector: 'app-investigation-results-notes',
  templateUrl: './investigation-results-notes.component.html',
  styleUrls: ['./investigation-results-notes.component.css'],
})
export class InvestigationResultsNotesComponent implements OnInit {

  subscriptions: Subscription = new Subscription();
  clinicalSummaryChange: Subscription = new Subscription();

  public Editor = ClassicEditor;

  selectedClinicalSummaryView: string;
  clinicalSummaryList: any;
  refreshingList: boolean;


  epmaPrescription: any[];
  showCancelSaveButtons: boolean = false;

  @ViewChild('canvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;

  private ctx: CanvasRenderingContext2D;

  getLabResultsURI: string;
  getSepsisChartResultsURI: string;
  getInvestigationURI: string;
  investigationNotes: any = '';
  personId: string;

  investigationResultNotes: any;
  medicationSetText:boolean = false;
  observationSetText: boolean = false

  postInvestigationResultsNotesURI: string = this.appService.carerecorduri + "/ClinicalSummary/PostInvestigation/";

  @Input() set personData(value: Person) {
    // console.log('++++++++',value);
    // this.saving = false;
    this.personId = value.person_id;
    this.selectedClinicalSummaryView = "list clinical summary";
    this.refreshingList = false;
    this.getInvestigationURI = this.appService.carerecorduri + '/ClinicalSummary/GetInvestigation/';
    this.initialiseFunctions();
  };

  constructor(private apiRequest: ApirequestService,
    public appService: AppService,
    private subjects: SubjectsService,
    public globalService: GlobalService,
    private toasterService: ToasterService,
    public investigationResultsNotesHistoryViewerService: InvestigationResultsNotesHistoryViewerService) {

      this.Editor.defaultConfig = {
        toolbar: {
          items: [
            'heading',
            '|',
            'bold',
            'italic',
            'underline',
            '|',
            'bulletedList',
            'numberedList',
            '|',
            'undo',
            'redo'
          ]
        },
        language: 'en'
      };


    this.subjects.personIdChange.subscribe( () => {
      if(!this.appService.personId) {
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
      this.getInvestigation();
    }, 1000);
  }



  async getInvestigation()
  {
    this.investigationResultNotes = '';

    await this.subscriptions.add(
      this.apiRequest.getRequest(this.getInvestigationURI+this.personId)
      .subscribe((response) => {
        if(response == '[]')
        {
          // this.investigationResultNotes.investigation_id = '';
          this.investigationNotes = '';
        }
        else{
          this.investigationResultNotes= JSON.parse(response)[0];
          this.investigationNotes = JSON.parse(response)[0].clinicalinvestigationnotes;
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
    this.getInvestigation();
    this.showCancelSaveButtons = false;
  }

  async saveInvestigationResultsNotes()
  {
    let investigationResultsNotesData = {
      investigation_id:  this.investigationResultNotes.investigation_id?this.investigationResultNotes.investigation_id:String(Guid.create()),
      person_id: this.personId,
      clinicalsummary_id: null,
      encounter_id: null,
      clinicalinvestigationnotes:  this.investigationNotes
    }

    if(this.investigationNotes)
    {
      await this.subscriptions.add(
        this.apiRequest.postRequest(this.postInvestigationResultsNotesURI+this.personId, investigationResultsNotesData)
          .subscribe((response) => {

            this.showCancelSaveButtons = false;

            this.getInvestigation();

            this.toasterService.showToaster('success','Investigation Notes added successfully.')

            this.globalService.resetObject();

            this.subjects.frameworkEvent.next("UPDATE_EWS");

          })
        )
    }
  }

  async viewHistory() {
    // if(this.investigationResultNotes.investigation_id)
    // {
      var response = false;
      await this.investigationResultsNotesHistoryViewerService.confirm(this.investigationResultNotes.investigation_id, 'Clinical Summary Notes History','','Import')
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

