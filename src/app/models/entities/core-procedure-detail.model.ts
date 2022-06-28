//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2022  Interneuron CIC

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
import { EntityBase } from './entity-base.model';

export class CoreProcedureDetail extends EntityBase {
  proceduredetail_id: string;
  skinpreparationcode: string;
  skinpreparationtext: string;
  skinpreparationothertext: string;
  positioningcode: string;
  positioningtext: string;
  skinincisionandapproachcode: string;
  skinincisionandapproachtext: string;
  skindrapingwithimpermeabledrapes: boolean;
  assessmentofmargincode: string;
  assessmentofmargintext: string;
  closuretext: string;
  bloodloss: number;
  // deepclosurecode: string;
  // deepclosuretext: string;
  // skinclosurecode: string;
  // skinclosuretext: string;
  // skinrepairedwithcode: string;
  // skinrepairedwithtext: string;
  drainlabel: string;
  drainplacement: string;
  drainwhentoremove: string;
  dressingcode: string;
  dressingtext: string;
  // istorniquetapplied: boolean;
  // torniquettime: string;
  // torniquetpressure: string;
  localanaestheticinfiltration: string;
  procedurecomment: string;
  procedure_id: string;
  othercomments: string;
  isdifferentteam: boolean;
  laterality:string;
  unexpectedintraoperative: string;
  candourthresholdreached: string;
  armtable: boolean = false;
  beanbag: boolean = false;
  beachchair: boolean = false;
  jacksontable: boolean = false;
  sidesupport: boolean = false;
  footsupport: boolean = false;
  equipmentother: boolean = false;
  equipmentothertext : string;
  positioningothertext : string;
  otherindication: string;
  otherindicationnotes: string;
  implantproceduretype: string;
}
