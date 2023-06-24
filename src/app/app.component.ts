import {Component} from '@angular/core';
import {FetchMessage, WebWorkerService} from "./web-worker";
import {filter} from "rxjs";
import {WebWorkerStates} from "./web-worker/web-worker.types";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public workersStates?: WebWorkerService['workersStates']
  public stack: WebWorkerService['stack']

  constructor(private readonly worker: WebWorkerService) {
    this.stack = worker.seeStack;
    this.worker.loadingWorkers.pipe(filter((res) => !res)).subscribe(() => {
      this.workersStates = this.worker.workersStates;
      this.worker.workersResponses?.subscribe(({data, id, key}) => {
        console.log('Key:', key);
        console.log('Id:', id);
        console.log('Data:', data);
      })

      const fn = function () {
        const originalValue = {
          a: 'adasd',
          b: 2,
          c: function () {
            console.log(this);
            return fetch(`https://swapi.dev/api/people/${this.b}`).then((res) => res.json());
          },
          d: new Map()
        };

        return originalValue.c();
      }

      const stackCheck = 100;

      for (let i = 0; i < stackCheck; i++) {
        this.worker.sendMessage(FetchMessage(`Call ${i}`, {
          input: `https://swapi.dev/api/people/${i + 1}`
        }))
      }
    })


  }

  setStateIcon(state: WebWorkerStates) {
    switch (state) {
      case WebWorkerStates.Done:
        return "🟢";
      case WebWorkerStates.Error:
        return '❌';
      case WebWorkerStates.Waiting:
        return '🟡'
      case WebWorkerStates.Working:
        return '🟣'
    }
  }

}

