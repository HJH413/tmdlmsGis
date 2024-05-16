import React, {useEffect, useState} from "react";
import {useMapLayers} from "../context/MapLayerContext";
import {useSearchContext} from "../context/SearchContext";
import axios from "axios";
import "../css/map.css";
import * as turf from "@turf/turf";

const { kakao } = window;

const Map = ({ address }) => {
    const {mapLayers} = useMapLayers();
    const {searchData, setSearchData} = useSearchContext();
    const [Map, setMap] = useState(null); // kakao map api;
    const [latitude, setLatitude] = useState(37.5832313); // 위도
    const [longitude, setLongitude] = useState(126.9800592); // 경도
    const [layers, setLayers] = useState([]); // 호출된 레이어 배열
    const [markerData, setMarkerData] = useState(null); // 위도
    const [allBasin, setAllBasin] = useState(null); // 전체 단위유역 데이터
    const [allSBasin, setAllSBasin] = useState(null); // 전체 단위유역 데이터
    const BASIN_TYPE = "basin";

    const callLayer = (layerType, layerName, strokeColor) => { // 레이어 호출
        axios.get(`/data/layer/${layerType}/${layerName}.geojson`)
            .then((response) => {
                const layer = response.data.features;
                parsingLayer(layerType, layerName, layer, strokeColor);
            });
    };

    const parsingLayer = (layerType, layerName, layer, strokeColor) => {
        let polygons = [];
        let customOverlays = [];

        layer.forEach((unit) => {
            let area = {
                name: unit.properties.BASIN,
                path: []
            };

            unit.geometry.coordinates[0].forEach((coordinates) => {
                coordinates.forEach((LatLng) => {
                    area.path.push(new kakao.maps.LatLng(LatLng[1], LatLng[0]));
                });
            });

            let polygon = displayArea(area, strokeColor, layerName.indexOf("SBasin"));
            polygons.push(polygon[0]);
            customOverlays.push(polygon[1]);
        });

        saveLayer(layerName, polygons, customOverlays);
    };

    // 다각형을 생상하고 이벤트를 등록하는 함수
    const displayArea = (area, strokeColor, zindex) => {
        let polygon = new kakao.maps.Polygon({ // 다각형 생성
            map: Map, // 다각형을 표시할 지도 객체
            path: area.path,
            strokeWeight: 4,
            strokeColor: strokeColor,
            strokeOpacity: 1,
            fillColor: 'none',
            fillOpacity: 0
        });

        // 폴리곤의 zIndex 설정
        if (zindex !== -1) {
            polygon.setZIndex(zindex);
        }

        let polygonCenter = getPolygonCenter(area.path);

        let polygonContent = `<div class="customOverlay">${area.name}</div>`;
        let customOverlay = new kakao.maps.CustomOverlay({
            position: polygonCenter,
            content: polygonContent,
            map: Map
        });

        polygon.setMap(Map);
        customOverlay.setMap(Map);

        return [polygon, customOverlay];
    };


    // 폴리곤의 중심 좌표를 계산하는 함수
    const getPolygonCenter = (path) => {
        let sumLat = 0;
        let sumLng = 0;
        let count = path.length;

        path.forEach((point) => {
            sumLat += point.getLat();
            sumLng += point.getLng();
        });

        return new kakao.maps.LatLng(sumLat / count, sumLng / count);
    };

    // 생성된 레이어를 저장하는 함수
    const saveLayer = (layerName, polygons, customOverlays) => {
        const layer = {
            layerName: layerName,
            polygons: polygons,
            overlays: customOverlays
        }

        setLayers((prev) => [...prev, layer]);

        kakao.maps.event.addListener(Map, 'zoom_changed', () => {
            fontSizeChange(Map.getLevel());
        });

        kakao.maps.event.addListener(Map, 'dragend', () => {
            fontSizeChange(Map.getLevel());
        });
    };

    const removeLayer = (layerName) => {
        layers.forEach((unitLayer, index) => {
            if (unitLayer.layerName === layerName) {
                layers[index].polygons.forEach(polygon => polygon.setMap(null));
                layers[index].overlays.forEach(overlay => overlay.setMap(null));
            }
        });
    };

    const fontSizeChange = (zoomLevel) => {
        let fontSize = zoomLevel > 11 ? 10
            : zoomLevel > 8 ? 15
            : zoomLevel > 6 ? 25
            : zoomLevel > 4 ? 35
            : 50;

        let customOverlays = document.querySelectorAll(".customOverlay");

        customOverlays.forEach(customOverlay => {
            customOverlay.style.fontSize = fontSize + "px";
        });

    };

    // 주소지로 단위유역 검색
    const searchBasin = (address) => {
        if (markerData != null) {
            markerData.setMap(null);
        }

        setSearchData(prev => ({
            ...prev,
            address: '',
            basin: '',
            sBasin: ''
        }));

        // 단위유역 전체레이어 호출

        if (allBasin === null) { 
            axios.get(`/data/layer/basin/allBasin.geojson`)
                .then((response) => {
                    const features = response.data.features;
                    setAllBasin(features);
                    performSearchBasin(address, features, true); // 데이터를 불러온 후 검색 수행
                })
                .catch((error) => {
                    console.error(error);
                });
        } else {
            performSearchBasin(address, allBasin, true); // 이미 데이터가 로드된 경우 검색 수행
        }

        // 특대유역 전체레이어 호출
        if (allSBasin === null) {
            axios.get(`/data/layer/basin/allSBasin.geojson`)
                .then((response) => {
                    const features = response.data.features;
                    setAllBasin(features);
                    performSearchBasin(address, features, false); // 데이터를 불러온 후 검색 수행
                })
                .catch((error) => {
                    console.error(error);
                });
        } else {
            performSearchBasin(address, allSBasin, false); // 이미 데이터가 로드된 경우 검색 수행
        }
    };

    const performSearchBasin = (address, features, check) => {
        // 주소-좌표 변환 객체를 생성
        let geocoder = new kakao.maps.services.Geocoder();

        // 주소로 좌표를 검색
        geocoder.addressSearch(address, function (result, status) {
            // 정상적으로 검색이 완료됐으면
            if (status === kakao.maps.services.Status.OK) {
                // 변환된 좌표를 사용하여 폴리곤 검색
                findPolygonContainingPoint([result[0].x, result[0].y], features, address, check);
            }
        });
    };


    const findPolygonContainingPoint = (point, features, address, check) => {
        removeLayer('searchBasin');
        removeLayer('searchSBasin');

        const pointGeometry = turf.point(point);
        let basinCheck = false;
        let basinName = "";
        let sBasinName = "";

        for (let unit of features) {
            const polygon = turf.polygon(unit.geometry.coordinates[0]);
            if (turf.booleanPointInPolygon(pointGeometry, polygon)) {
                let area = {
                    name: unit.properties.BASIN,
                    path: []
                };

                if (check) {
                    basinName = unit.properties.BASIN;

                    // 단위유역일때만 마커생성하도록
                    let coords = new kakao.maps.LatLng(point[1], point[0]);

                    // 결과값으로 받은 위치를 마커로 표시
                    let marker = new kakao.maps.Marker({
                        position: coords
                    });

                    marker.setMap(Map);
                    // 지도의 중심을 결과값으로 받은 위치로 이동
                    Map.setCenter(coords);
                    setMarkerData(marker);
                } else {
                    sBasinName = unit.properties.BASIN;
                }


                unit.geometry.coordinates[0].forEach((coordinates) => {
                    coordinates.forEach((LatLng) => {
                        area.path.push(new kakao.maps.LatLng(LatLng[1], LatLng[0]));
                    });
                });

                let storkColor = '#006400';
                let zindex = 10;

                if (check) { // 단위유역 설정
                    // 여기서 원하는 작업 수행
                    let polygon = displayArea(area, storkColor, zindex);
                    saveLayer('searchBasin', [polygon[0]], [polygon[1]]);
                } else {
                    storkColor = '#f80606';
                    zindex = 11;
                    // 여기서 원하는 작업 수행
                    let polygon = displayArea(area, storkColor, zindex);
                    saveLayer('searchSBasin', [polygon[0]], [polygon[1]]);
                }

                basinCheck = true;
            }

            if (basinCheck) {
                break;
            }
        }

        if (!basinCheck) {
            if (check) {
                alert("주소지에 해당하는 단위유역이 없습니다.");
            }
        } else {
            Map.setLevel(7);
            // 검색된 주소 정보를 설정
            if (check) {
                setSearchData(prev => ({
                    ...prev,
                    address: `${address}`,
                    basin: basinName
                }));
            } else {
                setSearchData(prev => ({
                    ...prev,
                    sBasin: sBasinName
                }));
            }

        }
    };

    useEffect(() => {
        document.getElementById('map').innerHTML = ""; // 위도, 경도 갱신시 기존에 생성된 지도 삭제

        if (window.navigator.geolocation) {
            window.navigator.geolocation.getCurrentPosition(
                (event) => {
                setLatitude(event.coords.latitude); // 위도 설정
                setLongitude(event.coords.longitude); // 경도 설정
            }, () => {

            });
        }

        const container = document.getElementById('map');
        const options = {
            center: new kakao.maps.LatLng(latitude, longitude),
            level: 11
        };

        const newMap = new kakao.maps.Map(container, options);
        const mapTypeControl = new kakao.maps.MapTypeControl(); // 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성
        const zoomControl = new kakao.maps.ZoomControl(); // 지도 확대 축소를 제어할 수 있는 줌 컨트롤을 생성

        // 지도 타입 컨트롤을 지도에 표시합니다
        newMap.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);
        newMap.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
        newMap.setMaxLevel(13);

        setMap(newMap);
    }, [latitude, longitude]);

    useEffect(() => {
        if (Map) {
            if (mapLayers.terrainLayer) {
                Map.addOverlayMapTypeId(kakao.maps.MapTypeId.TERRAIN);
            } else {
                Map.removeOverlayMapTypeId(kakao.maps.MapTypeId.TERRAIN);
            }
        }
    }, [mapLayers.terrainLayer]);

    useEffect(() => {
        if (Map) {
            if (mapLayers.useDistrictLayer) {
                Map.addOverlayMapTypeId(kakao.maps.MapTypeId.USE_DISTRICT);
            } else {
                Map.removeOverlayMapTypeId(kakao.maps.MapTypeId.USE_DISTRICT);
            }
        }
    }, [mapLayers.useDistrictLayer]);

    useEffect(() => {
        if (Map) {
            if (mapLayers.hanBasinLayer) {
                callLayer(BASIN_TYPE, 'hanBasin', '#03008A');
            } else {
                removeLayer('hanBasin');
            }
        }
    }, [mapLayers.hanBasinLayer]);

    useEffect(() => {
        if (Map) {
            if (mapLayers.hanSBasinLayer) {
                callLayer(BASIN_TYPE, 'hanSBasin', '#7A2147');
            } else {
                removeLayer('hanSBasin');
            }
        }
    }, [mapLayers.hanSBasinLayer]);

    useEffect(() => {
        if (Map) {
            if (mapLayers.kumBasinLayer) {
                callLayer(BASIN_TYPE, 'kumBasin', '#03008A');
            } else {
                removeLayer('kumBasin');
            }
        }
    }, [mapLayers.kumBasinLayer]);

    useEffect(() => {
        if (address) {
            searchBasin(address);
        }
    }, [address]);

    return (
        <div id="map"></div>
    );
};

export default Map;
