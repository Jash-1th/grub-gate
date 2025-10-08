// Test file to verify DatePicker functionality
import React from 'react';
import DatePicker from './DatePicker';

// Simple test component to verify DatePicker works with future dates
const DatePickerTest = () => {
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">DatePicker Test - Future Dates Enabled</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
        <h2 className="text-lg font-semibold mb-4">Select Any Date (Past or Future)</h2>
        
        <DatePicker
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          placeholder="Select any date"
          className="w-full"
        />
        
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <h3 className="font-medium">Selected Date:</h3>
          <p className="text-sm text-gray-600">
            {selectedDate ? selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'None'}
          </p>
          
          <div className="mt-2">
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
              selectedDate > new Date() 
                ? 'bg-blue-100 text-blue-800' 
                : selectedDate.toDateString() === new Date().toDateString()
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {selectedDate > new Date() 
                ? 'Future Date' 
                : selectedDate.toDateString() === new Date().toDateString()
                ? 'Today'
                : 'Past Date'
              }
            </span>
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="font-medium mb-2">Quick Test Buttons:</h3>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedDate(new Date(Date.now() - 24 * 60 * 60 * 1000))}
              className="block w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              Yesterday
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="block w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDate(new Date(Date.now() + 24 * 60 * 60 * 1000))}
              className="block w-full text-left px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded text-sm"
            >
              Tomorrow ✨
            </button>
            <button
              onClick={() => setSelectedDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))}
              className="block w-full text-left px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded text-sm"
            >
              Next Week ✨
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatePickerTest;
