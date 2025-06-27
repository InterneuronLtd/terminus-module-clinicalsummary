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
import { SNOMED } from "../snomed.model";
import { EntityBase } from "./entity-base.model";

export interface Task extends EntityBase{
    task_id: string,
    correlationid: string,
    correlationtype: string,
    person_id: string,
    tasktype: string,
    taskdetails: string,
    taskcreatedby: string,
    taskcreateddatetime: Date,
    taskname: string,
    allocatedto: any,
    notes: string,
    priority: string,
    status: string,
    owner: string,
    encounter_id: string,
    duedate: Date,
    allocateddatetime: Date,
    ownerassigneddatetime: Date,
    clinicalsummary_id: string,
}