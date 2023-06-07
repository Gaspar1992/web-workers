import {Component} from '@angular/core';
import {FetchMessage, FunctionMessage, WebWorkerService} from "./web-worker";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ng16';

  constructor(private readonly worker: WebWorkerService) {
    this.worker.webWorkerState$((state) => console.log(state));
    this.worker.workerResponse$(({data, id, key}) => {
      console.log('Key:', key);
      console.log('Id:', id);
      console.log('Data:', data);
    })

    const N_ACTIONS = 20;

    for (let i = 0; i < N_ACTIONS; i++) {
      this.worker.sendMessage(FetchMessage(`GET SWAPI PEOPLE ${i}`, {
        input: 'https://swapi.dev/api/people/1'
      }))
    }


    /*
    const originalValue =
      new Map([['a', {
        b: {
          c: new Map([['d', 'text']])
        }
      }]])
    ;

     */
    const originalValue = {
      a: 'adasd',
      b: 2,
      c: function () {
        return fetch('https://swapi.dev/api/people/1').then((res) => res.json());
      },
      d: new Map()
    };
    this.worker.sendMessage(FunctionMessage('FETCH FN', {
      callable: originalValue.c
    }))
  }

}

