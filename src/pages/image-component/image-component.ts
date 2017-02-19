import { Component ,Output, EventEmitter, NgZone , ElementRef } from '@angular/core';
import { Jsonp  } from '@angular/http';
import { NavController, ToastController, ModalController, NavParams,ViewController } from 'ionic-angular';
import {Observable}     from 'rxjs/Observable';

import 'rxjs/Rx';
declare var window;
// implement the flicker reposne function:




/*
  Generated class for the ImageComponent page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-image-component',
  templateUrl: 'image-component.html'
})
export class ImageComponent {
  @Output() imagesLoaded: EventEmitter<any> = new EventEmitter();

private searchRadius = 0.2; 
private scrollWidth = '0px';
 private images = [];
 private toast:any;
 private containerWidth: number; 
 private imageMaxHeight: number;// to make sure the horizontal scroll is scaled enough 
 private hScrollEle:any = null;
 private scrollEndObservable: Observable<boolean>;
 private scrollEndListner: any;
 private page: number = 1;
 private currentLocation:any;
 private requestActive:boolean = false;
 private loaderVisible:boolean = true;
 private accuracy:number= 11;
  constructor(private modalController:ModalController ,private elementRef:ElementRef, public navCtrl: NavController, public toastCtrl: ToastController,private req:Jsonp,private _ngZone: NgZone) {
      // configure image container  widths by device height
      let windowHeight = window.innerHeight;

      if(windowHeight <=480 )
      this.containerWidth = 8; // em
      else
      this.containerWidth = 15; //em

      this.imageMaxHeight = this.containerWidth;

      window.jsonFlickrApi = this.jsonFlickrApi.bind(this);

     
  }

  setAccuracy(zoom){
 
    // set accuracy
    switch(zoom.zoomLevel){
      case 'street': this.accuracy = 11; break;
      case 'city' : this.accuracy = 11; break;
      case 'country' : this.accuracy = 3; break;
      case 'world' : this.accuracy = 1; break;
    }

    this.searchRadius = Math.round( ((23 - zoom.zoomValue)/(this.accuracy) ) * 100 )/100;
    this.page=1; // start searching for pictures again
  }


    loadPicturesFromLocation(loc: any) {
   // if the location has changed , reset the page
   this.page = loc == this.currentLocation? this.page: 1;
   this.currentLocation = loc;   
   //show the spinner
   this.loaderVisible = true;
   let url  = `https://api.flickr.com/services/rest/?
   method=flickr.photos.search&api_key=8f9a7fbeb0f9e5e1116cbafd4d8b20c4&
   has_geo=true&
   in_gallery=true&
   tags=food,restraunt,hotel,cafe,fastfood,streetfood,heritage,monument,clubs,club,art,music,craft,handtcraft,plays,pub,pubs&
   radius=${this.searchRadius}&
   accuracy=${this.accuracy}&
   content_type=1&
   radius_units=km&
   page=${this.page}&
   per_page=25&
   lat=${  this.currentLocation .lat}&
   lon=${this.currentLocation .lng}&format=json&
   callback=JSONP_CALLBACK`;
   console.log(url);
   this.getPictures(url)
    }

    getPictures(url){
      this.loaderVisible = true;
      this.requestActive = true;
     this.toast = this.toastCtrl.create({
    message: this.page == 1? 'fetching images' : 'loading..',
    duration: null,
    position: 'bottom'
  });  

  this.toast.present();
  
   return this.req.get(url).subscribe(
                (data) => {
                    console.log(data);
                  
                },
                (error) => {
                    console.log(error);
                    
                });
  }


jsonFlickrApi(rsp){

	if (rsp.stat != "ok"){
       this.toast.dismiss();
       this.toast  = this.toastCtrl.create({
    message: 'Error occured, try again later',
    duration: 2000,
    position: 'bottom'
  });  
  this.toast.present();
		// something broke!
		return;
	}
    if(rsp.photos.photo.length)
    this._ngZone.run(()=>{
                    this.toast.dismiss();
                    })

     else {

   // first dismiss the first toast 

   this.toast.dismiss();

   this.toast  = this.toastCtrl.create({
    message: this.page==1? 'Nothing to show here!': 'No more images to show here!',
    duration: 2000,
    position: 'bottom'
  });  
  this.loaderVisible = false;
  this.toast.present();
  return;
     }              

  let photos = rsp.photos.photo.map(photo=>{

  
    let img  = {thumbnail: `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_m.jpg`,
                url: `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_b.jpg`,
                title: photo.title,
                ready:false
    }
    return img;
  });

    this.requestActive = false;

  if(this.page == 1)
  this.loadImages(photos);
  else this.pushImages(photos);
  this.page+= 1;
  
}

pushImages(images){
  this._ngZone.run(() => {
// +1 for the loader at the end
  images.map(img=>{

  this.images.push(img);

  });


  this.scrollWidth = (this.images.length+1)*(this.containerWidth+1)+'em'; 


   });
}

loadImages(images){
  this._ngZone.run(() => {
  let testWidth  = (images.length+1)*(this.containerWidth+1);// in order to hide the spinner ;  
  this.scrollWidth = (images.length+1)*(this.containerWidth+1)+'em'; // +1 for the loader at the end
  this.images= images;
  if(!this.hScrollEle)
  // cannot do the initialization in the constuctor because this gets called first :\
  this.hScrollEle = this.initScroller();
  let scrolled = this.hScrollEle.scrollLeft;
  this.hScrollEle.scrollLeft=-1*scrolled;


  // if the number of images are less than the client width: hide the loader
  if(testWidth <= this.hScrollEle.clientWidth )  this.loaderVisible = false;
  // just need to tell the home component to show the viewer;
  this.imagesLoaded.emit();

   });
}


initScroller(){
 
let scroller =  document.querySelector('ion-footer');
// setup the observable as well;

   this.scrollEndObservable = Observable.fromEvent(scroller, 'scroll').map(() => {
      // I don't actually care about the event, I just need to get the window offset (scroll position)
      //keeping 10 as the base conversion between pixel to em
      return (scroller.scrollWidth - scroller.scrollLeft - parseFloat(getComputedStyle(scroller.querySelector('.image-placeholder')).width) <= scroller.clientWidth);
    });

    this.scrollEndListner = this.scrollEndObservable.subscribe(endReached=>{
       if(endReached && ! this.requestActive)
       this.loadPicturesFromLocation(this.currentLocation);
     
    })

    return scroller;

}

clipText(text:string){
  return text.split('').slice(0,30).join('') +  (text.length > 30? '...':'');
}

openImage(src:string,title:string){
     let imageModal = this.modalController.create(ImageViewer, { src: src, title:title });
   imageModal.onDidDismiss(data => {
    // nothing need to be done here.
   });
   imageModal.present();
 }

}




@Component({
  selector: 'image-viewer',
  template: `<div class="backdrop"><img  [src]='src'/>
              <p>{{title}}</p><div>
  
            <ion-fab  right top>
            <button (click)="dismiss()" ion-fab mini ><ion-icon name="close"></ion-icon></button>
            </ion-fab>`
})
export class ImageViewer {
private src:string;
private title:string;
 constructor(params: NavParams , private viewCtrl:ViewController) {
   this.src = params.data.src;
   this.title = params.data.title;
 }

 dismiss() {

   this.viewCtrl.dismiss();
 }


}
