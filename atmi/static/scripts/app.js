import React from 'react'
import {render} from 'react-dom'
//import Game from "./demo";
import IndexPage from "./index";
//import 'antd/dist/antd.css';

/* render(
    <h2>Hello, World from WebPack!</h2>,
    document.getElementById("main")
) */

render(
  //<Game />,
  <IndexPage  />,
  document.getElementById("main")
);
