import { Component, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { NavController, NavParams ,ToastController,AlertController} from 'ionic-angular';
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
export class MapComponent {
 @Output() newLocation: EventEmitter<Object> = new EventEmitter<Object>();
@Output() searching: EventEmitter<any> = new EventEmitter<any>();
@Output() zoomed: EventEmitter<string> = new EventEmitter<string>();
  private mapObj; 
  private mapCenter:any = { lat: 28.635308, lng: 77.22496 };
  private prevMarker: any = null;
  private mapMode:string = 'tap';
  private mapDragging:boolean = false;
  private emitterTimeout:any;
  private zoomLevel = 'street';
  private defaultZoom = 15;
  constructor(public navCtrl: NavController, public navParams: NavParams, private ele: ElementRef,public toastCtrl: ToastController,public alertController:AlertController) {
  
    // let the image componenet adjust to the default accuracy
    this.zoomed.emit(this.zoomLevel);
  }

  ngOnInit(){
    this.initMap();
  }

  initMap() {
    let ctx = this; // incase this gets lost
    // set initial location and center
    this.mapObj = new google.maps.Map(this.ele.nativeElement.querySelector('#map'), {
      center: this.mapCenter,
      zoom: this.defaultZoom,
      draggable:true
    });
    


    // when map drag starts , singnal for the image viewer to slide away

       google.maps.event.addListener(ctx.mapObj,'dragstart', () => {
         this.mapDragging= true;
      ctx.searching.emit(true);
  
    });

       google.maps.event.addListener(ctx.mapObj,'drag', () => {
         this.mapDragging= true;
 
  
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

    //make sure the image fetch does not fire while dragging!
      google.maps.event.addListener(ctx.mapObj,'dragging', () => {
        if(this.emitterTimeout)
         window.clearTimeout(this.emitterTimeout);
      })

    // stop the animation once the drag ends
            google.maps.event.addListener(ctx.mapObj,'dragend', () => {
       this.mapDragging= false;
              if(ctx.mapMode=='drag')
              {
                // for throttling while the user drags the map around
                  if(this.emitterTimeout)
                  window.clearTimeout(this.emitterTimeout);

                 this.emitterTimeout =  window.setTimeout(()=>{this.emitLocation()},1200);
               
              
              }
       

        });


        google.maps.event.addListener(ctx.mapObj, 'click', function(event) {
            ctx.searching.emit(true);
          if(ctx.mapMode=='tap' && !ctx.mapDragging)
   ctx.placeMarker(event.latLng);
});

          google.maps.event.addListener(ctx.mapObj, 'zoom_changed', function(event) {
            ctx.searching.emit(true);
          
             let zoom = ctx.mapObj.getZoom();
             if(zoom < 22 && zoom > 15 ){ ctx.zoomLevel = 'street';} // street level
             else if(zoom < 15 && zoom > 10 ){ ctx.zoomLevel = 'city'; } //city level
             else  if(zoom < 10 && zoom > 6 ){ctx.zoomLevel = 'country';} // country levl
             else  if(zoom < 5 && zoom > 1 ){ctx.zoomLevel = 'world';} // world level
             ctx.zoomed.emit(ctx.zoomLevel);
             ctx.emitLocation();
           
});
  

this.emitLocation();

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
    this.searching.emit()// odd , but just resuing it here .. hehe
   if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((location) => { 
        this.setMap(location) }, 
        error =>{  

          let alert = this.alertController.create({
          title: 'Location unavailable',
          subTitle: 'Either you need to turn on your device location , or check whther it has been blocked for this site.',
          buttons: ['Dismiss']
           });
  alert.present();
          console.log(error);
        }
        , { enableHighAccuracy: true });
    }
  }

  setMap(pos) {
    let cords = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    }
    this.mapObj.setCenter(cords);
    this.mapObj.setZoom(this.defaultZoom);
    this.mapCenter = cords;

    if(this.mapMode=='tap')
    this.placeMarker(new google.maps.LatLng(cords.lat, cords.lng));
    this.emitLocation();
  }

  setMapMode(mode){
    if(mode == this.mapMode) return;
    this.mapMode = mode;
    let message = ''
    if(this.mapMode == 'tap'){
      message = this.mapMode+' mode: click on the map to place the marker';
      
    }
    else {
      message =this.mapMode+ ' mode: drag the map to positon the marker';
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
 // start fetching images only after the message goes
  toast.onDidDismiss(()=>{

    if(this.mapMode == 'tap')
    this.placeMarker(this.mapObj.getCenter());
    else
    this.emitLocation();
  })
  
  }

}



