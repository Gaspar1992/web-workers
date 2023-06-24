import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {WebWorkerModule} from "./web-worker";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    WebWorkerModule.forRoot({
      numberWorkers: 5,
      debug: true
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
