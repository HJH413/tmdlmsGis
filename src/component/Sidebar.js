import React, {useState} from "react";
import ToggleCheckbox from "./ToggleCheckbox";
import {useMapLayers} from "../context/MapLayerContext";
import {useSearchContext} from "../context/SearchContext";
import "../css/sidebar.css";

const Sidebar = ({ onSearchAddress }) => {
    const {mapLayers, toggleMapLayer} = useMapLayers();
    const {searchData} = useSearchContext();
    const [isSidebarVisible, setIsSidebarVisible] = useState(true); // 사이드바 표시 상태

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };


    return (
        <div className={"sidebarMain"}>
            <div className={"sidebarToggleDiv"}>
                <ToggleCheckbox checked={isSidebarVisible} toggleFunction={toggleSidebar} text={"사이드바 표시"}/>
            </div>
            <div className={`sidebar ${!isSidebarVisible ? 'hidden' : ''}`}>
                <h2>지도 타입</h2>
                <ToggleCheckbox checked={mapLayers.terrainLayer}
                                toggleFunction={() => toggleMapLayer('terrainLayer')}
                                text={"지형도"}/>
                <ToggleCheckbox checked={mapLayers.useDistrictLayer}
                                toggleFunction={() => toggleMapLayer('useDistrictLayer')}
                                text={"지적편집도"}/>
                <h2>단위유역</h2>
                <ToggleCheckbox checked={mapLayers.hanBasinLayer}
                                toggleFunction={() => toggleMapLayer('hanBasinLayer')}
                                text={"한강 단위유역"}/>
                <ToggleCheckbox checked={mapLayers.hanSBasinLayer}
                                toggleFunction={() => toggleMapLayer('hanSBasinLayer')}
                                text={"한강 특대유역"}/>
                <ToggleCheckbox checked={false}
                                toggleFunction={() => toggleMapLayer('')}
                                text={"낙동강 단위유역"} disabled/>
                <ToggleCheckbox checked={mapLayers.kumBasinLayer}
                                toggleFunction={() => toggleMapLayer('kumBasinLayer')}
                                text={"금강 단위유역"}/>
                <ToggleCheckbox checked={false}
                                toggleFunction={() => toggleMapLayer('')}
                                text={"금강 특대유역"} disabled/>
                <ToggleCheckbox checked={false}
                                toggleFunction={() => toggleMapLayer('')}
                                text={"영산·섬진강 단위유역"} disabled/>
                <ToggleCheckbox checked={false}
                                toggleFunction={() => toggleMapLayer('')}
                                text={"진위천 단위유역"} disabled/>
                <ToggleCheckbox checked={false}
                                toggleFunction={() => toggleMapLayer('')}
                                text={"삽교천 단위유역"} disabled/>
                <h2>주소지</h2>
                <button onClick={onSearchAddress}>주소지 검색</button>
                <br/>
                <h4>검색 결과</h4>
                주소지 : <input id={"address"} type={"text"} value={searchData.address} readOnly/>
                <br/>
                단위유역 : <input id={"basin"} type={"text"} value={searchData.basin} readOnly/>
                <br/>
                특대유역 : <input id={"sBasin"} type={"text"} value={searchData.sBasin} readOnly/>
            </div>
        </div>
    );
};
export default Sidebar;
