import "../css/togle.css";
import React from "react";

const ToggleCheckbox = ({checked, toggleFunction, text}) => {
    return (
        <fieldset className={"toggleFieldset"}>
            <label>
                <input
                    role="switch"
                    type="checkbox"
                    checked={checked}
                    onChange={toggleFunction}
                />
                {text}
            </label>
        </fieldset>
    );
}

export default ToggleCheckbox;