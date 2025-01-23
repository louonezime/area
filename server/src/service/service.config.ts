import {} from '@nestjs/common';
import { ServiceConfig } from './service.types';
import { ticketmaster } from './services/ticketmaster';
import { date_and_time } from './services/date_and_time';
import { discord } from './services/discord';
import { dropbox } from './services/dropbox';
import { eventbrite } from './services/eventbrite';
import { github } from './services/github';
import { gitlab } from './services/gitlab';
import { google } from './services/google';
import { miro } from './services/miro';
import { notion } from './services/notion';
import { slack } from './services/slack';
import { spotify } from './services/spotify';
import { steam } from './services/steam';
import { twitch } from './services/twitch';
import { ratp } from './services/ratp';

export const WEBHOOK_SERVICE = ['eventbrite'];

export const services: ServiceConfig[] = [
  date_and_time,
  discord,
  dropbox,
  eventbrite,
  github,
  gitlab,
  google,
  // mailchimp
  miro, // FIX
  notion,
  ratp,
  slack,
  spotify, // FIX
  steam,
  ticketmaster, // TEST
  twitch,
];
