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

@Component({
  selector: 'app-discharge-plan-history-viewer',
  templateUrl: './discharge-plan-history-viewer.component.html',
  styleUrls: ['./discharge-plan-history-viewer.component.css'],
})
export class DischargePlanHistoryViewerComponent implements OnInit {

  subscriptions: Subscription = new Subscription();

  historyView: string;
  getDischargePlanHistoryListURI: string;
  dischargePlanHistoryList: any;
  dischargePlan: any;

  @Input() title: string;
  @Input() message: string;
  @Input() btnOkText: string;
  @Input() btnCancelText: string;
  @Input() dischargePlanId: string;

  constructor(private apiRequest: ApirequestService, 
    public appService: AppService,
    private spinner: NgxSpinnerService,
    private activeModal: NgbActiveModal) { }

  ngOnInit(): void {

    this.historyView = 'list';

    this.getDischargePlanHistoryListURI = this.appService.carerecorduri + '/ClinicalSummary/GetDischargePlanHistory/' + this.dischargePlanId;
    
    this.GetDischargeHistory();
  }

  async GetDischargeHistory() {
    this.spinner.show("form-history-spinner");
      await this.subscriptions.add(
       this.apiRequest.getRequest(this.getDischargePlanHistoryListURI)
       .subscribe((response) => {
        var resp = JSON.parse(response);
        // console.log('resp',resp);
         this.dischargePlanHistoryList = resp.reverse();
         this.spinner.hide("form-history-spinner");
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

    
    // this.dischargePlan = obj;
    // console.log('obj',this.dischargePlan);

    // this.historyView = 'form';
  }

}
