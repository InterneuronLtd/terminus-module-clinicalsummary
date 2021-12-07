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
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { Procedure } from '../models/entities/procedure.model';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';

@Component({
  selector: 'app-history-viewer',
  templateUrl: './history-viewer.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./history-viewer.component.css']
})
export class HistoryViewerComponent implements OnInit {

  subscriptions: Subscription = new Subscription();

  procedureHistoryList: Procedure[];
  procedure: Procedure;

  @Input() title: string;
  @Input() message: string;
  @Input() btnOkText: string;
  @Input() btnCancelText: string;
  @Input() procedureId: string;

  historyView: string;
  procedureName: string;
  getProcedureHistoryListURI: string;
  procedureStatusList: any;
  showDateEffectivePeriod: boolean = false;
  showDatePicker: boolean = false;
  bsConfig: any;

  getProcedureStatusListURI: string = this.appService.carerecorduri + '/ClinicalSummary/GetClinicalSummaryStatuses/ProcedureStatus';

  constructor(private apiRequest: ApirequestService, 
    public appService: AppService,
    private spinner: NgxSpinnerService,
    private activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    this.historyView = 'list';

    this.getProcedureHistoryListURI = this.appService.carerecorduri + '/ClinicalSummary/GetProcedureHistory/' + this.procedureId;
    
    // console.log(this.getProcedureHistoryListURI);
    this.GetProcedureHistory();

    this.getProcedureStatusList();
  }

  async GetProcedureHistory() {
    this.spinner.show("form-history-spinner");
      await this.subscriptions.add(
       this.apiRequest.getRequest(this.getProcedureHistoryListURI)
       .subscribe((response) => {
        var resp = JSON.parse(response);
        console.log('resp',resp);
         this.procedureHistoryList = resp.reverse();
         this.procedureName = this.procedureHistoryList[0].name.replace('(Other)','').trim();
         this.spinner.hide("form-history-spinner");
       })
     )
  }

  async  getProcedureStatusList() {
    await this.subscriptions.add(
     this.apiRequest.getRequest(this.getProcedureStatusListURI)
     .subscribe((response) => {
       this.procedureStatusList = JSON.parse(response);
     })
   )
  }

  public dismiss() {
    this.activeModal.dismiss();
  }

  backToList() {
    this.historyView = 'list';
  }

  viewHistoryForm(obj: any) {

    
    this.procedure = obj;
    console.log('obj',this.procedure);

    if(this.procedure.isdateapproximate == 'Yes')
    {
      this.showDateEffectivePeriod = true;
      this.showDatePicker = true;
      
      this.procedure.dateeffectiveperiod = this.procedure.dateeffectiveperiod;
      if(this.procedure.dateeffectiveperiod == 'Month')
      {
        this.bsConfig = {dateInputFormat: 'MMM/YYYY',containerClass: 'theme-default', adaptivePosition: true}
        this.procedure.effectivedatestring  = new Date(this.procedure.effectivedatestring);
      }
      else{
        this.bsConfig = {dateInputFormat: 'YYYY',containerClass: 'theme-default', adaptivePosition: true}
        this.procedure.effectivedatestring  = new Date(this.procedure.effectivedatestring);
      }
    }

    if(!this.procedure.proceduredate)
    {
      this.procedure.proceduredate = null;
    }
    else
    {
      this.procedure.proceduredate = new Date(this.procedure.proceduredate);
    }
    this.historyView = 'form';
  }


}
