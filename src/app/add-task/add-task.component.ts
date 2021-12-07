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
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { Person } from '../models/entities/core-person.model';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { Guid } from 'guid-typescript';
import { GlobalService } from '../services/global.service';
import { ToasterService } from '../services/toaster-service.service';
import { Task } from '../models/entities/task.model';
import { CoreProvider } from '../models/entities/core-provider.model';
import { v4 as uuidv4 } from 'uuid';
import { CoreProcedure } from '../models/entities/core-procedure.model';
import { SNOMED } from '../models/snomed.model';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./add-task.component.css']
})
export class AddTaskComponent implements OnInit {

  taskStatusList: any;
  task: Task;

  //Date Picker Models
  model: any;
  bsConfig: any;
  maxDateValue: Date = new Date();

  subscriptions: Subscription = new Subscription();
  clinicalSummaryChange: Subscription = new Subscription();

  assistants: CoreProvider[] = [];
  providers: CoreProvider[] = []; 
  procedure: CoreProcedure;
  cloneTaskData: any;

  @Input() title: string;
  @Input() message: string;
  @Input() btnOkText: string;
  @Input() btnCancelText: string;
  @Input() taskId: string;

  @Input() set person(value: Person) {
  };

  @Input() set operationProcedure(value: CoreProcedure) {
    this.procedure = value;
    
  }

  getTaskStatusListURI: string = this.appService.carerecorduri + '/ClinicalSummary/GetClinicalSummaryStatuses/TaskStatus';
  postTaskURI: string = this.appService.carerecorduri + "/ClinicalSummary/PostTask/";
  getTaskByIdURI: string = this.appService.carerecorduri + "/ClinicalSummary/GetTaskHistory/";

  constructor(private activeModal: NgbActiveModal,
    private apiRequest: ApirequestService, 
    public appService: AppService,
    public globalService: GlobalService,
    private toasterService: ToasterService,
    private confirmationDialogService: ConfirmationDialogService,) { 

      this.task = {} as Task;

      this.task.task_id = String(Guid.create());
      this.task.person_id = this.appService.personId;
      this.task.encounter_id = this.appService.encounterId;

      this.task.taskcreateddatetime = this.globalService.getDate();

      this.task.taskcreatedby = this.appService.currentPersonName;

      this.task.owner = this.appService.loggedInUserName;
      this.task.taskdetails = null;
      this.task.taskname = null;
      this.task.status = "";
      this.task.allocatedto = null;
      this.task.priority = "";
      this.task.duedate = this.globalService.getDate();

      this.clinicalSummaryChange = this.globalService.clnicalSummaryChange.subscribe(value => {
        if(value)
        {
          this.appService.clinicalsummaryId = value;
        } 
      });
    }

  ngOnInit(): void {

    this.subscriptions.add(
      this.apiRequest
        .getRequest(
          this.appService.carerecorduri +
            "/ClinicalSummary/GetProviders"
        )
        .subscribe((response) => {
          var data = JSON.parse(response);
          // this.task.allocatedto = data;
          this.providers = data;

        })
    );

    if(this.taskId)
    {
      this.subscriptions.add(
        this.apiRequest.getRequest(this.getTaskByIdURI+this.taskId)
        .subscribe((response) => {
          let data = JSON.parse(response);

          this.task = data.reverse();

          // console.log('this.task',this.task);

         this.task.taskname = data[0].taskname;
         this.task.taskdetails = data[0].taskdetails;
         this.task.priority = data[0].priority;
         this.task.status = data[0].status
         this.task.duedate = new Date(data[0].duedate);
         this.task.owner = data[0].owner;
         this.task.allocatedto = data[0].allocatedto;

         console.log('task',this.task);

         this.cloneTaskData = {
          taskname : data[0].taskname,
          taskdetails : data[0].taskdetails,
          priority : data[0].priority,
          status : data[0].status,
          duedate : new Date(data[0].duedate),
          owner : data[0].owner,
          allocatedto : data[0].allocatedto,
         }
        })
      )
    }
    this.initialiseData();
  }

  async initialiseData()
  {
    await this.getTaskStatusList();
  }

  async  getTaskStatusList() {
    await this.subscriptions.add(
     this.apiRequest.getRequest(this.getTaskStatusListURI)
     .subscribe((response) => {
       this.taskStatusList = JSON.parse(response);
      //  console.log('task status',this.taskStatusList)
     })
   )
  }

 

  searchAssistant(event) {
    // console.log('event',event);
      let regex = new RegExp(event.query, 'gi');
      this.assistants = this.providers.filter(
          x => (x.firstname+' '+x.middlename+' '+x.lastname).match(regex)
      );

  }

  selectedAssistant(event) {
    // console.log('event',event);
    // this.assistants = [];
    // this.assistants.push(event);
    this.task.allocatedto = event.firstname;
  }

  unSelectedAssistant(event)
  {

  }

  async addTask()
  {
    this.task.clinicalsummary_id = null;
    this.task.owner = this.appService.loggedInUserName;
    // console.log('this.task',this.task);
    // return true;
    this.activeModal.dismiss();

    await this.subscriptions.add(
      this.apiRequest.postRequest(this.postTaskURI+this.appService.personId, this.task)
        .subscribe((response) => {
         
          this.toasterService.showToaster('success','Task added successfully.');

          this.globalService.resetObject();
        })
      )
      this.globalService.listTaskChange.next(null);
  }

  editTask()
  {

    this.activeModal.dismiss();

    // this.task.clinicalsummary_id = null;
    // this.task.task_id = this.taskId;

    let editTask = {
      "task_id": this.taskId,
      "correlationid": null,
      "correlationtype": null,
      "person_id": this.appService.personId,
      "tasktype": null,
      "taskdetails": this.task.taskdetails,
      "taskcreatedby": this.task._createdby,
      "taskcreateddatetime": this.task.taskcreateddatetime,
      "taskname": this.task.taskname,
      "allocatedto": this.task.allocatedto,
      "notes": this.task.notes,
      "priority": this.task.priority,
      "status": this.task.status,
      "owner": this.appService.loggedInUserName,
      "encounter_id": null,
      "duedate": this.task.duedate,
      "allocateddatetime": null,
      "ownerassigneddatetime": null
    }

    // console.log('task',this.task);

    this.subscriptions.add(
      this.apiRequest.postRequest(this.postTaskURI+this.appService.personId, editTask)
        .subscribe((response) => {

          this.toasterService.showToaster('success','Task updated successfully.');

          this.globalService.resetObject();
        })
      )
      this.globalService.listTaskChange.next(null);
  }

  async dismiss() {
    let editTask = {
      "taskname": this.task.taskname,
      "taskdetails": this.task.taskdetails,
      "priority": this.task.priority,
      "status": this.task.status,
      "duedate": this.task.duedate,
      "owner": this.task.owner,
      "allocatedto": this.task.allocatedto,
    }
    // console.log('clone',JSON.stringify(this.cloneTaskData));
    // console.log('editTask',JSON.stringify(editTask));
    // this.activeModal.dismiss();

    if(JSON.stringify(this.cloneTaskData) != JSON.stringify(editTask))
    {
      // console.log('true');
      var displayConfirmation = this.appService.displayWarnings;
      if(displayConfirmation) {
        var response = false;
        await this.confirmationDialogService.confirm('Please confirm', 'You have unsaved data. Do you want to save before leaving?')
        .then((confirmed) => response = confirmed)
        .catch(() => response = false);
        if(!response) {
          this.activeModal.dismiss();
        }
        else{
          // this.editTask();
          
        }
        // this.activeModal.dismiss();
      }
    }
    else{
      // console.log('false');
      this.activeModal.dismiss();
    }
  }

  ngOnDestroy(): void {    
    this.subscriptions.unsubscribe();
    this.globalService.resetObject();
  } 

}
