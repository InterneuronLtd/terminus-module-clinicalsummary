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
import { Component, ElementRef, Input, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
// import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';
import { ClinicalSummary } from '../models/entities/core-clinicalsummary.model';
import { ApirequestService } from '../services/apirequest.service';
import { Person } from '../models/entities/core-person.model';
import { GlobalService } from '../services/global.service';
declare var ClinicalSummaryStyleKit: any;
import { Guid } from 'guid-typescript';
import { ToasterService } from '../services/toaster-service.service';
import { LaboratoryResultsFishbone } from '../laboratory-results-fishbone/laboratory-results-fishbone.component';

@Component({
    selector: 'app-recent-laboratory-results',
    templateUrl: './recent-laboratory-results.component.html',
    styleUrls: ['./recent-laboratory-results.component.css']
})
export class RecentLaboratoryResultsComponent implements OnInit {

  subscriptions: Subscription = new Subscription();
  clinicalSummaryChange: Subscription = new Subscription();

  selectedClinicalSummaryView: string;
  clinicalSummaryList: any;
  refreshingList: boolean;
  canvasHeightWidth: any;

  laboratoryData: any;
  resultsArray: any;
  resultArray: any;
  title = "Hello child component";

  @ViewChild('canvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;

  private ctx: CanvasRenderingContext2D;

  getLabResultsURI: string;
  personId: string;



  @Input() set personData(value: Person) {
    // console.log('++++++++',value);
    // this.saving = false;
    this.personId = value.person_id;
    this.selectedClinicalSummaryView = "list clinical summary";
    this.refreshingList = false;

    this.getLabResultsURI = this.appService.carerecorduri + '/ClinicalSummary/GetLabResults/';
    this.initialiseFunctions();

  };

  constructor(private apiRequest: ApirequestService,
    public appService: AppService,
    private subjects: SubjectsService,
    public globalService: GlobalService,
    private toasterService: ToasterService,) {




    this.subjects.personIdChange.subscribe( () => {
      if(!this.appService.personId) {
        return;
      }
    })

    this.clinicalSummaryChange = this.globalService.clnicalSummaryChange.subscribe(value => {
      if(value)
      {
        this.appService.clinicalsummaryId = value;
      }
    });
  }

  ngOnInit(): void {

  }

  async initialiseFunctions()
  {
    this.getLabResults();

  }

  async getLabResults()
  {
    await this.subscriptions.add(
      this.apiRequest.postRequest(this.getLabResultsURI+this.personId,this.appService.fishbonedata)
      .subscribe((response) => {
        console.log("get lab results!!!!!")
        this.resultArray = null;
        this.laboratoryData = response;
        if(this.laboratoryData != '[]')
        {
          let resultsData: any;

           this.resultsArray = new Array();

          for(var i = 0; i < this.laboratoryData.length; i++){

            let tempResultArray = new Array();

            resultsData = JSON.parse(this.laboratoryData[i]);

            for(var j = 0; j < resultsData.length; j++)
            {
              let result: any = {};
              result.observationdate = resultsData[j].observationdate?resultsData[j].observationdate:'';
              result.observationtime = resultsData[j].observationtime?resultsData[j].observationtime:'';
              result.observationidentifiertext = resultsData[j].observationidentifiertext?resultsData[j].observationidentifiertext:'';
              result.observationvalue = resultsData[j].observationvalue?resultsData[j].observationvalue:'';
              result.unitstext = resultsData[j].unitstext?resultsData[j].unitstext:'';
              result.rangelevel = resultsData[j].rangelevel?resultsData[j].rangelevel:'';

              tempResultArray.push(result);

            }
            this.resultsArray.push(tempResultArray);
          }
          this.refreshingList = false;
        }

      })
    )
  }


  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.resultArray = null;
  }

}



