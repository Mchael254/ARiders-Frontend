import { Component } from '@angular/core';
import { ResponsesService } from 'src/app/services/utilities/toaster/responses.service';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent {

  loading$ = this.response.loading$;
  constructor(private response: ResponsesService) { }

}
