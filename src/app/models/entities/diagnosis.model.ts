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

export interface Diagnosis extends EntityBase{
    diagnosis_id: string;
	person_id: string;
	encounter_id: string;
	diagnosiscode: string;
	diagnosistext: any;
	statuscode: string;
	statustext: string;
	clinicalstatus: string;
	onsetdate: Date;
	enddate: Date;
	reportedby: string;
	resolveddate: any;
	verificationstatus: string;
	operation_id: string;
	isdateapproximate: string;
	dateeffectiveperiod: string;
	effectivedatestring: Date;
}
