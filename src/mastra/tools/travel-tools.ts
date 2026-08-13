import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const getFlightBooking = createTool({
  id: 'get_flight_booking',

  description:
    'Return flight booking details between two cities.',

  inputSchema: z.object({
    origin: z
      .string()
      .describe('The departure city.'),

    destination: z
      .string()
      .describe('The destination city.'),
  }),

  execute: async ({ origin, destination }) => {
    return {
      origin,
      destination,
      trip_type: 'Round Trip',
      departure_duration_hours: 5.5,
      return_duration_hours: 5.5,
      total_flight_duration_hours: 11.0,
      ticket_price_usd: 720.0,
      currency: 'USD',
    };
  },
});

export const getHotelBooking = createTool({
  id: 'get_hotel_booking',

  description:
    'Return hotel booking details.',

  inputSchema: z.object({
    city: z
      .string()
      .describe('The city where the hotel is required.'),

    nights: z
      .number()
      .int()
      .nonnegative()
      .describe('Number of nights for the hotel booking.'),
  }),

  execute: async ({ city, nights }) => {
    const pricePerNight = 120.0;

    return {
      city,
      nights,
      price_per_night_usd: pricePerNight,
      hotel_cost_usd: nights * pricePerNight,
      currency: 'USD',
    };
  },
});

export const convertCurrency = createTool({
  id: 'convert_currency',

  description:
    'Convert between supported currencies.',

  inputSchema: z.object({
    from_currency: z
      .string()
      .describe('The currency to convert from, such as USD.'),

    to_currency: z
      .string()
      .describe('The currency to convert to, such as NGN.'),

    amount: z
      .number()
      .describe('The amount to convert.'),
  }),

  execute: async ({
    from_currency,
    to_currency,
    amount,
  }) => {
    const exchangeRates: Record<string, number> = {
      'USD:NGN': 1600,
      'NGN:USD': 1 / 1600,
      'USD:GBP': 0.75,
      'GBP:USD': 1.33,
    };

    const from = from_currency.toUpperCase();
    const to = to_currency.toUpperCase();

    const key = `${from}:${to}`;

    if (!(key in exchangeRates)) {
      return {
        error: `Conversion from ${from_currency} to ${to_currency} is not supported.`,
      };
    }

    const rate = exchangeRates[key];

    return {
      from,
      to,
      amount,
      converted_amount: Math.round(amount * rate * 100) / 100,
      exchange_rate: rate,
    };
  },
});