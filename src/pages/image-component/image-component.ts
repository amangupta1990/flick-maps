import { Component , Input,Output, EventEmitter, NgZone } from '@angular/core';
import { Jsonp  } from '@angular/http';
import { NavController, ToastController  } from 'ionic-angular';
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
export class ImageComponentPage {
  @Output() imagesLoaded: EventEmitter<any> = new EventEmitter();
private state = 'inactive';
private searchRadius = 2; 
private scrollWidth = '0px';
 private images = [];
 private toast:any;
  constructor(public navCtrl: NavController, public toastCtrl: ToastController,private req:Jsonp,private _ngZone: NgZone) {


      window.jsonFlickrApi = this.jsonFlickrApi.bind(this);
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ImageComponentPage');
  }


    updateLocation(loc: any) {
   let url  = `https://api.flickr.com/services/rest/?
   method=flickr.photos.search&api_key=369df62e04d65f5093cfadee5ad89b30&
   has_geo=true&
   in_gallery=true&
   radius=${this.searchRadius}&
   accuracy=11&
   content_type=1&
   radius_units=km&
   per_page=25&
   lat=${loc.lat}&
   lon=${loc.lng}&format=json&
   callback=JSONP_CALLBACK`;
   console.log(url);
   this.getPictures(url)
    }

    getPictures(url){

     this.toast = this.toastCtrl.create({
    message: 'fetching images',
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
    message: 'Nothing to show here!',
    duration: 2000,
    position: 'bottom'
  });  
  this.toast.present();
  return;
     }              

  let photos = rsp.photos.photo.map(photo=>{

  
    let img  = {url: `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_m.jpg`,
                title: photo.title
    }
    return img;
  });

  this.loadImages(photos);
  
}


loadImages(images){
  this._ngZone.run(() => {
      this.scrollWidth = images.length*200+'px';
  this.images= images;
  // just need to tell the home component to show the viewer;
  this.imagesLoaded.emit();

   });
}

setSearchRadius(searchRadius){
  this.searchRadius = searchRadius;
}

}
