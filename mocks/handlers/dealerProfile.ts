import { http, HttpResponse } from 'msw';
import type { OutletList } from '@shared/api/generated/models';
import { db } from '../db';
import { apiUrl } from '../lib';

export const dealerProfileHandlers = [
  http.get<{ dealerId: string }, never, OutletList>(apiUrl('/dealers/:dealerId/outlets'), () =>
    HttpResponse.json({ items: db.outlets }),
  ),
];
