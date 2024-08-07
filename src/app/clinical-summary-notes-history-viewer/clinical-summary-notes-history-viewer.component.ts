//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2024  Interneuron Limited

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
// import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-clinical-summary-notes-history-viewer',
  templateUrl: './clinical-summary-notes-history-viewer.component.html',
  styleUrls: ['./clinical-summary-notes-history-viewer.component.css'],
})
export class ClinicalSummaryNotesHistoryViewerComponent implements OnInit {

  subscriptions: Subscription = new Subscription();

  // public Editor = ClassicEditor;

  historyView: string;
  getClinicalSummaryNotesHistoryListURI: string;
  clinicalSummaryNotesHistoryList: any;
  clinicalSummaryNotes: any;

  @Input() title: string;
  @Input() message: string;
  @Input() btnOkText: string;
  @Input() btnCancelText: string;
  @Input() clinicalSummaryNotesId: string;

  constructor(private apiRequest: ApirequestService, 
    public appService: AppService,
    private spinner: NgxSpinnerService,
    private activeModal: NgbActiveModal) { }

  ngOnInit(): void {

    this.historyView = 'list';

    this.getClinicalSummaryNotesHistoryListURI = this.appService.carerecorduri + '/ClinicalSummary/GetClinicalSummaryNotesHistory/' + this.clinicalSummaryNotesId;
    
    // console.log(this.getProcedureHistoryListURI);
    this.GetProcedureHistory();
  }

  async GetProcedureHistory() {
    this.spinner.show("form-history-spinner");
      await this.subscriptions.add(
       this.apiRequest.getRequest(this.getClinicalSummaryNotesHistoryListURI)
       .subscribe((response) => {
          var resp = JSON.parse(response);
          // console.log('resp',resp);
          this.clinicalSummaryNotesHistoryList = resp.reverse();
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

    
    // this.clinicalSummaryNotes = obj;
    // console.log('obj',this.clinicalSummaryNotes);

    // this.historyView = 'form';
  }

}
