import React, { useState } from "react";
import {MapLayerProvider} from "./context/MapLayerContext";
import {SearchProvider} from "./context/SearchContext";
import Layout from "./layout/Layout";
import Main from "./views/Main";
import Modal from "react-modal";
import Post from "./component/Post";

Modal.setAppElement("#root");

function App() {
    const [address, setAddress] = useState("");
    const [showModal, setShowModal] = useState(false);

    const handleAddressSelect = (address) => {
        setAddress(address);
        setShowModal(false);
    }

    return (
        <MapLayerProvider>
            <SearchProvider>
                <Layout onSearchAddress={() => setShowModal(true)}>
                    <Main address={address} />
                </Layout>
            </SearchProvider>

            <Modal
                isOpen={showModal}
                onRequestClose={() => setShowModal(false)}
                contentLabel="주소 검색"
                className="modal"
                overlayClassName="overlay"
            >
                <Post onComplete={handleAddressSelect} />
            </Modal>
        </MapLayerProvider>
    );
}

export default App;
