import React, { createContext, useContext, useState } from 'react';

const MapLayerContext = createContext();

export const useMapLayers = () => useContext(MapLayerContext);

export const MapLayerProvider = ({ children }) => {
    const [mapLayers, setMapLayers] = useState({
        terrainLayer: false, // 지형도
        useDistrictLayer: false, // 지적편집도
        hanBasinLayer: false, // 한강 단위유역
        hanSBasinLayer: false, // 한강 단위유역
        kumBasinLayer: false // 금강 단위유역
    });

    const toggleMapLayer = (layer) => {
        setMapLayers(prev => ({
            ...prev,
            [layer]: !prev[layer]
        }));
    };

    return (
        <MapLayerContext.Provider value={{mapLayers, toggleMapLayer}}>
            {children}
        </MapLayerContext.Provider>
    );
};
