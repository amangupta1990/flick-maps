import { Component, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { NavController, NavParams ,ToastController} from 'ionic-angular';
declare var window: any;
declare var google: any;
/*
  Generated class for the MapComponent page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-map-component',
  templateUrl: 'map-component.html'
})
export class MapComponentPage {
 @Output() newLocation: EventEmitter<Object> = new EventEmitter<Object>();
@Output() searching: EventEmitter<any> = new EventEmitter<any>();
  private mapObj;
  private markerObj;
  private mapCenter:any;
  private prevMarker: any = null;
  private mapMode:string = 'drag';
  private mapDragging:boolean = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, private ele: ElementRef,public toastCtrl: ToastController) {
    window.initMap = this.initMap.bind(this);

  }



  initMap(response: any) {
    let ctx = this; // incase this gets lost
    // set initial location and center
    this.mapObj = new google.maps.Map(this.ele.nativeElement.querySelector('#map'), {
      center: { lat: -34.397, lng: 150.644 },
      zoom: 18,
      draggable:true
    });

   //  ctx.markerObj.setMap(ctx.mapObj);
    // get the user's current location and set it 
    this.getGeoLocation();

    // when map drag starts , singnal for the image viewer to slide away

       google.maps.event.addListener(ctx.mapObj,'dragstart', () => {
         this.mapDragging= true;
      ctx.searching.emit(true);
  
    });

    // animate the marker while the map is being dragged
   google.maps.event.addListener(ctx.mapObj,'center_changed', function(){

           let center = this.getCenter();
      let pos = {
        lat:center.lat(),
        lng:center.lng()
      }
      ctx.mapCenter  = pos;
   
    });

    // stop the animation once the drag ends
            google.maps.event.addListener(ctx.mapObj,'dragend', () => {
       this.mapDragging= false;
              if(ctx.mapMode=='drag')
          ctx.emitLocation();
       

        });


        google.maps.event.addListener(ctx.mapObj, 'click', function(event) {
            ctx.searching.emit(true);
          if(ctx.mapMode=='tap' && !ctx.mapDragging)
   ctx.placeMarker(event.latLng);
});



  }



placeMarker(location) {
  if(this.prevMarker){
     this.prevMarker.setMap(null);
  }
    this.prevMarker = new google.maps.Marker({
        position: location, 
        map: this.mapObj
    });
    let cords ={lat:location.lat(), lng:location.lng()}
    this.mapCenter = cords;
    this.emitLocation();
}

  emitLocation(){

      this.newLocation.emit(this.mapCenter);
 
  }

  getGeoLocation() {
   if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((location) => { this.setMap(location) }, null, { enableHighAccuracy: true });
    }
  }

  setMap(pos) {
    let cords = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    }
    this.mapObj.setCenter(cords);
    this.mapObj.setZoom(18);
    this.mapCenter = cords;
    this.emitLocation();
  }

  setMapMode(mode){
    this.mapMode = mode;
    let message = ''
    if(this.mapMode == 'tap'){
      message = 'click on the map to place the marker';
      this.placeMarker(this.mapObj.getCenter())
    }
    else {
      message = 'drag the map to positon the marker';
      if(this.prevMarker){
      this.mapObj.setCenter(this.prevMarker.getPosition());
      this.prevMarker.setMap(null);
      }
    }

    let toast = this.toastCtrl.create({
    message: message,
    duration: 2000,
    position: 'bottom'
  });  

  toast.present();
  
  }

}



