import {hot} from "react-hot-loader/root"

// React should be bplaced after hot loader
import {createElement, Fragment} from "react"

// import Viewer from "lib/component/Viewer"
// import Router from "lib/component/Router"

import Title from "common/component/Title"

import {container} from "./application.css"

const Application = () => (
  <>
    <Title />

    <div className={container}>
      Foo
    </div>
  </>
)

export default Application |> hot
