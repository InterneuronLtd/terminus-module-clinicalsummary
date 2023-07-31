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
import { EntityBase } from './entity-base.model';
import { CoreProcedureDetail } from './core-procedure-detail.model';
import { CoreProcedureImplant } from './core-procedure-implant.model';
import { CoreProcedureFinding } from './core-procedure-finding.model';
import { CoreProcedureStructureAffected } from './core-procedure-structure-affected.model';
import { CoreProcedureFluidLoss } from './core-procedure-fluid-loss.model';
import { CoreProcedureProvider } from './core-procedure-provider.model';
import { CoreIndication } from './core-indication.model';
import { CoreProblem } from './core-problem.model';
import { CoreProcedureDrains } from './core-procedure-drains.model';

export class CoreProcedure extends EntityBase {
	constructor() {
		super();

		this.proceduredetail = new CoreProcedureDetail();
		this.procedureimplants = [];
		this.procedurefindings = [];
		this.procedurestructuresaffected = [];
		this.procedurefluidloss = [];
		this.proceduredrains = [];
		this.procedureproviders = [];
		this.problems = [];
		this.indications = [];
	}

    procedure_id: string;
	proceduredate: Date;
	duration: number;
	person_id: string;
	encounter_id: string;
	isprimary: boolean;
	operation_id: string;
	name: string;
	anaesthesiacode: string;
	proceduremodifiercode: string;
	proceduremodifiertext: string;
	setid: number;
	anaesthesiaminutes: number;
	status: string;
    code: string;
    
    proceduredetail: CoreProcedureDetail;
    procedureimplants: CoreProcedureImplant[];
	procedurefindings: CoreProcedureFinding[];
	procedurestructuresaffected: CoreProcedureStructureAffected[];
	procedurefluidloss: CoreProcedureFluidLoss[];
	proceduredrains: CoreProcedureDrains[];
    procedureproviders: CoreProcedureProvider[];
    problems: CoreProblem[];
	indications: CoreIndication[];
}