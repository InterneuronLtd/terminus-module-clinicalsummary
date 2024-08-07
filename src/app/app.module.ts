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
import { NgModule, Injector, DoBootstrap, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { DataTablesModule } from "angular-datatables";
import { AppComponent } from './app.component';
import { CommonModule } from "@angular/common";

import { createCustomElement } from '@angular/elements';
import { ViewerComponent } from './viewer/viewer.component';
import { FakeDataContractComponent } from './fake-data-contract/fake-data-contract.component';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerModule } from "ngx-spinner";
import {
  BsDatepickerConfig,
  BsDatepickerModule
} from "ngx-bootstrap/datepicker";
import { ModalModule, BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { AutoCompleteModule } from 'primeng/autocomplete';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ListClinicalSummaryComponent } from './list-clinical-summary/list-clinical-summary.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ListDiagnosisComponent } from './list-diagnosis/list-diagnosis.component';
import { EditClinicalSummaryComponent } from './edit-clinical-summary/edit-clinical-summary.component';

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { InvestigationResultsNotesComponent } from './investigation-results-notes/investigation-results-notes.component';
import { ListTaskComponent } from './list-task/list-task.component';
import { ListProcedureComponent } from './list-procedure/list-procedure.component';
import { AddProcedureComponent } from './add-procedure/add-procedure.component';
import { AddTaskComponent } from './add-task/add-task.component';
import { ConfirmationDialogService } from "./confirmation-dialog/confirmation-dialog.service";
import { ToastrModule } from 'ngx-toastr';
import { ClinicalSummaryNotesComponent } from './clinical-summary-notes/clinical-summary-notes.component';
import { DischargePlanComponent } from './discharge-plan/discharge-plan.component';
import { RecentLaboratoryResultsComponent } from './recent-laboratory-results/recent-laboratory-results.component';
import { InfectionControlComponent } from './infection control/infection-control.component';
import { LaboratoryResultsFishbone } from './laboratory-results-fishbone/laboratory-results-fishbone.component';
import { AddDiagnosisComponent } from './add-diagnosis/add-diagnosis.component';
import { HistoryViewerComponent } from './history-viewer/history-viewer.component';
import { DiagnosisHistoryViewerComponent } from './diagnosis-history-viewer/diagnosis-history-viewer.component';
import { TaskHistoryViewerComponent } from './task-history-viewer/task-history-viewer.component';
import { ClinicalSummaryNotesHistoryViewerComponent } from './clinical-summary-notes-history-viewer/clinical-summary-notes-history-viewer.component';
import { DischargePlanHistoryViewerComponent } from './discharge-plan-history-viewer/discharge-plan-history-viewer.component';
import { InvestigationResultsNotesHistoryViewerComponent } from './investigation-results-notes-history-viewer/investigation-results-notes-history-viewer.component';
import {TableModule} from 'primeng/table';
import {DropdownModule} from 'primeng/dropdown';
import { EditClinicalSummaryNotesComponent } from './edit-clinical-summary-notes/edit-clinical-summary-notes.component';
import { EditInvestigationResultsNotesComponent } from './edit-investigation-results-notes/edit-investigation-results-notes.component';
import { EditDischargePlanNotesComponent } from './edit-discharge-plan-notes/edit-discharge-plan-notes.component';

@NgModule({
    declarations: [
        AppComponent,
        ViewerComponent,
        FakeDataContractComponent,
        ListClinicalSummaryComponent,
        ListDiagnosisComponent,
        EditClinicalSummaryComponent,
        InvestigationResultsNotesComponent,
        ListTaskComponent,
        ListProcedureComponent,
        AddProcedureComponent,
        AddTaskComponent,
        ClinicalSummaryNotesComponent,
        DischargePlanComponent,
        RecentLaboratoryResultsComponent,
        InfectionControlComponent,
        LaboratoryResultsFishbone,
        AddDiagnosisComponent,
        HistoryViewerComponent,
        DiagnosisHistoryViewerComponent,
        TaskHistoryViewerComponent,
        ClinicalSummaryNotesHistoryViewerComponent,
        DischargePlanHistoryViewerComponent,
        InvestigationResultsNotesHistoryViewerComponent,
        EditClinicalSummaryNotesComponent,
        EditInvestigationResultsNotesComponent,
        EditDischargePlanNotesComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        DataTablesModule,
        FormsModule,
        NgxSpinnerModule,
        BrowserAnimationsModule,
        FontAwesomeModule,
        CKEditorModule,
        BsDatepickerModule.forRoot(),
        AutoCompleteModule,
        CommonModule,
        ToastrModule.forRoot({
            timeOut: 10000,
            positionClass: "toast-bottom-right",
            preventDuplicates: true,
        }),
        TableModule,
        DropdownModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [
        BsModalRef,
        BsModalService,
        BsDatepickerConfig,
        ConfirmationDialogService
    ],
     bootstrap: [],  //Comment out when running build command for packaging
    // bootstrap: [],
    entryComponents: []
})
export class AppModule implements DoBootstrap {
  constructor(private injector: Injector) {

  }

  ngDoBootstrap() {

    const el = createCustomElement(AppComponent, { injector: this.injector });

    customElements.define('app-clinical-summary', el);  // "customelement-selector" is the dom selector that will be used in parent app to render this component
  }
}
