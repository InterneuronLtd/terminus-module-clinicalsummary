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
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { GlobalService } from '../services/global.service';
import { Task } from '../models/entities/task.model';

@Component({
  selector: 'app-task-history-viewer',
  templateUrl: './task-history-viewer.component.html',
  styleUrls: ['./task-history-viewer.component.css'],
})
export class TaskHistoryViewerComponent implements OnInit {

  subscriptions: Subscription = new Subscription();

  taskHistoryList: Task[];
  task: Task;
  taskName: string;
  taskHistoryView: string;
  getTaskHistoryListURI: string;
  taskStatusList: any;

  @Input() title: string;
  @Input() message: string;
  @Input() btnOkText: string;
  @Input() btnCancelText: string;
  @Input() taskId: string;

  getTaskStatusListURI: string = this.appService.carerecorduri + '/ClinicalSummary/GetClinicalSummaryStatuses/TaskStatus';

  constructor(private apiRequest: ApirequestService, 
    public appService: AppService,
    public globalService: GlobalService,
    private spinner: NgxSpinnerService,
    private activeModal: NgbActiveModal) { }

  ngOnInit(): void {

    this.taskHistoryView = 'task list';

    this.getTaskHistoryListURI = this.appService.carerecorduri + '/ClinicalSummary/GetTaskHistory/' + this.taskId;
    
    // console.log(this.getDiagnosisHistoryListURI);
    this.GetTaskHistory();
    this.getTaskStatusList();
  }

  async GetTaskHistory()
  {
    this.spinner.show("form-history-spinner");
      await this.subscriptions.add(
       this.apiRequest.getRequest(this.getTaskHistoryListURI)
       .subscribe((response) => {
        var resp = JSON.parse(response);
        console.log('resp',resp);
         this.taskHistoryList = resp.reverse();
         this.taskName = this.taskHistoryList[0].taskname;
         this.spinner.hide("form-history-spinner");
       })
     )
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

  public dismiss() {
    this.activeModal.dismiss();
  }

  backToList() {
    this.taskHistoryView = 'task list';
  }

  viewHistoryForm(obj: any) {

    
    this.task = obj;
    console.log('obj',this.task);

    if(!this.task.taskcreateddatetime)
    {
      this.task.taskcreateddatetime = null;
    }
    else
    {
      this.task.taskcreateddatetime = new Date (this.task.taskcreateddatetime as Date);
    }

    if(!this.task.duedate)
    {
      this.task.duedate = null;
    }
    else
    {
      this.task.duedate = new Date (this.task.duedate as Date);
    }
    this.taskHistoryView = 'task form';
  }

}
