import CDBQuery from "./CDBQuery/CDBQuery";

function makeQuery() {
    self.onmessage = async function (e) {
        const {lat, lon, lod} = e.data;
        const start = performance.now();

        const elevationLayer = await CDBQuery.getElevationLayerDst(lat, lon, lod);
        const bathymetricLayer = await CDBQuery.getBathymetricLayerDst(lat, lon, lod);

        console.log("Query time for LOD ", lod, " was ", performance.now() - start);

        self.postMessage({
            'elevationLayer': elevationLayer,
            'bathymetricLayer': bathymetricLayer,
        });
    }
}

makeQuery()