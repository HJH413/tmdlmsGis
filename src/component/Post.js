import React from "react";
import DaumPostcode from "react-daum-postcode";
import '../css/post.css';

const Post = ({ onComplete }) => {
    const complete = (data) => onComplete(data.roadAddress);

    return (
        <div>
            <DaumPostcode
                className="postmodal"
                autoClose
                onComplete={complete} />
        </div>
    );
};

export default Post;
