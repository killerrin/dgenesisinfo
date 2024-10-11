document.addEventListener("DOMContentLoaded", () => {
    // Fetch and display explorer info with latest ranking on index.html
    if (document.querySelector("#explorer-table")) {
        fetch('data/explorer_info.json')
            .then(response => response.json())
            .then(data => {
                // Function to format date to MM/DD/YYYY
                const formatDate = (dateString) => {
                    if (!dateString) return '';  // Return empty string if dateString is null
                    const date = new Date(dateString);
                    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Get month and add leading 0
                    const day = ('0' + date.getDate()).slice(-2);          // Get day and add leading 0
                    const year = date.getFullYear();                       // Get year
                    return `${month}/${day}/${year}`;                      // Return formatted date
                };

                // Extract the latest rank from the rankings array and sort by rank
                const explorersWithRanks = data.map(explorer => {
                    if (explorer.rankings && explorer.rankings.length > 0) {
                        const latestRanking = explorer.rankings.sort((a, b) => b.date_noted - a.date_noted)[0];
                        if (latestRanking.rank == 0 ) {
                            explorer.latest_rank = null;  // If no rank available
                        } else {
                            explorer.latest_rank = latestRanking.rank;
                        }
                    } else {
                        explorer.latest_rank = null;  // If no rank available
                    }
                    return explorer;
                });

                // Sort explorers by latest_rank (null ranks at the bottom)
                explorersWithRanks.sort((a, b) => {
                    if (a.latest_rank === null) return 1;
                    if (b.latest_rank === null) return -1;
                    return a.latest_rank - b.latest_rank;
                });

                // Populate the table with sorted data
                const tbody = document.querySelector("#explorer-table tbody");
                explorersWithRanks.forEach(explorer => {
                    const row = document.createElement("tr");

                    // Replace nulls with empty strings
                    const firstName = explorer.first_name || '';
                    const lastName = explorer.last_name || '';
                    const moniker = explorer.moniker || '';
                    const nationality = explorer.nationality || '';
                    const dateFirstKnown = formatDate(explorer.date_first_known);
                    const latestRank = explorer.latest_rank !== null ? explorer.latest_rank : 'N/A';
                    const nameKnown = explorer.public == "0" ? '' : '&#10004;';

                    // Populate the row, placing the Latest Rank as the first column and removing ID
                    row.innerHTML = `<td>${latestRank}</td>
                                     <td>${firstName} ${lastName}</td>
                                     <td>${nameKnown}</td>
                                     <td>${moniker}</td>
                                     <td>${nationality}</td>
                                     <td>${dateFirstKnown}</td>`;
                    
                    tbody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error fetching the explorer data:', error);
            });
    }
});

// The submitCorrection function for form submission
function submitCorrection() {
    const correctionType = document.getElementById('correction-type').value;
    const explorerName = document.getElementById('explorer-orb-name').value;
    const correctionDetails = document.getElementById('correction-details').value;
    
    // Construct the issue title and body
    const issueTitle = `Update${explorerName ? ` for ${encodeURIComponent(explorerName)}` : ''}`;
    const issueBody = `${encodeURIComponent(correctionDetails).replace(/%0A/g, '\n')}`;
    
    const githubUsername = 'sorvani'; 
    const githubRepo = 'dgenesisinfo';
    const labels = encodeURIComponent(correctionType);  // Use the correction type as a label
    
    // Construct the GitHub issue URL
    const githubIssueUrl = `https://github.com/${githubUsername}/${githubRepo}/issues/new?title=${issueTitle}&body=${issueBody}&labels=${labels}`;
    
    // Redirect user to GitHub to finalize the issue
    window.open(githubIssueUrl, '_blank');

    // Hide the form again after submission
    const formSection = document.getElementById('correction-form');
    formSection.style.display = 'none';

    // reset the form fields after submission
    document.getElementById('github-issue-form').reset();
}

// Function to show the form
function showForm() {
    const formSection = document.getElementById('correction-form');
    formSection.style.display = 'block';  // Show the form when the link is clicked
}
