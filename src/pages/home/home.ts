import { Component, ViewChild,NgZone } from '@angular/core';
import {ImageComponentPage} from '../image-component/image-component';
import {MapComponentPage} from '../map-component/map-component';
import { PopoverController , ViewController , NavParams} from 'ionic-angular';
import {Animations} from '../animations';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  animations: Animations.transitions
})
export class HomePage {
 private ImageViewerState ='inactive';
private mapMode = 'drag';
private searchRadius =2;
    @ViewChild('imageComponent') imgComp:ImageComponentPage;
     @ViewChild('mapComponent') mapComp:MapComponentPage;

  constructor(public popOverCtrl:PopoverController,private _ngZone:NgZone) {
  
  }


 onNewLocation(loc){
  
   this.imgComp.updateLocation(loc);

 }

 onImagesLoaded(event){
    this.ImageViewerState ='active';
 }

 onMapSearching(){
   this._ngZone.run(()=>{
   this.ImageViewerState = 'inactive';
   })
 }

   presentPopover(myEvent) {
    let popover = this.popOverCtrl.create(PopoverPage,{mapMode:this.mapMode,radius:this.searchRadius},{
      enableBackdropDismiss:false,
      showBackdrop:true
    });
    popover.present({
      ev: myEvent
    });

    popover.onDidDismiss(newOptions=>{
      this.mapMode = newOptions.mapMode;
      // send the new options to the map
      this.mapComp.setMapMode(this.mapMode);

      // update the radius parameter in the image componenet 
      this.searchRadius = newOptions.radius;
      this.imgComp.setSearchRadius(this.searchRadius)
      
    })

  }

}


@Component({
  template: `
     <ion-buttons end>
      <div style="float: left;padding: 14px;font-size: 18px;">Settings</div>
      <button ion-button icon-only (click)="close()">
  <ion-icon name="close"></ion-icon>
</button>
    </ion-buttons>
  <ion-list radio-group [(ngModel)]="mapMode">

  <ion-list-header>
    Map mode
  </ion-list-header>

  <ion-item>
    <ion-label>Tap mode</ion-label>
    <ion-radio value="tap"></ion-radio>
  </ion-item>

   <ion-item>
    <ion-label>Drag mode</ion-label>
    <ion-radio value="drag"></ion-radio>
  </ion-item>

</ion-list>

    <ion-list>
     <ion-list-header>
     search radius
  </ion-list-header>
    <ion-item>
    <ion-range min="1" max="20" [(ngModel)]="radius" color="secondary" pin="true" >
      <ion-label range-left>1</ion-label>
      <ion-label range-right>20</ion-label>
    </ion-range>
  </ion-item>
    </ion-list>
  `
})
export class PopoverPage {
 private mapMode :any;
 private radius = 2;
  constructor(public viewCtrl: ViewController, params:NavParams) {
    this.mapMode = params.data.mapMode;
     this.radius = params.data.radius;

  }
  
  onVi

  close() {
    this.viewCtrl.dismiss({mapMode:this.mapMode,radius:this.radius});
  }
}
