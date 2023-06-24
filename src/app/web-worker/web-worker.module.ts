import {ModuleWithProviders, NgModule, Optional, SkipSelf} from "@angular/core";
import {WebWorkerConfig, WebWorkerService} from "./web-worker.service";
import {HttpClientModule} from "@angular/common/http";
import {WebWorkerServiceConfig} from "./web-worker.types";

@NgModule({
  imports: [HttpClientModule],
  providers: [WebWorkerService]
})
export class WebWorkerModule {
  static forRoot(config: WebWorkerServiceConfig): ModuleWithProviders<WebWorkerModule> {
    return {
      ngModule: WebWorkerModule,
      providers: [
        {
          provide: WebWorkerConfig,
          useValue: config
        }
      ]
    }
  }

  constructor(@Optional() @SkipSelf() parentModule: WebWorkerModule) {
    if (parentModule) {
      throw new Error('WebWorkerModule is already loaded. Please add it in AppModule only.');
    }
  }
}
