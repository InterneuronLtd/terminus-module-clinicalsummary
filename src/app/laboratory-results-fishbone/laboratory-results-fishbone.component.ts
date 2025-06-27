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
// import { StringMap } from '@angular/compiler/src/compiler_facade_interface';
// import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';/
import { Component, ElementRef, Input, ViewChild, OnInit, ViewChildren, QueryList, Renderer2} from '@angular/core';
declare var ClinicalSummaryStyleKit: any;
//import * as ClinicalSummaryStyleKit from 'src/assets/stylekit/ClinicalSummaryStyleKit.js';

@Component({
    selector: 'app-laboratory-results-fishbone',
    template: `
    <div #fishBoneContainer>
      <div #fishBoneDiagram></div>
    </div>
    `,
    styles: [`
    `]
})


export class LaboratoryResultsFishbone {

  constructor(private renderer:Renderer2) {}

  private _resultArray: any;
  title: string;
  id: string;
  canvasId: string;

  get resultArray(){
    return this._resultArray;
  }
  @Input() set resultArray(value: any){
    console.log("set resultArray value = ", value)
    this._resultArray = value;
    if(value.length > 0)
    {
      this.title = value[0].observationidentifiertext;
    }
    
  }

  canvasHeightWidth: any;


  @ViewChild('fishBoneDiagram', { static: false }) fishBoneDiagram: ElementRef;
  @ViewChild('fishBoneContainer', { static: false }) fishBoneContainer: ElementRef;

  newCanvas: any;
  devicePixelRatioScale = window.devicePixelRatio;

  ngAfterViewInit() {
    this.newCanvas = this.renderer.createElement('canvas');
    var ctx = this.newCanvas.getContext('2d');
    var width = this.fishBoneContainer.nativeElement.offsetWidth;
    var height = 200;
    this.newCanvas.style.width = width + "px";
    this.newCanvas.style.height = height + "px";

    console.log("devicePixelRatioScale = ", this.devicePixelRatioScale);
    this.newCanvas.width = Math.floor(width * this.devicePixelRatioScale);
    this.newCanvas.height = Math.floor(height * this.devicePixelRatioScale);
    ctx.scale(this.devicePixelRatioScale, this.devicePixelRatioScale);
    this.renderer.setProperty(this.newCanvas, "id", this.canvasId);
   // this.renderer.appendChild(d2, d2Id);
    this.renderer.appendChild(this.fishBoneDiagram.nativeElement, this.newCanvas);
    this.redrawFishbone(this.resultArray);
    
  }



   redrawFishbone(resultsArray:any) {

    this.canvasHeightWidth = document.querySelector(this.canvasId);
    // this.canvasHeightWidth.height = this.fishBoneDiagram.nativeElement.offsetHeight;
    // this.canvasHeightWidth.width = this.fishBoneDiagram.nativeElement.offsetWidth;
    ClinicalSummaryStyleKit.clearCanvas(this.canvasId);

              console.log('redrawFishbone resultsArray = ', resultsArray)
              ClinicalSummaryStyleKit.drawFishBoneDiagram(this.canvasId, resultsArray.length,
              resultsArray[0]?resultsArray[0].observationdate:"", resultsArray[0]?resultsArray[0].observationtime:"", resultsArray[0]?resultsArray[0].observationidentifiertext.toUpperCase():"", resultsArray[0]?resultsArray[0].observationvalue:"No value", resultsArray[0]? resultsArray[0].unitstext:"", resultsArray[0]?resultsArray[0].rangelevel:"",
              resultsArray[1]?resultsArray[1].observationdate:"", resultsArray[1]?resultsArray[1].observationtime:"", resultsArray[1]?resultsArray[1].observationidentifiertext.toUpperCase():"", resultsArray[1]?resultsArray[1].observationvalue:"No value", resultsArray[1]? resultsArray[1].unitstext:"", resultsArray[1]?resultsArray[1].rangelevel:"",
              resultsArray[2]?resultsArray[2].observationdate:"", resultsArray[2]?resultsArray[2].observationtime:"", resultsArray[2]?resultsArray[2].observationidentifiertext.toUpperCase():"", resultsArray[2]?resultsArray[2].observationvalue:"No value", resultsArray[2]? resultsArray[2].unitstext:"", resultsArray[2]?resultsArray[2].rangelevel:"",
              resultsArray[3]?resultsArray[3].observationdate:"", resultsArray[3]?resultsArray[3].observationtime:"", resultsArray[3]?resultsArray[3].observationidentifiertext.toUpperCase():"", resultsArray[3]?resultsArray[3].observationvalue:"No value", resultsArray[3]? resultsArray[3].unitstext:"", resultsArray[3]?resultsArray[3].rangelevel:"",
              resultsArray[4]?resultsArray[4].observationdate:"", resultsArray[4]?resultsArray[4].observationtime:"", resultsArray[4]?resultsArray[4].observationidentifiertext.toUpperCase():"", resultsArray[4]?resultsArray[4].observationvalue:"No value", resultsArray[4]? resultsArray[4].unitstext:"", resultsArray[4]?resultsArray[4].rangelevel:"",
              resultsArray[5]?resultsArray[5].observationdate:"", resultsArray[5]?resultsArray[5].observationtime:"", resultsArray[5]?resultsArray[5].observationidentifiertext.toUpperCase():"", resultsArray[5]?resultsArray[5].observationvalue:"No value", resultsArray[5]? resultsArray[5].unitstext:"", resultsArray[5]?resultsArray[5].rangelevel:"",
              resultsArray[6]?resultsArray[6].observationdate:"", resultsArray[6]?resultsArray[6].observationtime:"", resultsArray[6]?resultsArray[6].observationidentifiertext.toUpperCase():"", resultsArray[6]?resultsArray[6].observationvalue:"No value", resultsArray[6]? resultsArray[6].unitstext:"", resultsArray[6]?resultsArray[6].rangelevel:"",
              resultsArray[7]?resultsArray[7].observationdate:"", resultsArray[7]?resultsArray[7].observationtime:"", resultsArray[7]?resultsArray[7].observationidentifiertext.toUpperCase():"", resultsArray[7]?resultsArray[7].observationvalue:"No value", resultsArray[7]? resultsArray[7].unitstext:"", resultsArray[7]?resultsArray[7].rangelevel:"",
              resultsArray[8]?resultsArray[8].observationdate:"", resultsArray[8]?resultsArray[8].observationtime:"", resultsArray[8]?resultsArray[8].observationidentifiertext.toUpperCase():"", resultsArray[8]?resultsArray[8].observationvalue:"No value", resultsArray[8]? resultsArray[8].unitstext:"", resultsArray[8]?resultsArray[8].rangelevel:"",
              resultsArray[9]?resultsArray[9].observationdate:"", resultsArray[9]?resultsArray[9].observationtime:"", resultsArray[9]?resultsArray[9].observationidentifiertext.toUpperCase():"", resultsArray[9]?resultsArray[9].observationvalue:"No value", resultsArray[9]? resultsArray[9].unitstext:"", resultsArray[9]?resultsArray[9].rangelevel:"", ClinicalSummaryStyleKit.makeRect(0,0,this.newCanvas.width/this.devicePixelRatioScale,this.newCanvas.height/this.devicePixelRatioScale), 'aspectfit');

  }

  makeid(length) {
      var result           = '';
      var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var charactersLength = characters.length;
      for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  ngOnDestroy(): void {
   // ClinicalSummaryStyleKit.clearCanvas('canvas');
  }

  ngOnInit(): void {
    //this.redrawFishbone(this._resultArray);
    this.id = this.makeid(10);
    this.canvasId = "canvas" + this.id;
  }
}



