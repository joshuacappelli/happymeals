async function getPhotos(name : string) {
    try {
        const response = await fetch(`/api/photo?name=${name}`);
        const data = await response.json();
        return data;
    }
    catch(error) {
        throw error;
    }
}

export default getPhotos;