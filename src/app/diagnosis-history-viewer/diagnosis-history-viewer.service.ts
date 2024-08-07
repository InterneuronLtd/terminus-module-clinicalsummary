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
import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DiagnosisHistoryViewerComponent } from './diagnosis-history-viewer.component';

@Injectable({
  providedIn: 'root'
})
export class DiagnosisHistoryViewerService {

  constructor(private modalService: NgbModal) { }

  formBuilderFormId: string;


  public confirm(
    diagnosisId: string,
    title: string,
    message: string = '',
    btnOkText: string = 'Yes',
    btnCancelText: string = 'No',
    dialogSize: 'sm'|'lg' = 'lg',
    ): Promise<boolean> {

    const modalRef = this.modalService.open(DiagnosisHistoryViewerComponent, { size: dialogSize, centered: true });

    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.btnOkText = btnOkText;
    modalRef.componentInstance.btnCancelText = btnCancelText;
    modalRef.componentInstance.diagnosisId = diagnosisId;

    return modalRef.result;

  }
}
