import { TestBed } from '@angular/core/testing';

import { MailMessageService } from './mail-message.service';

describe('MailMessageService', () => {
  let service: MailMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MailMessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
