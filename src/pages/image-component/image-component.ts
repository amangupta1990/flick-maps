import { Component , Input,Output, EventEmitter, NgZone , ElementRef } from '@angular/core';
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
private state = 'inactive';
private searchRadius = 2; 
private scrollWidth = '0px';
 private images = [];
 private toast:any;
 private containerWidth: number; 
 private imageMaxHeight: number;// to make sure the horizontal scroll is scaled enough 
 private offsetXObservable:any;
 private hScrollEle:any = null;
 private scrollEndObservable: Observable<boolean>;
 private scrollEndListner: any;
 private page: number = 1;
 private currentLocation:any;
 private requestActive:boolean = false;
 private loaderVisible:boolean = true;
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

 


    loadPicturesFromLocation(loc: any) {
   // if the location has changed , reset the page
   this.page = loc == this.currentLocation? this.page: 1;
   this.currentLocation = loc;   
   let url  = `https://api.flickr.com/services/rest/?
   method=flickr.photos.search&api_key=8f9a7fbeb0f9e5e1116cbafd4d8b20c4&
   has_geo=true&
   in_gallery=true&
   radius=${this.searchRadius}&
   accuracy=11&
   content_type=1&
   radius_units=km&
   page=${this.page}&
   per_page=25&
   lat=${this.currentLocation .lat}&
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
  let imgColl = [];
  images.map(img=>{

  this.images.push(img);

  });


  this.scrollWidth = (this.images.length+1)*(this.containerWidth+1)+'em'; 


   });
}

loadImages(images){
  this._ngZone.run(() => {
  this.scrollWidth = (images.length+1)*(this.containerWidth+1)+'em'; // +1 for the loader at the end
  this.images= images;
  if(!this.hScrollEle)
  // cannot do the initialization in the constuctor because this gets called first :\
  this.hScrollEle = this.initScroller();
  let scrolled = this.hScrollEle.scrollLeft;
  this.hScrollEle.scrollLeft=-1*scrolled;
  // just need to tell the home component to show the viewer;
  this.imagesLoaded.emit();

   });
}

setSearchRadius(searchRadius){
  this.searchRadius = searchRadius;
}

initScroller(){
 
var ctx = this;
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

openImage(src:string){
     let imageModal = this.modalController.create(ImageViewer, { src: src });
   imageModal.onDidDismiss(data => {
    // nothing need to be done here.
   });
   imageModal.present();
 }


}




@Component({
  selector: 'image-viewer',
  template: `<div class="backdrop"><img  [src]='src'/><div>
  
            <ion-fab  right top>
            <button (click)="dismiss()" ion-fab mini ><ion-icon name="close"></ion-icon></button>
            </ion-fab>`
})
export class ImageViewer {
private src:string;
 constructor(params: NavParams , private viewCtrl:ViewController) {
   this.src = params.data.src;
 }

 dismiss() {

   this.viewCtrl.dismiss();
 }
}
