import {fromUrl} from "geotiff";

let url = "https://contigianfranco.github.io/webCDB/CDB/Titles/S55/W060/001_Elevation/L00/U0/S55W060_D001_S100_T001_L00_U0_R0.tif";
//let url = "CDB/Titles/S55/W060/001_Elevation/L00/U0/S55W060_D001_S100_T001_L00_U0_R0.tif";

async function getGeoTIFFRaster() {
    const geoTiff = await fromUrl(url);
    const geoTiffImage = await geoTiff.getImage();
    const rasterOptions = await geoTiffImage.readRasters();

    return rasterOptions[0];
}

export {getGeoTIFFRaster}