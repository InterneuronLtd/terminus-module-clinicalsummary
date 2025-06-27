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
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';
import { ClinicalSummary } from '../models/entities/core-clinicalsummary.model';
import { ApirequestService } from '../services/apirequest.service';
import { AddTaskService } from '../add-task/add-task.service';
import { GlobalService } from '../services/global.service';
import { Person } from '../models/entities/core-person.model';
import { ToasterService } from '../services/toaster-service.service';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { TaskHistoryViewerComponent } from '../task-history-viewer/task-history-viewer.component';
import { TaskHistoryViewerService } from '../task-history-viewer/task-history-viewer.service';
import { SortEvent } from 'primeng/api';
@Component({
  selector: 'app-list-task',
  templateUrl: './list-task.component.html',
  styleUrls: ['./list-task.component.css']
})
export class ListTaskComponent implements OnInit {

  tempTask: Subscription = new Subscription();
  subscriptions: Subscription = new Subscription();
  clinicalSummaryChange : Subscription = new Subscription();

  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();  

  clinicalSummaryList: any;
  selectedClinicalSummaryView: string;
  saving: boolean = false;
  bsConfig: any;
  refreshingList: boolean;

  getTaskListURI: string;
  deleteTaskURI: string;

  taskList: any = [];
  contextData: any;
  personId: any;

  @Input() set personData(value: Person) {
    // console.log('++++++++',value);
    this.saving = false;
    this.personId = value.person_id;
    this.selectedClinicalSummaryView = "list clinical summary";
    this.refreshingList = false;
    this.bsConfig = {  dateInputFormat: 'DD/MM/YYYY', containerClass: 'theme-default', adaptivePosition: true };

    this.getTaskListURI = this.appService.carerecorduri + '/ClinicalSummary/GetTasks/';
    this.deleteTaskURI = this.appService.carerecorduri + '/ClinicalSummary/DeleteTask/';
    this.initialiseFunctions();
  };

  constructor(private apiRequest: ApirequestService,
    public appService: AppService, 
    private subjects: SubjectsService,
    private addTaskService: AddTaskService,
    public globalService: GlobalService,
    public confirmationDialogService: ConfirmationDialogService,
    private toasterService: ToasterService,
    public taskViewerService: TaskHistoryViewerService) { 
      this.subjects.personIdChange.subscribe( () => {
        if(!this.appService.personId) {
        return;
        }
      })
  }

  ngOnInit(): void {
    this.dtOptions = {
      paging: false,
      searching: true,
      dom: "-s"
    };
    
    this.globalService.contextChange.subscribe(value => {
      if(value)
      {
        this.contextData = value;
      }
    });

    this.tempTask = this.globalService.listTaskChange.subscribe(value => {
      this.initialiseFunctions();
    });

    this.clinicalSummaryChange = this.globalService.clnicalSummaryChange.subscribe(value => {
      if(value)
      {
        this.appService.clinicalsummaryId = value;
      } 
    });

  }


  async initialiseFunctions()
  {
    setTimeout(() => {
      this.getTaskList();
    }, 1000);
    
  }

  async getTaskList()
  {
    await this.subscriptions.add(
      this.apiRequest.getRequest(this.getTaskListURI+this.personId)
      .subscribe((response) => {
        this.taskList = JSON.parse(response);
        // console.log('this.taskList',this.taskList)
        this.refreshingList = false;
      })
    )
  }

  async addTask()
  {
    var response = false;
    await this.addTaskService.confirm('','Add Task','','Import')
    .then((confirmed) => response = confirmed)
    .catch(() => response = false);
    if(!response) {
      return;
    }
    else {
     // await this.getSelectedFormWithContext();
    }
  }

  async editTask(taskId)
  {
    if(taskId)
    {
      var response = false;
      await this.addTaskService.confirm(taskId,'Edit Task','','Import')
      .then((confirmed) => response = confirmed)
      .catch(() => response = false);
      if(!response) {
        return;
      }
      else {
      // await this.getSelectedFormWithContext();
      }
    }
  }

  // async deleteTask(taskId)
  // {
  //   if(taskId)
  //   {
  //     var displayConfirmation = this.appService.displayWarnings;
  //     if(displayConfirmation) {
  //       var response = false;
  //       await this.confirmationDialogService.confirm('Please confirm', 'Do you want to delete task?')
  //       .then((confirmed) => response = confirmed)
  //       .catch(() => response = false);
  //       if(!response) {
  //       }
  //       else{
  //         this.subscriptions.add(
  //           this.apiRequest.deleteRequest(this.deleteTaskURI+taskId)
  //           .subscribe((response) => {
              
  //             this.toasterService.showToaster('delete','Task deleted successfully.');
  //           })
  //         )
  //         this.globalService.listTaskChange.next(null);
  //       }
  //     }
      
  //   }
  // }

  async viewHistory(taskId) {
    var response = false;
    await this.taskViewerService.confirm(taskId, 'Task History','','Import')
    .then((confirmed) => response = confirmed)
    .catch(() => response = false);
    if(!response) {
      return;
    }
    else {
    }
  }

  customSort(event: SortEvent) {
    // console.log('event',event);
    event.data.sort((data1, data2) => {
        let result = -1;
            
        return (result);
    });
}

  refresh() {
  }

  save() {
  }

  async cancel() {

  }
  
  async mainmenu() {
  
  
  }
  
  
  async back() {
  
  
  }
  
  async next() {
  
  }

  async addNew(event)
  {

  }

}
