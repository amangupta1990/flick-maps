import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HomePage, PopoverPage } from '../pages/home/home';
import { MapComponentPage } from '../pages/map-component/map-component';
import { ImageComponentPage } from '../pages/image-component/image-component';
import {JsonpModule} from '@angular/http';
import {Animations } from '../pages/animations';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    MapComponentPage,
    ImageComponentPage,
    PopoverPage


  ],
  imports: [
    IonicModule.forRoot(MyApp),
    JsonpModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    MapComponentPage,
    ImageComponentPage,
    PopoverPage
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler},Animations]
})
export class AppModule {}
