import { BadRequestException, Logger } from '@nestjs/common';
import { ServiceConfig } from '../service.types';
import axios from 'axios';

export const eventbrite: ServiceConfig = {
  name: 'eventbrite',
  color: '#F05537',
  auth: {
    type: 'webhook',
    hint: 'An url will be suplied during area creation',
  },
  actions: [
    {
      title: 'Attendee updated',
      name: 'attendee.updated',
      description: 'Triggered for each attendee check-in/check-out and update',
      form: [],
      trigger: {
        request: async () => {
          return null;
        },
        condition(currentState: any, previousState: any) {
          return currentState.config.action == 'attendee.updated';
        },
      },
    },
    {
      title: 'Barcode scanned for check-in',
      name: 'barcode.checked_in',
      description: "Triggered for each attendee's barcode checking in an event",
      form: [],
      trigger: {
        request: async () => {
          return null;
        },
        condition(currentState: any, previousState: any) {
          return currentState.config.action == 'barcode.checked_in';
        },
      },
    },
    {
      title: 'Barcode scanned for check-out',
      name: 'barcode.un_checked_in',
      description: "Triggered for each attendee's barcode checking ou an event",
      form: [],
      trigger: {
        request: async () => {
          return null;
        },
        condition(currentState: any, previousState: any) {
          return currentState.config.action == 'barcode.un_checked_in';
        },
      },
    },
    {
      title: 'An event is created',
      name: 'event.created',
      description: 'Triggered for each events created on the account',
      form: [],
      trigger: {
        request: async () => {
          return null;
        },
        condition(currentState: any, previousState: any) {
          return currentState.config.action == 'event.created';
        },
      },
    },
    {
      title: 'An event is published',
      name: 'event.published',
      description: 'Triggered for each events published on the account',
      form: [],
      trigger: {
        request: async () => {
          return null;
        },
        condition(currentState: any, previousState: any) {
          return currentState.config.action == 'event.published';
        },
      },
    },
    {
      title: 'An event is unpublished',
      name: 'event.unpublished',
      description: 'Triggered for each events unpublished on the account',
      form: [],
      trigger: {
        request: async () => {
          return null;
        },
        condition(currentState: any, previousState: any) {
          return currentState.config.action == 'event.unpublished';
        },
      },
    },
    {
      title: 'An event is updated',
      name: 'event.updated',
      description: 'Triggered for each events update on the account',
      form: [],
      trigger: {
        request: async () => {
          return null;
        },
        condition(currentState: any, previousState: any) {
          return currentState.config.action == 'event.updated';
        },
      },
    },
    {
      title: 'Order placed',
      name: 'order.placed',
      description:
        'Triggered for each orders placed on an event of the account',
      form: [],
      trigger: {
        request: async () => {
          return null;
        },
        condition(currentState: any, previousState: any) {
          return currentState.config.action == 'order.placed';
        },
      },
    },
    {
      title: 'Order refunded',
      name: 'order.refunded',
      description:
        'Triggered for each refunded order on an event of the account',
      form: [],
      trigger: {
        request: async () => {
          return null;
        },
        condition(currentState: any, previousState: any) {
          return currentState.config.action == 'order.refunded';
        },
      },
    },
    {
      title: 'Order updated',
      name: 'order.updated',
      description:
        'Triggered for each updates of order on an event of the account',
      form: [],
      trigger: {
        request: async () => {
          return null;
        },
        condition(currentState: any, previousState: any) {
          return currentState.config.action == 'order.updated';
        },
      },
    },
    {
      title: 'Organizer updated',
      name: 'organizer.updated',
      description:
        'Triggered for each updates concerning organizer on an event of the account',
      form: [],
      trigger: {
        request: async () => {
          return null;
        },
        condition(currentState: any, previousState: any) {
          return currentState.config.action == 'organizer.updated';
        },
      },
    },
    {
      title: 'Ticket-class created',
      name: 'ticket_class.created',
      description:
        'Triggered for each ticket class created on an event of the account',
      form: [],
      trigger: {
        request: async () => {
          return null;
        },
        condition(currentState: any, previousState: any) {
          return currentState.config.action == 'ticket_class.created';
        },
      },
    },
    {
      title: 'Ticket-class deleted',
      name: 'ticket_class.deleted',
      description:
        'Triggered for each ticket class deleted on an event of the account',
      form: [],
      trigger: {
        request: async () => {
          return null;
        },
        condition(currentState: any, previousState: any) {
          return currentState.config.action == 'ticket_class.deleted';
        },
      },
    },
    {
      title: 'Ticket-class updated',
      name: 'ticket_class.updated',
      description:
        'Triggered for each ticket class updated on an event of the account',
      form: [],
      trigger: {
        request: async () => {
          return null;
        },
        condition(currentState: any, previousState: any) {
          return currentState.config.action == 'ticket_class.updated';
        },
      },
    },
    {
      title: 'Venue updated',
      name: 'venue.updated',
      description: 'Triggered for each venue update on an event of the account',
      form: [],
      trigger: {
        request: async () => {
          return null;
        },
        condition(currentState: any, previousState: any) {
          return currentState.config.action == 'venue.updated';
        },
      },
    },
  ],
  reactions: [],
};
