document.addEventListener("DOMContentLoaded", function () {
    const jsonFiles = ['attingal.json', 'ernakulam.json', 'pathanamthitta.json']; // Add your file paths here

    // Fetch data from each JSON file
    Promise.all(jsonFiles.map(file => fetch(file).then(response => response.json())))
        .then(jsonDataArray => {
            // Populate searchable dropdowns with unique and sorted stations
            initializeSearchableDropdown(jsonDataArray, 'origin');
            initializeSearchableDropdown(jsonDataArray, 'destination');
        })
        .catch(error => console.error('Error fetching JSON:', error));
});

function initializeSearchableDropdown(jsonDataArray, dropdownId) {
    const dropdown = $(`#${dropdownId}`);

    // Get unique and sorted stations
    const uniqueStations = getUniqueStations(jsonDataArray);
    uniqueStations.sort();

    // Initialize Select2 with searchable options
    dropdown.select2({
        data: uniqueStations.map(station => ({ id: station, text: station })),
        width: '100%', // Adjust the width as needed
        placeholder: `Select ${dropdownId.charAt(0).toUpperCase() + dropdownId.slice(1)}...`
    });
}

function getUniqueStations(jsonDataArray) {
    const allStations = new Set();

    // Collect all stations from the JSON data
    jsonDataArray.forEach(data => {
        const busSchedules = data.busSchedules;

        busSchedules.forEach(schedule => {
            const route = schedule.route;
            route.forEach(station => allStations.add(station));
        });
    });

    // Convert the set to an array and return unique stations
    return Array.from(allStations);
}

function showResults() {
    const originDropdown = $('#origin');
    const destinationDropdown = $('#destination');
    const originValue = originDropdown.val();
    const destinationValue = destinationDropdown.val();

    // Redirect to results.html with query parameters
    window.location.href = `results.html?origin=${originValue}&destination=${destinationValue}`;
}
