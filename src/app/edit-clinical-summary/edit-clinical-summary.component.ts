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
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
// import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';
import { ClinicalSummary } from '../models/entities/core-clinicalsummary.model';
import { ApirequestService } from '../services/apirequest.service';
import { Guid } from 'guid-typescript';
import { NgxSpinnerService } from "ngx-spinner";
import { Person } from '../models/entities/core-person.model';
import { GlobalService } from '../services/global.service';
// import * as $ from 'jquery'; 
// declare var jquery: any;
declare var $: any;
import 'datatables.net';
// import 'datatables.net-dt';
import 'datatables.net-bs4';
// declare var ClassicEditor: any;
import * as ClassicEditor from 'src/assets/stylekit/ckeditor.js';

@Component({
  selector: 'app-edit-clinical-summary',
  templateUrl: './edit-clinical-summary.component.html',
  styleUrls: ['./edit-clinical-summary.component.css']
})
export class EditClinicalSummaryComponent implements OnInit {

  subscriptions: Subscription = new Subscription();

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();

  public Editor = ClassicEditor;

  clinicalSummaryList: any;
  selectedClinicalSummaryView: string;
  saving: boolean = false;
  bsConfig: any;
  refreshingList: boolean;

  selectedSummaryView: string;
  selectedView: string;
  personId: string;
  clinicalSummary: any;
  personData: any;

  diagnosisData: any;
  procedureData: any;
  clinicalSummaryNotesData: any;
  taskData: any;
  investigationResultsNotesData: any;
  dischargePlanNotesData: any;

  diagnosisAddData: any;
  procedureAddData: any;
  clinicalSummaryNotesAddData: any
  taskAddData: any
  investigationResultsNotesAddData: any;
  dischargePlanNotesAddData: any;

  @Input() set person(value: Person) {
    // console.log('value',value);
    this.selectedSummaryView = 'edit clinical summary';
    this.saving = false;
    this.personData = value;
    this.personId = value.person_id;
    this.appService.encounterId = value.person_id; //added by Wayne for demo - set to PersonId to hold and maintain values;
    //this.selectedClinicalSummaryView = "list clinical summary";  //commented out by Wayne for demo
    this.selectedClinicalSummaryView = "edit clinical summary";  //added by Wayne for demo
    this.refreshingList = false;
    this.bsConfig = {  dateInputFormat: 'DD/MM/YYYY', containerClass: 'theme-default', adaptivePosition: true };

  };


  @Output() personChange:EventEmitter<Person> =new EventEmitter<Person>();
  @Output() viewChange: EventEmitter<any> = new EventEmitter();

  constructor(private apiRequest: ApirequestService,
    public appService: AppService,
    private subjects: SubjectsService,
    public spinner: NgxSpinnerService,
    public globalService: GlobalService) {

      this.Editor.defaultConfig = {
        toolbar: {
          items: [
            'heading',
            '|',
            'bold',
            'italic',
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
  }

  ngOnInit(): void {
    this.dtOptions = {
      paging: false,
      searching: false,
      dom: "-f -t -p",
    };

    this.dtTrigger.next();
  }

  animate(): void {}

  update() {
    this.appService.personId = this.personId;
    this.personChange.emit(this.person);
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  showClinicalSummaryList()
  {
    this.selectedView = 'list';
    this.viewChange.emit(this.selectedView);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.subscriptions.unsubscribe();
  }

}
