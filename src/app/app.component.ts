import {Component} from '@angular/core';
import {FetchMessage, WebWorkerService} from "./web-worker";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ng16';

  constructor(private readonly worker: WebWorkerService) {

    setTimeout(() => {

      this.worker.sendMessage(FetchMessage('GET SWAPI PEOPLE', {
        input: 'https://swapi.dev/api/people/1'
      }))

    }, 2000)

    this.worker.workerResponse?.subscribe(({data, id, key}) => {
      console.log('Key:', key);
      console.log('Id:', id);
      console.log('Data:', data);
    })
  }

}

