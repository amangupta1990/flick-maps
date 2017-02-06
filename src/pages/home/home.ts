import { Component, ViewChild,NgZone } from '@angular/core';
import {ImageComponent} from '../image-component/image-component';
import {MapComponent} from '../map-component/map-component';
import { PopoverController , ViewController , NavParams} from 'ionic-angular';
import {Animations} from '../animations';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  animations: Animations.transitions
})
export class HomePage {
 private ImageViewerState ='inactive';
private mapMode = 'tap';
private searchRadius =2;
private viewerHeight:number;
    @ViewChild('imageComponent') imgComp:ImageComponent;
     @ViewChild('mapComponent') mapComp:MapComponent;

  constructor(public popOverCtrl:PopoverController,private _ngZone:NgZone) {
       // configure image container  widths by device height
      let windowHeight = window.innerHeight;

      if(windowHeight <=480 )
      this.viewerHeight = 14; // em
      else
      this.viewerHeight = 20; //em

     
  }


 onNewLocation(loc){
  
   this.imgComp.loadPicturesFromLocation(loc);

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
      this.ImageViewerState = 'inactive';
      this.mapComp.setMapMode(this.mapMode);

      // update the radius parameter in the image componenet 
      this.searchRadius = newOptions.radius;
      this.imgComp.setSearchRadius(this.searchRadius)
      
    })

  }

  getUserLocation(){
    this.mapComp.getGeoLocation();
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
    <ion-range min="1" max="20" [(ngModel)]="radius" color="primary" pin="true" >
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
  
 

  close() {
    this.viewCtrl.dismiss({mapMode:this.mapMode,radius:this.radius});
  }
}
