import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HomePage, PopoverPage } from '../pages/home/home';
import { MapComponent } from '../pages/map-component/map-component';
import { ImageComponent ,ImageViewer } from '../pages/image-component/image-component';
import {JsonpModule} from '@angular/http';


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    MapComponent,
    ImageComponent,
    PopoverPage,
    ImageViewer


  ],
  imports: [
    IonicModule.forRoot(MyApp),
    JsonpModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    MapComponent,
    ImageComponent,
    PopoverPage,
    ImageViewer
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}]
})
export class AppModule {}
