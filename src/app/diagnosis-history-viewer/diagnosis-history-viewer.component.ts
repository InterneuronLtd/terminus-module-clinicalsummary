//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2024  Interneuron Holdings Ltd

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
import { Diagnosis } from '../models/entities/diagnosis.model';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { GlobalService } from '../services/global.service';

@Component({
  selector: 'app-diagnosis-history-viewer',
  templateUrl: './diagnosis-history-viewer.component.html',
  styleUrls: ['./diagnosis-history-viewer.component.css'],
})
export class DiagnosisHistoryViewerComponent implements OnInit {

  subscriptions: Subscription = new Subscription();

  diagnosisHistoryList: Diagnosis[];
  diagnosis: Diagnosis;

  @Input() title: string;
  @Input() message: string;
  @Input() btnOkText: string;
  @Input() btnCancelText: string;
  @Input() diagnosisId: string;

  diagnosisHistoryView: string;
  diagnosisName: string;
  getDiagnosisHistoryListURI: string;
  diagnosisStatusList: any;
  showDateEffectivePeriod: boolean = false;
  showDatePicker: boolean = false;
  bsConfig: any;

  clinicalStatusList: any;
  verificationStatusList: any;

  getClinicalStatusListURI: string = this.appService.carerecorduri + '/ClinicalSummary/GetClinicalSummaryStatuses/ClinicalStatus';
  getVerificationStatusListURI: string = this.appService.carerecorduri + '/ClinicalSummary/GetClinicalSummaryStatuses/VerificationStatus';

  constructor(private apiRequest: ApirequestService, 
    public appService: AppService,
    public globalService: GlobalService,
    private spinner: NgxSpinnerService,
    private activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    this.diagnosisHistoryView = 'diagnosis list';

    this.getDiagnosisHistoryListURI = this.appService.carerecorduri + '/ClinicalSummary/GetDiagnosisHistory/' + this.diagnosisId;
    
    // console.log(this.getDiagnosisHistoryListURI);
    this.GetDiagnosisHistory();

    this.getClinicalStatusList();
    this.getVerificationStatusList();
  }

  async GetDiagnosisHistory() {
    this.spinner.show("form-history-spinner");
      await this.subscriptions.add(
       this.apiRequest.getRequest(this.getDiagnosisHistoryListURI)
       .subscribe((response) => {
        var resp = JSON.parse(response);
        console.log('resp',resp);
         this.diagnosisHistoryList = resp.reverse();
         this.diagnosisName = this.diagnosisHistoryList[0].diagnosistext;
         this.spinner.hide("form-history-spinner");
       })
     )
  }

  async  getClinicalStatusList() {
    await this.subscriptions.add(
     this.apiRequest.getRequest(this.getClinicalStatusListURI)
     .subscribe((response) => {
       this.clinicalStatusList = JSON.parse(response);
     })
   )
  }

  async  getVerificationStatusList() {
    await this.subscriptions.add(
     this.apiRequest.getRequest(this.getVerificationStatusListURI)
     .subscribe((response) => {
       this.verificationStatusList = JSON.parse(response);
     })
   )
  }

  public dismiss() {
    this.activeModal.dismiss();
  }

  backToList() {
    this.diagnosisHistoryView = 'diagnosis list';
  }

  viewHistoryForm(obj: any) {

    
    this.diagnosis = obj;
    // console.log('obj',this.diagnosis);

    if(!this.diagnosis.onsetdate)
    {
      this.diagnosis.onsetdate = null;
    }
    else
    {
      this.diagnosis.onsetdate = new Date (this.diagnosis.onsetdate as Date);
    }

    this.diagnosis.isdateapproximate = this.diagnosis.isdateapproximate;
    if(this.diagnosis.isdateapproximate == 'Yes')
    {
      this.showDateEffectivePeriod = true;
      this.showDatePicker = true;
      
      this.diagnosis.dateeffectiveperiod = this.diagnosis.dateeffectiveperiod;
      if(this.diagnosis.dateeffectiveperiod == 'Month')
      {
        this.bsConfig = {dateInputFormat: 'MMMM YYYY',containerClass: 'theme-default', adaptivePosition: true}
        this.diagnosis.effectivedatestring  = new Date(this.diagnosis.effectivedatestring);
      }
      else{
        this.bsConfig = {dateInputFormat: 'YYYY',containerClass: 'theme-default', adaptivePosition: true}
        this.diagnosis.effectivedatestring  = new Date(this.diagnosis.effectivedatestring);
      }
      
    }
    else{
      this.showDateEffectivePeriod = false;
      this.showDatePicker = false;
    }

    if(!this.diagnosis.resolveddate)
    {
      this.diagnosis.resolveddate = null;
    }
    else
    {
      this.diagnosis.resolveddate = new Date (this.diagnosis.resolveddate as Date);
    }
    this.diagnosisHistoryView = 'diagnosis form';
  }

}
