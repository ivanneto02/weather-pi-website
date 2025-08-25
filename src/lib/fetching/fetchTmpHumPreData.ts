export const fetchTmpHumPreData = () => {
    let response = fetch(
        "https://93xdazuw09.execute-api.us-west-1.amazonaws.com/prod/samples",
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

