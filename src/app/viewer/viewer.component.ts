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
import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild, ElementRef, TemplateRef, Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';
import { Person } from '../models/entities/core-person.model';
import { ClinicalSummary } from '../models/entities/core-clinicalsummary.model';
import { NgxSpinnerService } from "ngx-spinner";
import { GlobalService } from '../services/global.service';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css']
})


export class ViewerComponent implements OnInit, OnDestroy {


  subscriptions: Subscription = new Subscription();

  personId: string;

  person: Person = new Person();
  clinicalSummary:ClinicalSummary = new ClinicalSummary();

  selectedView: string = 'viewer';

  selectedClinicalSummaryView: string;

  allergy: any;

  contextData: any;

  //Define  output property
  @Output() personChange:EventEmitter<Person> =new EventEmitter<Person>();

  @Output() viewChange: EventEmitter<any> = new EventEmitter();

   //Raise the event using the emit method.
  update() {
    this.appService.personId = this.personId;
    this.personChange.emit(this.person);
  }

  getNotification(evt) {
    // Do something with the notification (evt) sent by the child!
  
      this.selectedView = evt;
  }
  

  constructor(private apiRequest: ApirequestService, 
    public appService: AppService, 
    private subjects: SubjectsService, 
    private spinner: NgxSpinnerService,
    public globalService: GlobalService) {

      

    this.subjects.personIdChange.subscribe( () => {
      if(!this.appService.personId) {
      return;
    }

    // this.checkLockedOrBlocked();

    this.personId = this.appService.personId;
    let context = JSON.parse(localStorage.getItem('context'));

    this.subscriptions.add(
      this.apiRequest.getRequest(this.appService.baseURI + '/GetObject?synapsenamespace=core&synapseentityname=person&id=' + this.appService.personId)
        .subscribe((response) => {
          this.selectedView = 'edit';
          var data = JSON.parse(response);
          this.person = data;
          this.appService.currentPersonName = this.person.fullname;
          this.update();  //Lets the other modules know that loading has completed
          // if(this.person.fullname != null) {
          //   this.toasterService.showToaster("info", this.person.fullname + " loaded");
          // }

        })
      );    
    })
  }

  ngOnDestroy(): void {
   this.subscriptions.unsubscribe();
  }

  ngOnInit() {
    this.globalService.contextChange.subscribe(value => {
      if(value)
      {
        this.contextData = value;
      }
    });
  }

  gotoView(view: string) {
    this.selectedView = view;
  }

  goToMedicationHistory() {
    this.selectedView = "medicationHistory";
  }

  goToHome() {
    this.selectedView = "home";
  }

  goToDynamicForm() {
    this.selectedView = "dynamicForm";
  }

  onViewClosed(event)
  {

  }

}
