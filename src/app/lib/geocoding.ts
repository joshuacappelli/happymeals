async function getCoordinates(address: string) {

    try {
        const response = await fetch(`/api/geocoding?address=${address}`);
        const data = await response.json();
        console.log(data);
        console.log(data.results[0].geometry.location);
        return data;
    } catch (error) {
        console.error("Error fetching coordinates:", error);
        throw error;
    }
}

export default getCoordinates;