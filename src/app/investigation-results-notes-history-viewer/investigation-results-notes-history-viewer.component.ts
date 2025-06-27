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
// import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-investigation-results-notes-history-viewer',
  templateUrl: './investigation-results-notes-history-viewer.component.html',
  styleUrls: ['./investigation-results-notes-history-viewer.component.css'],
})
export class InvestigationResultsNotesHistoryViewerComponent implements OnInit {

  subscriptions: Subscription = new Subscription();

  // public Editor = ClassicEditor;

  historyView: string;
  getInvestigationResultsNotesHistoryListURI: string;
  investigationResultsNotesHistoryList: any;
  investigationResultsNotes: any;

  @Input() title: string;
  @Input() message: string;
  @Input() btnOkText: string;
  @Input() btnCancelText: string;
  @Input() investigationResultsNotesId: string;

  constructor(private apiRequest: ApirequestService, 
    public appService: AppService,
    private spinner: NgxSpinnerService,
    private activeModal: NgbActiveModal) { }

  ngOnInit(): void {

    this.historyView = 'list';

    this.getInvestigationResultsNotesHistoryListURI = this.appService.carerecorduri + '/ClinicalSummary/GetInvestigationHistory/' + this.investigationResultsNotesId;
    
    // console.log(this.getProcedureHistoryListURI);
    this.GetInvestigationResultsNotesHistory();
  }

  async GetInvestigationResultsNotesHistory() {
    this.spinner.show("form-history-spinner");
      await this.subscriptions.add(
       this.apiRequest.getRequest(this.getInvestigationResultsNotesHistoryListURI)
       .subscribe((response) => {
        var resp = JSON.parse(response);
        // console.log('resp',resp);
         this.investigationResultsNotesHistoryList = resp.reverse();
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

    
    // this.investigationResultsNotes = obj;
    // console.log('obj',this.investigationResultsNotes);

    // this.historyView = 'form';
  }


}
