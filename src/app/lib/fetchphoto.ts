async function getPhotos(name : string) {
    try {
        const response = await fetch(`/api/photo?name=${name}`);
        const data = await response.json();
        console.log(data);
        return data;
    }
    catch(error) {
        console.log("error getting photos: ", error);
        throw error;
    }
}

export default getPhotos;