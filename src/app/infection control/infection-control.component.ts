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
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';
import { ClinicalSummary } from '../models/entities/core-clinicalsummary.model';
import { ApirequestService } from '../services/apirequest.service';
import { Person } from '../models/entities/core-person.model';
import { GlobalService } from '../services/global.service';
declare var ClinicalSummaryStyleKit: any;
import { Guid } from 'guid-typescript';
import { ToasterService } from '../services/toaster-service.service';

@Component({
  selector: 'app-infection-control',
  templateUrl: './infection-control.component.html',
  styleUrls: ['./infection-control.component.css']
})
export class InfectionControlComponent implements OnInit {

  subscriptions: Subscription = new Subscription();
  clinicalSummaryChange: Subscription = new Subscription();

  selectedClinicalSummaryView: string;
  clinicalSummaryList: any;
  refreshingList: boolean;
 

 
  observationSet: any;
  crpSet: any;
  microbiologyReportSet: any;

  epmaPrescription: any[];

  getSepsisChartResultsURI: string;
  personId: string;

  medicationSetText:boolean = false;
  observationSetText: boolean = false

  @Input() set personData(value: Person) {
    // console.log('++++++++',value);
    // this.saving = false;
    this.personId = value.person_id;
    this.selectedClinicalSummaryView = "list clinical summary";
    this.refreshingList = false;

    this.getSepsisChartResultsURI = this.appService.carerecorduri + '/ClinicalSummary/GetSepsisChartList/';
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
    setTimeout(() => {
      this.getSepsisChartResults();
    }, 1000);
  }


  async getSepsisChartResults()
  {

    await this.subscriptions.add(
      this.apiRequest.getRequest(this.getSepsisChartResultsURI+this.personId)
      .subscribe((response) => {

        if(response)
        {
          this.epmaPrescription = [];
          this.observationSet = JSON.parse(response[0]);
          this.crpSet = JSON.parse(response[1]);
          this.microbiologyReportSet = JSON.parse(response[2]);
          if(this.microbiologyReportSet.length > 0)
          {
            this.microbiologyReportSet[0].content = this.microbiologyReportSet[0].content.replace(/<[^>]*>/g, ' ');
          }
                
          if(this.observationSet.length && this.crpSet.length && this.microbiologyReportSet.length)
          {
            this.observationSetText = true;
          }

          let medicationSet = JSON.parse(response[3]);
          if(medicationSet.length == 0)
          {
            this.medicationSetText = true;
          }
          // console.log('medicationSet',medicationSet);
          medicationSet.forEach(element => {
            let medications = JSON.parse(element.__medications);
            let posology = JSON.parse(element.__posology);
            let routes = JSON.parse(element.__routes);
            let med = medications.find(x => x.isprimary == true);
            let epmaPrescriptionData = new EpmaPrescription();

            if(med.isantimicrobial || med.name.indexOf('Paracetamol') != -1 || med.name.indexOf('Antimicrobial') != -1)
            {
              epmaPrescriptionData.name = med.name;
              epmaPrescriptionData.route = routes.find(x => x.isdefault == true).route;
              epmaPrescriptionData.startDate = posology.prescriptionstartdate;
              epmaPrescriptionData.endDate = posology.prescriptionenddate; // check the null for end date
              if(posology.infusiontypeid)
              {
                if(posology.frequency != 'variable' && posology.frequency != 'protocol')
                {
                  epmaPrescriptionData.dosage = posology.infusionrate;
                  epmaPrescriptionData.units = posology.infusionrateunits;
                }
                else{
                  epmaPrescriptionData.dosage = posology.frequency;
                  epmaPrescriptionData.units = '';
                }
              }
              else{
                if(posology.frequency != 'variable' && posology.frequency != 'protocol')
                {
                  if(posology.dosetype == 'units')
                  {
                    epmaPrescriptionData.dosage = posology.__dose[0].dosesize;
                    epmaPrescriptionData.units = posology.__dose[0].doseunit;
                  }

                  if(posology.dosetype == 'strength')
                  {
                    epmaPrescriptionData.dosage = posology.__dose[0].strengthneumerator;
                    epmaPrescriptionData.units = posology.__dose[0].strengthneumeratorunit;
                  }

                  if(posology.dosetype == 'descriptive')
                  {
                    epmaPrescriptionData.dosage = posology.__dose[0].descriptivedose;
                    epmaPrescriptionData.units = '';
                  }
                  
                }
                else{
                  epmaPrescriptionData.dosage = posology.frequency;
                  epmaPrescriptionData.units = '';
                }
              }

              if(posology.frequency == 'x')
              {
                epmaPrescriptionData.timesperday = posology.frequencysize;
              }
              
              this.epmaPrescription.push(epmaPrescriptionData);
            }
              
          });

          this.refreshingList = false;
        }
        
        
      })
    )

  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}

export class EpmaPrescription {
  public name: string;
  public dosage: any;
  public units: string;
  public route: any;
  public timesperday: string;
  public startDate: Date;
  public endDate: any;
}

