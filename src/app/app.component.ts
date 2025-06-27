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
import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnDestroy, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApirequestService } from './services/apirequest.service';
import { AppService } from './services/app.service';
import { SubjectsService } from './services/subjects.service';
import { filter, filterparam, filterParams, filters, orderbystatement, selectstatement, action, DataContract } from './models/filter.model';
import { GlobalService } from './services/global.service';
import { isArray } from 'ngx-bootstrap/chronos';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy{
  title = 'terminus-clinical-summary';
  noEncountersAvailable = false;

  isProduction: boolean;
  showDevSearch: boolean = true;
  searchClass: string = "col-md-3";
  mainClass: string = "col-md-9";

  topPosToStartShowing = 100;
  isShow: boolean;

  appContexts: object;

  @HostListener("window:scroll")
  checkScroll() {
    // window의 scroll top
    // Both window.pageYOffset and document.documentElement.scrollTop returns the same result in all the cases. window.pageYOffset is not supported below IE 9.

    const scrollPosition =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    //console.log('[scroll]', scrollPosition);

    if (scrollPosition >= this.topPosToStartShowing) {
      this.isShow = true;
    } else {
      this.isShow = false;
    }
  }


  @Input() set datacontract(value: DataContract) {
    console.log('DataContract',value);
    this.appService.personId = value.personId;
    this.appService.apiService = value.apiService;
    this.subjects.unload = value.unload;
    this.initConfigAndGetMeta(this.appService.apiService);
  }

  @Output() frameworkAction = new EventEmitter<string>();

  subscriptions: Subscription = new Subscription();

  EmitFrameworkEvent(e: string) {
    this.frameworkAction.emit(e);
  }

  constructor(private subjects: SubjectsService, public appService: AppService, private apiRequest: ApirequestService, private cd: ChangeDetectorRef,public globalService: GlobalService) {
    let temp;
    this.globalService.contextChange.subscribe(value => {
      if(value)
      {
        // console.log('viwer chnage',value);
        //localStorage.setItem('context',JSON.stringify(value));
        temp = value;
      }
    });
    // this.globalService.contextChange.next(temp);
    this.isProduction = environment.production;
    if (!environment.production)
      this.initDevMode();

    this.subscriptions.add(this.subjects.encounterChange.subscribe(() => {
      this.GetMetaData();
    }));
    this.subscriptions.add(this.subjects.frameworkEvent.subscribe((e: string) => {
      this.EmitFrameworkEvent(e);
      console.log("Framework Event Emitted", e);
    }));
    this.EmitFrameworkEvent("COLLAPSE_PATIENT_LIST");

  }

  EncountersLoaded(e: boolean) {

    if (!e)
      this.noEncountersAvailable = true;
  }

  toggleDevSearch() {
    this.showDevSearch = !this.showDevSearch;

    if (this.showDevSearch) {
      this.searchClass = "col-md-3";
      this.mainClass = "col-md-9";
    } else {
      this.searchClass = "hidden";
      this.mainClass = "col-md-12";
    }
  }

  ngOnDestroy() {
    this.appService.logToConsole("app component being unloaded");
    this.appService.encounter = null;
    this.appService.personId = null;
    this.appService.isCurrentEncouner = null;
    this.appService.reset();
    this.subscriptions.unsubscribe();
    if (this.appService)
    // this.appService.warningService = null;
    this.appService = null;

    this.subjects.unload.next("app-clinical-summary");
  }

  initDevMode() {
    //commment out to push to framework - 3lines
    this.appService.personId = '774c605e-c2c6-478d-90e6-0c1230b3b223'// "40a6ed41-349d-4225-8058-ec16c4d6af00" // "c6e089d5-21b3-4bdb-ba39-80ed6173db4a"//  "774c605e-c2c6-478d-90e6-0c1230b3b223"//"96ebefbe-a2e0-4e76-8802-e577e28fcc23";// "fe8a22fa-203d-4563-abe3-8818f37945d9";// "96ebefbe-a2e0-4e76-8802-e577e28fcc23" // //"774c605e-c2c6-478d-90e6-0c1230b3b223";//"4d05aff8-123f-4ca9-be06-f9734905c02f"//"d91ef1fa-e9c0-45ba-9e92-1e1c4fd468a2"// "027c3400-24cd-45c1-9e3d-0f4475336394" ;//  "6b187a8b-1835-42c2-9cd5-91aa0e39f0f7";//"6b187a8b-1835-42c2-9cd5-91aa0e39f0f7"//"774c605e-c2c6-478d-90e6-0c1230b3b223";//"0422d1d0-a9d2-426a-b0b2-d21441e2f045";//"6b187a8b-1835-42c2-9cd5-91aa0e39f0f7"; //"17775da9-8e71-4a3f-9042-4cdcbf97efec";// "429904ca-19c1-4a3a-b453-617c7db513a3";//"027c3400-24cd-45c1-9e3d-0f4475336394";//"429904ca-19c1-4a3a-b453-617c7db513a3";
    let value: any = {};
    value.authService = {};
    value.authService.user = {};
    let auth = this.apiRequest.authService;
    auth.getToken().then((token) => {
      value.authService.user.access_token = token;
      this.initConfigAndGetMeta(value);
      this.appService.loggedInUserName = "Dev user";
    });
  }

  initConfigAndGetMeta(value: any) {
    this.appService.apiService = value;
    let decodedToken: any;
    if (this.appService.apiService) {
      decodedToken = this.appService.decodeAccessToken(
        this.appService.apiService.authService.user.access_token
      );
      if (decodedToken != null)
        this.appService.loggedInUserName = decodedToken.name
          ? isArray(decodedToken.name)
            ? decodedToken.name[0]
            : decodedToken.name
          : decodedToken.IPUId;
    }
    this.subscriptions.add(this.apiRequest.getRequest("./assets/config/ClinicalSummaryConfig.json?V" + Math.random()).subscribe(
      (response) => {
        this.appService.appConfig = response;
        this.appService.baseURI = this.appService.appConfig.uris.baseuri;
        this.appService.carerecorduri = this.appService.appConfig.uris.carerecorduri;
        this.appService.enableLogging = this.appService.appConfig.enablelogging;
        this.appService.terminologyURI = this.appService.appConfig.uris.terminologyuri;
        this.appService.fishbonedata = this.appService.appConfig.uris.fishbonedata;
        this.appService.environment = this.appService.appConfig.environment;
        this.appService.showAllComponentsAlongWithDiagnosis = this.appService.appConfig.showAllComponentsAlongWithDiagnosis;
        // this.appService.buffertimeAmber = this.appService.appConfig.bufferTime.buffertimeAmber;
        // this.appService.bufferAdministered = this.appService.appConfig.bufferTime.bufferAdministered;
        // this.appService.pleaseResupplyStockValidation = this.appService.appConfig.pleaseResupplyStockValidation;
        this.subscriptions.add(this.apiRequest.getRequest(`${this.appService.baseURI}/GetObject?synapsenamespace=core&synapseentityname=person&id=${this.appService.personId}`).subscribe(
          (person) => {
            person = JSON.parse(person);
            if (person && person.dateofbirth) {
              this.appService.personDOB = person.dateofbirth as Date;
            }
            if (person && person.gendercode) {
              this.appService.gender = person.gendercode;
            }

            //get actions for rbac
          this.subscriptions.add(
            this.apiRequest
              .postRequest(
                `${this.appService.baseURI}/GetBaseViewListByPost/rbac_actions`,
                this.createRoleFilter(decodedToken)
              )
              .subscribe((response: action[]) => {
                this.appService.roleActions = response;
                //  console.log(this.appService.roleActions);
                //  this.appService.logToConsole(response);
                // this.checkLockedOrBlocked();
                console.log('Received RBAC from API');
                this.appService.rbacDataReceived = true;
                this.subjects.rbacRefChange.next(undefined);
              })
          );

            //get all meta before emitting events
            //all components depending on meta should perform any action only after receiveing these events
            //use await on requets that are mandatory before the below events can be fired.

            //emit events after getting initial config. //this happens on first load only.
            this.appService.logToConsole("Service reference is being published from init config");
            this.subjects.apiServiceReferenceChange.next(undefined);
            this.appService.logToConsole("personid is being published from init config");
            this.subjects.personIdChange.next(undefined);

          }));

      }));
  }

  GetMetaData() {
    let decodedToken: any;
    if (this.appService.apiService) {
      decodedToken = this.appService.decodeAccessToken(this.appService.apiService.authService.user.access_token);
      if (decodedToken != null) {
        this.getUserRoles(decodedToken);
        this.appService.loggedInUserName = decodedToken.name ? (Array.isArray(decodedToken.name) ? decodedToken.name[0] : decodedToken.name) : decodedToken.IPUId;
        this.appService.logToConsole(`User Name: ${decodedToken.name}`);
        this.appService.logToConsole(`User Role: ${decodedToken.client_SynapseRoles}`);

        if (!environment.production)
          this.appService.loggedInUserName = "Dev Team";


        this.appService.logToConsole(this.appService.loggedInUserName);

          //get actions for rbac
          this.subscriptions.add(this.apiRequest.postRequest(`${this.appService.baseURI}/GetBaseViewListByPost/rbac_actions`, this.createRoleFilter(decodedToken))
            .subscribe((response: action[]) => {
              this.appService.roleActions = response;

            }));

      }
    }
  }

  createRoleFilter(decodedToken: any) {

    let condition = "";
    let pm = new filterParams();
    let synapseroles;
    if (environment.production)
      synapseroles = decodedToken.SynapseRoles
    else
      synapseroles = decodedToken.client_SynapseRoles
    if (!Array.isArray(synapseroles)) {
      condition = "rolename = @rolename";
      pm.filterparams.push(new filterparam("rolename", synapseroles));
    }
    else
      for (var i = 0; i < synapseroles.length; i++) {
        condition += "or rolename = @rolename" + i + " ";
        pm.filterparams.push(new filterparam("rolename" + i, synapseroles[i]));
      }
    condition = condition.replace(/^\or+|\or+$/g, '');
    let f = new filters();
    f.filters.push(new filter(condition));


    let select = new selectstatement("SELECT *");

    let orderby = new orderbystatement("ORDER BY 1");

    let body = [];
    body.push(f);
    body.push(pm);
    body.push(select);
    body.push(orderby);

    return JSON.stringify(body);
  }

  getUserRoles(decodedToken: any) {
    this.appService.loggedInUserRoles = [];
    let synapseroles;
    if (environment.production)
      synapseroles = decodedToken.SynapseRoles
    else
      synapseroles = decodedToken.client_SynapseRoles
    if (!Array.isArray(synapseroles)) {

      this.appService.loggedInUserRoles.push(synapseroles);
    }
    else
      for (var i = 0; i < synapseroles.length; i++) {
        this.appService.loggedInUserRoles.push(synapseroles[i]);
      }

  }

  // TODO: Cross browsing
  gotoTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }


}
