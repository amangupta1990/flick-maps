import { Component, ViewChild, NgZone } from '@angular/core';
import { ImageComponent } from '../image-component/image-component';
import { MapComponent } from '../map-component/map-component';
import { PopoverController, ViewController, NavParams } from 'ionic-angular';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private ImageViewerState = 'inactive';
  private viewerHeight: number;
  @ViewChild('imageComponent') imgComp: ImageComponent;
  @ViewChild('mapComponent') mapComp: MapComponent;

  constructor(public popOverCtrl: PopoverController, private _ngZone: NgZone) {
    // configure image container  widths by device height
    let windowHeight = window.innerHeight;

    if (windowHeight <= 480)
      this.viewerHeight = 14; // em
    else
      this.viewerHeight = 20; //em


  }

  onZoom(zoomLevel) {

    // tell the image component to adjust it's accuracy
    this.imgComp.setAccuracy(zoomLevel);
  }

  onNewLocation(loc: Object) {

    this.imgComp.loadPicturesFromLocation(loc);

  }

  onImagesLoaded(event) {
    this.ImageViewerState = 'active';
  }

  onMapSearching() {
    this._ngZone.run(() => {
      this.ImageViewerState = 'inactive';
    })
  }

  presentPopover(myEvent) {

    // get the current configuration from the map compoenent 

    let mapMode = this.mapComp.getMapMode();


    let popover = this.popOverCtrl.create(PopoverPage, { mapMode: mapMode }, {
      enableBackdropDismiss: false,
      showBackdrop: true
    });
    popover.present({
      ev: myEvent
    });

    popover.onDidDismiss(newOptions => {
      let mapMode = newOptions.mapMode;
      // send the new options to the map
      this.ImageViewerState = 'inactive';
      this.mapComp.setMapMode(mapMode);


    })

  }

  getUserLocation() {
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
  `
})
export class PopoverPage {
  private mapMode: any;

  constructor(public viewCtrl: ViewController, params: NavParams) {
    this.mapMode = params.data.mapMode;


  }



  close() {
    this.viewCtrl.dismiss({ mapMode: this.mapMode });
  }
}
