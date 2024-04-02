const form = document.getElementById("dateForm");
const outputDiv = document.getElementById("output");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    outputDiv.textContent = "Invalid date format. Please use YYYY-MM-DD.";
    return;
  }

  const apiKey = "VIV40r1lZbqZHXjORum0RTxujiXgfK0hqkIfyBUS";

  const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${apiKey}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      let output = "" ;

      if (
        data.near_earth_objects === undefined ||
        Object.keys(data.near_earth_objects).length === 0
      ) {
        output +=
          `<div class="alert fixed-top alert-danger" role="alert">
          Range of date should be <strong>Less then or Equal to 7</strong>
        </div>`;
      } else {

        output = "<h5>Successfully Data Fatched !!!</h5>" ;

        const sortedDates = Object.keys(data.near_earth_objects).sort();

        const fastest = findFastestAsteroid(data.near_earth_objects);

        const closest = findClosestAsteroid(data.near_earth_objects);

        const average = calculateAverageSize(data.near_earth_objects);

        // for (const date of sortedDates) {
        //   const neos = data.near_earth_objects[date];
        //   output += `<h3>${date} (Total: ${neos.length})</h3>`;
        // }

        const labels = sortedDates; 

        const nearEarthObjectCounts = []; 

        for (const date of sortedDates) {
            nearEarthObjectCounts.push(data.near_earth_objects[date].length);
        }



        const ctx = document.getElementById("myChart").getContext("2d");

        const myChart = new Chart(ctx, {
          type: "bar", 
          data: {
            labels: labels,
            datasets: [
              {
                label: "Near Earth Objects",
                data: nearEarthObjectCounts,
                backgroundColor: "#F2613F", 
              },
            ],
          },
          options: {
            scales: {
              yAxes: [
                {
                  ticks: {
                    beginAtZero: true, // Start y-axis at 0
                  },
                },
              ],
            },
          },
        });
        

        output += `<h2>Fastest Asteroid</h2>`;
        output += `<ul>`;
        output += `<li>Name: ${fastest.name}</li>`;
        output += `<li>Speed: ${fastest.speed} kilometers per hour</li>`;
        output += `</ul>`;

        output += `<h2>Closest Asteroid from Earth</h2>`;
        output += `<ul>`;
        output += `<li>Name: ${closest.name}</li>`;
        output += `<li>Distance: ${closest.distance} kilometers</li>`;
        output += `</ul>`;

        output += `<h2>Average size of  Asteroids near Earth</h2>`;
        output += `<ul>`;
        output += `<li>Average Size of Asteroids Near Earth: ${average} meters</li>`;
        output += `</ul>`;
      }

      outputDiv.innerHTML = output;
    })
    .catch((error) => {
      outputDiv.textContent = "Error fetching data: " + error;
      console.error(error);
    });
});

function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(dateString);
}

function findFastestAsteroid(data) {
  let fastestSpeed = 0;
  let fastestAsteroid;

  for (const nearEarthObject of Object.values(data)) {
    for (const asteroid of nearEarthObject) {
      for (const check of asteroid.close_approach_data) {
        const speed = check.relative_velocity.kilometers_per_hour;
        if (speed > fastestSpeed) {
          fastestSpeed = speed;
          fastestAsteroid = asteroid;
        }
      }
    }
  }

  return {
    name: fastestAsteroid?.name || "No data available",
    speed: fastestSpeed,
  };
}

const findClosestAsteroid = (data) => {
  let closestDistance = Infinity;
  let closestAsteroid;

  for (const nearEarthObject of Object.values(data)) {
    for (const asteroid of nearEarthObject) {
      for (const check of asteroid.close_approach_data) {
        const distance = check.miss_distance.kilometers;
        if (distance < closestDistance) {
          closestDistance = distance;
          closestAsteroid = asteroid;
        }
      }
    }
  }

  return {
    name: closestAsteroid?.name || "No data available",
    distance: closestDistance,
  };
};

const calculateAverageSize = (data) => {
  let totalSize = 0;
  let asteroidCount = 0;

  for (const nearEarthObject of Object.values(data)) {
    for (const asteroid of nearEarthObject) {
      // console.log(asteroid.estimated_diameter.meters.estimated_diameter_max)
      const diameter =
        asteroid.estimated_diameter.meters.estimated_diameter_max;
      totalSize += diameter;
      asteroidCount++;
    }
  }

  const averageSize = totalSize / asteroidCount;
  // console.log(averageSize)
  return averageSize;
};


function refreshPage() {
  location.reload();
}

document.getElementById("refreshButton").addEventListener("click", refreshPage);