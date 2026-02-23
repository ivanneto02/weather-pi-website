export const fetchTmpHumPreData = () => {
    const url = "https://93xdazuw09.execute-api.us-west-1.amazonaws.com/prod/samples?window=1h&samples=600";
    let response = fetch(
        url,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    ).then(response => {
        if (!response.ok) {
            console.log("Unable to retrieve data");
        }
        return response.json();
    }).then(response => {

    });
}
