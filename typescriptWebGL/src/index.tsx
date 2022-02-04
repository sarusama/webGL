"use strict"
import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App/index";

const rootElement = document.getElementById("app");

ReactDOM.render(
    <div>hello
        <App />
    </div>,
    rootElement
);
