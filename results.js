// results.js

document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const origin = urlParams.get('origin');
    const destination = urlParams.get('destination');

    console.log('Origin:', origin);
    console.log('Destination:', destination);

    const jsonFiles = [
        'json/alappuzha.json',
        'json/attingal.json',
        'json/ernakulam.json',
        'json/idukki.json',
        'json/kannur.json',
        'json/kottayam.json',
        'json/kozhikkode.json',
        'json/malapuram.json',
        'json/muvattupuzha.json',
        'json/palakkad-1.json',
        'json/palakkad-2.json',
        'json/pathanamthitta.json',
        'json/vadakara.json',
        'json/wayanad.json'
      ];

    // Fetch data from each JSON file
    Promise.all(jsonFiles.map(file => fetch(file).then(response => response.json())))
        .then(jsonDataArray => {
            console.log('Fetched JSON data:', jsonDataArray);
            const filteredSchedules = filterSchedules(jsonDataArray, origin, destination);

            // Display results
            displayResults(filteredSchedules, origin, destination);
        })
        .catch(error => console.error('Error fetching JSON:', error));
});

function filterSchedules(jsonDataArray, origin, destination) {
    const filteredSchedules = [];

    jsonDataArray.forEach(data => {
        const busSchedules = data.busSchedules;

        busSchedules.forEach(schedule => {
            const route = schedule.route;
            const originIndex = route.indexOf(origin);
            const destinationIndex = route.indexOf(destination);

            // Ensure that the selected origin comes before the destination in the route
            if (originIndex !== -1 && destinationIndex !== -1 && originIndex < destinationIndex) {
                const matchingStations = schedule.schedule.filter(trip =>
                    isOrderedStations(route, trip.stations, origin, destination)
                );

                if (matchingStations.length > 0) {
                    filteredSchedules.push({
                        busNumber: schedule['Vehicle Number'],
                        busName: schedule['Vehicle Name'],
                        tripDetails: matchingStations,
                    });
                }
            }
        });
    });

    return filteredSchedules;
}

function isOrderedStations(route, stations, origin, destination) {
    const originIndex = route.indexOf(origin);
    const destinationIndex = route.indexOf(destination);

    const originStationIndex = stations.findIndex(station => station.station === origin);
    const destinationStationIndex = stations.findIndex(station => station.station === destination);

    return (
        originStationIndex !== -1 &&
        destinationStationIndex !== -1 &&
        originStationIndex < destinationStationIndex &&
        originIndex < destinationIndex
    );
}

function displayResults(schedules, origin, destination) {
    const resultsContainer = document.getElementById('results-container');

    if (schedules.length > 0) {
        schedules.forEach(schedule => {
            const busNumber = schedule.busNumber;
            const busName = schedule.busName || '';

            schedule.tripDetails.forEach(trip => {
                const container = document.createElement('div'); // Create a container for each table
                container.classList.add('result-table-container');

                const table = document.createElement('table');
                const tbody = document.createElement('tbody');

                trip.stations.forEach((station, index) => {
                    const row = document.createElement('tr');

                    if (index === 0) {
                        // rowspan for the first row
                        const rowspan = trip.stations.length;
                        row.innerHTML += `
                            <td rowspan="${rowspan}">${makeBoldIfSelected(busNumber, origin, destination)}</td>
                            <td rowspan="${rowspan}">${makeBoldIfSelected(busName, origin, destination)}</td>
                        `;
                    }

                    row.innerHTML += `
                        <td>${makeBoldIfSelected(station.station, origin, destination)}</td>
                        <td>${makeBoldIfSelected(station.arrivalTime, origin, destination)}</td>
                        <td>${makeBoldIfSelected(station.departureTime, origin, destination)}</td>
                    `;

                    tbody.appendChild(row);
                });

                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>Bus Number</th>
                            <th>Bus Name</th>
                            <th>Stop</th>
                            <th>Arrival Time</th>
                            <th>Departure Time</th>
                        </tr>
                    </thead>
                `;
                table.appendChild(tbody);

                container.appendChild(table);
                resultsContainer.appendChild(container);
            });
        });
    } else {
        resultsContainer.innerHTML = '<p>No bus found for the selected stops!</p>';
    }
}




function makeBoldIfSelected(value, origin, destination) {
    // Make the selected dropdown values bold
    if (value === origin || value === destination) {
        return `<strong>${value}</strong>`;
    } else {
        return value;
    }
}
