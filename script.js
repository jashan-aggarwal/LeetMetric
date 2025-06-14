document.addEventListener("DOMContentLoaded", function () {
  const searchButton = document.querySelector('.search-button');
  const usernameInput = document.querySelector('.username-input');
  const statsContainer = document.querySelector('.stats');
  const easyProgressCircle = document.querySelector('.easy');
  const mediumProgressCircle = document.querySelector('.medium');
  const hardProgressCircle = document.querySelector('.hard');
  const easyLabel = document.querySelector('.easy-label');
  const mediumLabel = document.querySelector('.medium-label');
  const hardLabel = document.querySelector('.hard-label');
  const loader = document.querySelector('.loader');

  loader.style.display = 'none';

  function validateUsername(username) {
    if (username.trim() === "") {
      alert("Username should not be empty");
      return false;
    }
    const regex = /^[a-zA-Z0-9][a-zA-Z0-9_-]{1,14}[a-zA-Z0-9]$/;
    const isMatching = regex.test(username);
    if (!isMatching) {
      alert("Invalid Username");
    }
    return isMatching;
  }

  async function fetchUserDetails(username) {
    try {

      loader.style.display ='block';
      searchButton.disabled = true;


      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      const targetUrl = 'https://leetcode.com/graphql/';
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const graphql = JSON.stringify({
        query: `
          query getUserProfile($username: String!) {
            allQuestionsCount {
              difficulty
              count
            }
            matchedUser(username: $username) {
              submitStatsGlobal {
                acSubmissionNum {
                  difficulty
                  count
                  submissions
                }
              }
            }
          }
        `,
        variables: { username: `${username}` }
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: graphql,
      };

      const response = await fetch(proxyUrl + targetUrl, requestOptions);

      if (!response.ok) {
        throw new Error("Unable to fetch user data");
      }

      const parsedData = await response.json();
      console.log("Logged data: ", parsedData);

      if (!parsedData.data.matchedUser) {
        statsContainer.innerHTML = "User not found.";
        return;
      }

      displayUserData(parsedData);
    } catch (error) {
      console.error(error);
      statsContainer.innerHTML = "No Data Found";
    } finally {
      loader.style.display = 'none';
      searchButton.disabled = false;
    }
  }

  function updateProgress(solved, total, label, circle) {
    const progressDegree = (solved / total) * 100;
    circle.style.setProperty("--progress-degree", `${progressDegree}%`);
    label.textContent = `${solved}/${total}`;
  }

  function displayUserData(parsedData) {
    const questionCounts = parsedData.data.allQuestionsCount;
    const acSubmissionArray = parsedData.data.matchedUser.submitStatsGlobal.acSubmissionNum;

    const totalEasyQues = questionCounts.find(q => q.difficulty === "Easy")?.count || 0;
    const totalMediumQues = questionCounts.find(q => q.difficulty === "Medium")?.count || 0;
    const totalHardQues = questionCounts.find(q => q.difficulty === "Hard")?.count || 0;

    const solvedTotalEasyQues = acSubmissionArray.find(d => d.difficulty === "Easy")?.count || 0;
    const solvedTotalMediumQues = acSubmissionArray.find(d => d.difficulty === "Medium")?.count || 0;
    const solvedTotalHardQues = acSubmissionArray.find(d => d.difficulty === "Hard")?.count || 0;

    const solvedTotalQues = acSubmissionArray.reduce((total, curr) => total + (curr.count || 0), 0);

    updateProgress(solvedTotalEasyQues, totalEasyQues, easyLabel, easyProgressCircle);
    updateProgress(solvedTotalMediumQues, totalMediumQues, mediumLabel, mediumProgressCircle);
    updateProgress(solvedTotalHardQues, totalHardQues, hardLabel, hardProgressCircle);

    const cardsData = [
      { label: "Total Problems Solved", value: solvedTotalQues },
      { label: "Easy Problems Solved", value: solvedTotalEasyQues },
      { label: "Medium Problems Solved", value: solvedTotalMediumQues },
      { label: "Hard Problems Solved", value: solvedTotalHardQues }
    ];

    statsContainer.innerHTML = cardsData.map(data => `
      <div class="card">
        <h3>${data.label}</h3>
        <p>${data.value}</p>
      </div>
    `).join('');
  }

  searchButton.addEventListener('click', function () {
    const username = usernameInput.value;
    console.log("username: ", username);
    if (validateUsername(username)) {
      fetchUserDetails(username);
    }
  });

  usernameInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
      const username = usernameInput.value;
      if (validateUsername(username)) {
        fetchUserDetails(username);
      }
    }
  });
});
