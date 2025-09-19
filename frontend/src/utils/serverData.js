/**
 * Server-side data fetching utilities
 * This module provides functions to fetch data on the server and hydrate it on the client
 */

import React, { useEffect, useState } from 'react';

// This function is called on the server to fetch initial data
export async function fetchInitialData() {
  // In a real app, this would fetch data from your API
  // For now, we'll return some static data
  return {
    popularDishes: [
      {
        id: 1,
        name: 'Gourmet Burger',
        description: 'Juicy beef patty with fresh vegetables and special sauce',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
        rating: 4.8,
        price: 12.99,
      },
      {
        id: 2,
        name: 'Margherita Pizza',
        description: 'Classic Italian pizza with fresh basil and mozzarella',
        image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=500&q=80',
        rating: 4.7,
        price: 14.99,
      },
      {
        id: 3,
        name: 'Sushi Platter',
        description: 'Assorted fresh sushi with wasabi and soy sauce',
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=80',
        rating: 4.9,
        price: 18.99,
      },
    ],
    statistics: {
      totalRestaurants: 500,
      happyCustomers: 10000,
      deliveryAreas: 25,
      orderCount: 50000,
    },
  };
}

// This function is called on the client to get the initial data
export function getInitialData() {
  if (typeof window !== 'undefined' && window.__INITIAL_STATE__) {
    return window.__INITIAL_STATE__;
  }
  return null;
}

// This function is used to initialize the page with server data
export function useServerData(key) {
  const [data, setData] = React.useState(() => {
    const initialData = getInitialData();
    return initialData ? initialData[key] : null;
  });

  // If we're on the client and the data wasn't in the initial state,
  // we need to fetch it
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !data) {
      // Fetch fallback data instead of just warning
      const fetchFallbackData = async () => {
        try {
          const fallbackData = await fetchInitialData();
          if (fallbackData[key]) {
            setData(fallbackData[key]);
          }
        } catch (error) {
          console.error(`Error fetching fallback data for key: ${key}`, error);
        }
      };
      
      fetchFallbackData();
    }
  }, [key, data]);

  return data;
}
