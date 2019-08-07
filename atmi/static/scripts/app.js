import React from 'react'
import {render} from 'react-dom'
import Game from "./demo";

render(
    <h2>Hello, World from WebPack!</h2>,
    document.getElementById("main")
)

render(
  <Game />,
  document.getElementById('root')
);
