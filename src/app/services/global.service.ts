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
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Diagnosis } from '../models/entities/diagnosis.model';
import { Procedure } from '../models/entities/procedure.model';
import { Task } from '../models/entities/task.model';
import { ApirequestService } from './apirequest.service';
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  public listDiagnosisChange = new BehaviorSubject<any>(null);
  public listProcedureChange = new BehaviorSubject<any>(null);
  public listTaskChange = new BehaviorSubject<any>(null);
  public contextChange = new BehaviorSubject<any>(null);
  public clnicalSummaryChange = new BehaviorSubject<any>(null);
  diagnosis: Diagnosis;
  procedure: Procedure;
  task: Task;

  constructor(private apiRequest: ApirequestService,
    public appService: AppService,) { }

  getDateTime(): string {
    var date = new Date();
    let year = date.getFullYear();
    let month = (date.getMonth() + 1);
    let day = date.getDate();
    let hrs = date.getHours();
    let mins = date.getMinutes();
    let secs = date.getSeconds();
    let msecs = date.getMilliseconds();

    let returndate = (year + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day) +
      "T" + (hrs < 10 ? "0" + hrs : hrs) + ":" + (mins < 10 ? "0" + mins : mins) + ":" + (secs < 10 ? "0" + secs : secs) + "." + (msecs < 10 ? "00" + msecs : (msecs < 100 ? "0" + msecs : msecs)));

    return returndate;
  }

  getDate(): Date {
    var date = new Date();
    return date;
  }

  resetObject() {
    this.diagnosis = {} as Diagnosis;
    this.procedure = {} as Procedure;
    this.task = {} as Task;
  }

}
