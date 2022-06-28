//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2022  Interneuron CIC

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
          // console.log('this.observationSet',this.observationSet);
          this.crpSet = JSON.parse(response[1]);
          // console.log('this.crpSet',this.crpSet);
          this.microbiologyReportSet = JSON.parse(response[2]);
          // console.log('this.microbiologyReportSet',this.microbiologyReportSet);
          if(this.microbiologyReportSet.length > 0)
          {
            this.microbiologyReportSet[0].content = this.microbiologyReportSet[0].content.replace(/<[^>]*>/g, ' ');
          }

          if(this.observationSet.length == 0 && this.crpSet.length == 0 && this.microbiologyReportSet.length == 0)
          {
            this.observationSetText = true;
          }

          let medicationSet = JSON.parse(response[3]);
          if(medicationSet.length == 0)
          {
            this.medicationSetText = true;
          }

          // console.log('medicationSet',medicationSet);
          let antimicrobialTrue = [];
          let antimicrobialFalse = [];
          let sortedMedicationData = [];
          medicationSet.forEach(element => {
            let medications = JSON.parse(element.__medications).find(x => x.isprimary == true);
            let posology = JSON.parse(element.__posology).find(x => x.iscurrent == true);
            let routes = JSON.parse(element.__routes);
            // console.log('medications',medications)
            // console.log('posology',posology)
            if(medications.isantimicrobial == true)
            {
              if(antimicrobialTrue.indexOf(medications.medication_id) == -1) {
                antimicrobialTrue.push({'medication':medications,'posology':posology,'routes':routes,'startdatetime':element.startdatetime,'lastmodifiedon':element.lastmodifiedon});
              }
            }
            else{
              if(antimicrobialFalse.indexOf(medications.medication_id) == -1) {
                antimicrobialFalse.push({'medication':medications,'posology':posology,'routes':routes,'startdatetime':element.startdatetime,'lastmodifiedon':element.lastmodifiedon});
              }
            }
            sortedMedicationData = antimicrobialTrue.concat(antimicrobialFalse)
          });

          sortedMedicationData.forEach(element =>{
            let epmaPrescriptionData = new EpmaPrescription();
            // console.log('element',element.medication.name);
            epmaPrescriptionData.name = element.medication.name;

            if(element.routes.length != 0)
            {
              epmaPrescriptionData.route = element.routes.find(x => x.isdefault == true).route;
            }

            epmaPrescriptionData.startDate = element.posology.prescriptionstartdate;  //element.startdatetime;
            //CS-126 RNOH - Infection Control: Prescription "From" date is showing in the "Modified From" column
            epmaPrescriptionData.modifiedFromDate = element.posology.prescriptionstartdate?'':element.posology.prescriptionstartdate;
            epmaPrescriptionData.endDate = element.posology.prescriptionenddate; // check the null for end date

            if(element.posology.infusiontypeid)
            {
              // if(element.posology.frequency != 'variable' && element.posology.frequency != 'protocol')
              // {
              //   epmaPrescriptionData.dosage = element.posology.infusionrate;
              //   epmaPrescriptionData.units = element.posology.infusionrateunits;
              // }
              // else{
              //   epmaPrescriptionData.dosage = element.posology.frequency;
              //   epmaPrescriptionData.units = '';
              // }

              if(element.posology.dosetype == 'units')
              {
                if(element.posology.__dose[0].dosestrength != null && element.posology.__dose[0].dosestrength != 0)
                {
                  if(element.posology.__dose[0].dosestrengthrangemax != null && element.posology.__dose[0].dosestrengthrangemax != 0)
                  {
                    epmaPrescriptionData.dosage = element.posology.__dose[0].dosestrength + '-' + element.posology.__dose[0].dosestrengthrangemax;
                    epmaPrescriptionData.units = element.posology.__dose[0].dosestrengthunits;
                  }
                  else{
                    epmaPrescriptionData.dosage = element.posology.__dose[0].dosestrength;
                    epmaPrescriptionData.units = element.posology.__dose[0].dosestrengthunits;
                  }
                }
                else{
                  if(element.posology.__dose[0].dosesizerangemax != null && element.posology.__dose[0].dosesizerangemax != 0)
                  {
                    epmaPrescriptionData.dosage = element.posology.__dose[0].dosesize + '-' + element.posology.__dose[0].dosesizerangemax;
                    epmaPrescriptionData.units = element.posology.__dose[0].doseunit;
                  }
                  else{
                    epmaPrescriptionData.dosage = element.posology.__dose[0].dosesize;
                    epmaPrescriptionData.units = element.posology.__dose[0].doseunit;
                  }
                }
                // epmaPrescriptionData.dosage = element.posology.__dose[0].dosesize;
                // epmaPrescriptionData.units = element.posology.__dose[0].doseunit;
              }

              if(element.posology.dosetype == 'strength')
              {
                epmaPrescriptionData.dosage = element.posology.__dose[0].strengthneumerator;
                epmaPrescriptionData.units = element.posology.__dose[0].strengthneumeratorunit;
              }

              if(element.posology.dosetype == 'descriptive')
              {
                epmaPrescriptionData.dosage = element.posology.__dose[0].descriptivedose;
                epmaPrescriptionData.units = '';
              }
            }
            else{
              if(element.posology.frequency != 'variable' && element.posology.frequency != 'protocol')
              {
                if(element.posology.dosetype == 'units')
                {
                  if(element.posology.__dose[0].dosestrength != null && element.posology.__dose[0].dosestrength != 0)
                  {
                    if(element.posology.__dose[0].dosestrengthrangemax != null && element.posology.__dose[0].dosestrengthrangemax != 0)
                    {
                      epmaPrescriptionData.dosage = element.posology.__dose[0].dosestrength + '-' + element.posology.__dose[0].dosestrengthrangemax;
                      epmaPrescriptionData.units = element.posology.__dose[0].dosestrengthunits;
                    }
                    else{
                      epmaPrescriptionData.dosage = element.posology.__dose[0].dosestrength;
                      epmaPrescriptionData.units = element.posology.__dose[0].dosestrengthunits;
                    }
                  }
                  else{
                    if(element.posology.__dose[0].dosesizerangemax != null && element.posology.__dose[0].dosesizerangemax != 0)
                    {
                      epmaPrescriptionData.dosage = element.posology.__dose[0].dosesize + '-' + element.posology.__dose[0].dosesizerangemax;
                      epmaPrescriptionData.units = element.posology.__dose[0].doseunit;
                    }
                    else{
                      epmaPrescriptionData.dosage = element.posology.__dose[0].dosesize;
                      epmaPrescriptionData.units = element.posology.__dose[0].doseunit;
                    }
                  }
                  // epmaPrescriptionData.dosage = element.posology.__dose[0].dosesize;
                  // epmaPrescriptionData.units = element.posology.__dose[0].doseunit;
                }

                if(element.posology.dosetype == 'strength')
                {
                  epmaPrescriptionData.dosage = element.posology.__dose[0].strengthneumerator;
                  epmaPrescriptionData.units = element.posology.__dose[0].strengthneumeratorunit;
                }

                if(element.posology.dosetype == 'descriptive')
                {
                  epmaPrescriptionData.dosage = element.posology.__dose[0].descriptivedose;
                  epmaPrescriptionData.units = '';
                }

              }
              else{
                epmaPrescriptionData.dosage = element.posology.frequency;
                epmaPrescriptionData.units = '';
              }
            }

            if(element.posology.prn == true)
            {
              epmaPrescriptionData.timesperday = 'PRN';
            }
            else{
              epmaPrescriptionData.frequency = element.posology.frequency;
              epmaPrescriptionData.infusiontypeid = element.posology.infusiontypeid;
              if(element.posology.frequency == 'x')
              {
                epmaPrescriptionData.timesperday = element.posology.frequencysize;
              }
              else if(element.posology.frequency == 'h')
              {
                epmaPrescriptionData.timesperday = element.posology.frequencysize;
              }
              else if(element.posology.frequency == 'stat')
              {
                epmaPrescriptionData.timesperday = 'STAT';
              }
              else if(element.posology.frequency == 'variable' && element.posology.infusiontypeid == 'ci')
              {
                epmaPrescriptionData.timesperday = element.posology.frequency + ' ' + 'Continuous Infusion';
              }
              else if(element.posology.frequency == 'variable')
              {
                epmaPrescriptionData.timesperday = element.posology.frequency;
              }
              else if(element.posology.frequency == 'protocol')
              {
                epmaPrescriptionData.timesperday = element.posology.frequency;
              }
              else if(element.posology.infusiontypeid == 'ci')
              {
                epmaPrescriptionData.timesperday = 'Continuous Infusion';
              }
              else{
                epmaPrescriptionData.timesperday = '1';
              }
            }

            this.epmaPrescription.push(epmaPrescriptionData);
          });

          // console.log('epmaPrescription',this.epmaPrescription);

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
  public fromDate: Date;
  public startDate: Date;
  public endDate: any;
  public modifiedFromDate: any;
  public frequency: any;
  public infusiontypeid: any;
}

